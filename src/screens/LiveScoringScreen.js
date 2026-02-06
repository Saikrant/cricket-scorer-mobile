import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Alert,
    Modal,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import matchService from '../services/matchService';

const LiveScoringScreen = ({ navigation, route }) => {
    const { matchId, overNumber, bowler: initialBowler, batsman: initialBatsman } = route.params || {};

    const [striker, setStriker] = useState(initialBatsman || null);
    const [bowler, setBowler] = useState(initialBowler || null);

    // Live Stats State
    // We assume incoming params are "fresh", or we fetch? 
    // ideally we should fetch fresh stats on mount
    const [stats, setStats] = useState({
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        isOut: false
    });

    const [currentOver, setCurrentOver] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showOverComplete, setShowOverComplete] = useState(false);

    // Limits
    const OVERS_PER_BATSMAN = 2;

    // Target Logic
    const [isLastBatsman, setIsLastBatsman] = useState(false);
    const [targetScore, setTargetScore] = useState(null);

    useEffect(() => {
        const checkMatchStatus = async () => {
            // Fetch all players to see if this is the last batsman
            // and calculate target if so.
            const { players, error } = await matchService.getMatchPlayers(matchId);
            if (error || !players) return;

            // Check for players waiting to bat
            // (Exclude current batsman who is 'batting' or 'on_strike')
            const waitingPlayers = players.filter(p => p.status === 'waiting');

            if (waitingPlayers.length === 0) {
                setIsLastBatsman(true);

                // Calculate Target: Highest score among OTHERS + 1
                const otherPlayers = players.filter(p => p.player_id !== striker?.player_id);
                if (otherPlayers.length > 0) {
                    // Find max runs
                    const maxRuns = Math.max(...otherPlayers.map(p => p.runs || 0));
                    setTargetScore(maxRuns + 1);
                } else {
                    // First player? No target.
                    setTargetScore(null);
                }
            }
        };

        if (striker) checkMatchStatus();
    }, [matchId, striker]);

    useEffect(() => {
        // Initialize stats from passed striker object if available
        if (striker) {
            setStats({
                runs: striker.runs || 0,
                balls: striker.balls_faced || 0,
                fours: striker.fours || 0,
                sixes: striker.sixes || 0,
                isOut: false
            });
            // Also ensure their status is 'batting' in DB? 
            // We'll do it lazily on first ball or assume setup did it.
        }
    }, [striker]);

    const handleScore = async (runValue, isExtra = false, extraType = null, isWicket = false) => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const ballValue = isWicket ? 'W' :
                isExtra ? (extraType === 'wd' ? 'wd' : 'nb') :
                    runValue.toString();

            const ballType = isWicket ? 'wicket' :
                isExtra ? 'extra' :
                    (runValue === 4 || runValue === 6 ? 'boundary' : 'run');

            // 1. Update Local Batting Stats
            const newRuns = runValue + (isExtra ? 1 : 0); // Wide/NB gives 1 run usually
            // NOTE: In indivual scoring, do we count wide runs for batsman? Usually NO.
            // But we count them for the TOTAL score.
            // For this specific 'Individual' mode request, let's keep it simple:
            // Extras add to batsman's score? NO. Extras are extras.
            // But for "Sunday League" simplified, maybe they do?
            // Let's stick to standard: Runs off bat go to batsman. Extras go to extras (bowler concedes).

            const batsmanRuns = isExtra ? 0 : runValue;
            const validBall = !isExtra; // Wides/NB don't count as balls faced typically

            const updatedStats = {
                runs: stats.runs + batsmanRuns,
                balls: stats.balls + (validBall ? 1 : 0),
                fours: stats.fours + (runValue === 4 ? 1 : 0),
                sixes: stats.sixes + (runValue === 6 ? 1 : 0),
                isOut: isWicket
            };

            setStats(updatedStats);

            // 2. Add to Over History
            const newBall = {
                value: ballValue,
                type: ballType
            };
            const updatedOver = [...currentOver, newBall];
            setCurrentOver(updatedOver);

            // 3. Update DB - Batting
            await matchService.updateBattingStats(matchId, striker.player_id, {
                runs: updatedStats.runs,
                balls_faced: updatedStats.balls,
                fours: updatedStats.fours,
                sixes: updatedStats.sixes,
                status: isWicket ? 'out' : 'batting' // Update status if out
            });

            // Check TARGET WIN condition immediately
            if (isLastBatsman && targetScore !== null && updatedStats.runs >= targetScore) {
                Alert.alert(
                    "🎉 Match Won!",
                    `Result: ${striker.player_name} wins by scoring ${updatedStats.runs} runs!`,
                    [
                        {
                            text: "View Summary",
                            onPress: () => navigation.navigate('MatchSummary', { matchId })
                        }
                    ]
                );
                return; // Stop processing, match over
            }

            // 4. Update DB - Bowling (Simplified)
            // Need to fetch current bowler stats first to increment? 
            // For now just fire-and-forget logic if we had increment capability
            // Or we just track local overs and push?
            // Let's skip heavy bowler updates for this pass to keep it fast, 
            // or just log the ball if we had a ball-by-ball table.

            // 5. Check Game Flow
            if (isWicket) {
                // Batsman OUT -> End Innings
                setTimeout(() => {
                    if (isLastBatsman) {
                        // Last man out -> Match Over
                        navigation.navigate('MatchSummary', { matchId });
                    } else {
                        finishInnings(updatedStats);
                    }
                }, 500);
            } else {
                // Check Over Completion
                // Count legal balls only
                const legalBalls = updatedOver.filter(b => b.value !== 'wd' && b.value !== 'nb').length;

                if (legalBalls >= 6) {
                    // Over Complete
                    setTimeout(() => {
                        handleOverComplete(updatedStats);
                    }, 500);
                }
            }

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to score ball');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOverComplete = (currentStats) => {
        // Check if Max Overs reached
        // Calculate total overs bowled to this batsman?
        // Current overNumber passed from SelectBowler.
        // Assuming 1st over is overNumber=1.

        // If "Individual" mode usually implies fixed overs per player (e.g. 2).
        if (overNumber >= OVERS_PER_BATSMAN) {
            if (isLastBatsman) {
                // Last man finished overs -> Match Over
                navigation.navigate('MatchSummary', { matchId });
            } else {
                finishInnings(currentStats);
            }
            return;
        }

        setShowOverComplete(true);
    };

    const finishInnings = (finalStats) => {
        // Navigate to Player Complete
        navigation.navigate('PlayerComplete', {
            matchId,
            playerInfo: {
                ...striker,
                name: striker.player_name,
                runs: finalStats.runs,
                balls: finalStats.balls,
                fours: finalStats.fours,
                sixes: finalStats.sixes,
                strikeRate: finalStats.balls > 0 ? ((finalStats.runs / finalStats.balls) * 100).toFixed(1) : 0,
                isOut: finalStats.isOut
            }
        });
    };

    const startNextOver = () => {
        setShowOverComplete(false);
        // Navigate back to Select Bowler for the next over
        // Pass current batsman details back so we resume with correct stats?
        // Actually SelectBowler usually just picks bowler. 
        // We need to persist the batsman's state? 
        // The DB has the state! 'batting' status.
        // So SelectBowler will refetch and see this player is still batting.
        navigation.navigate('SelectBowler', {
            matchId,
            overNumber: overNumber + 1
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Sunday League</Text>
                    <View style={styles.matchTypeTag}>
                        <Text style={styles.matchTypeText}>INDIVIDUAL</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.rankingsButton} onPress={() => navigation.navigate('MatchSummary', { matchId })}>
                    <Ionicons name="trophy-outline" size={16} color={theme.colors.white} />
                    <Text style={styles.rankingsButtonText}>Rankings</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {/* Batman Card */}
                <View style={styles.card}>
                    <View style={styles.strikerHeader}>
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>{striker?.player_name?.charAt(0) || '?'}</Text>
                        </View>
                        <Text style={styles.strikerName}>{striker?.player_name || 'Select Batsman'}</Text>
                        <Text style={styles.strikerStatus}>On Strike</Text>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>RUNS</Text>
                            <Text style={styles.statValue}>{stats.runs}</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>BALLS</Text>
                            <Text style={styles.statValue}>{stats.balls}</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>S.R.</Text>
                            <Text style={styles.statValue}>
                                {stats.balls > 0 ? ((stats.runs / stats.balls) * 100).toFixed(1) : '0.0'}
                            </Text>
                        </View>
                    </View>

                    {isLastBatsman && targetScore !== null && (
                        <View style={styles.targetContainer}>
                            <Text style={styles.targetText}>Target to Win: {targetScore}</Text>
                            <Text style={styles.targetSubtext}>
                                Needs {Math.max(0, targetScore - stats.runs)} runs more
                            </Text>
                        </View>
                    )}

                    <Text style={styles.oversRemaining}>
                        {OVERS_PER_BATSMAN - overNumber + 1} overs remaining
                    </Text>
                </View>

                {/* Bowler Card */}
                <View style={styles.bowlerCard}>
                    <View style={styles.bowlerInfo}>
                        <View style={styles.smallAvatar}>
                            <Text style={styles.smallAvatarText}>{bowler?.player_name?.charAt(0) || 'B'}</Text>
                        </View>
                        <View>
                            <Text style={styles.bowlerName}>{bowler?.player_name || 'Unknown Bowler'}</Text>
                            <Text style={styles.bowlerType}>{bowler?.bowling_style || 'Right-arm Fast'}</Text>
                        </View>
                    </View>
                    <View style={styles.bowlerStats}>
                        <Text style={styles.bowlerFigures}>Over {overNumber}</Text>
                    </View>
                </View>

                {/* Current Over */}
                <View style={styles.overSection}>
                    <Text style={styles.overLabel}>THIS OVER</Text>
                    <View style={styles.ballsContainer}>
                        {currentOver.map((ball, index) => (
                            <View key={index} style={[
                                styles.ballBubble,
                                ball.value === '4' && styles.ballFour,
                                ball.value === '6' && styles.ballSix,
                                ball.value === 'W' && styles.ballWicket
                            ]}>
                                <Text style={styles.ballText}>{ball.value}</Text>
                            </View>
                        ))}
                        {[...Array(Math.max(0, 6 - currentOver.length))].map((_, i) => (
                            <View key={`empty-${i}`} style={styles.emptyBall} />
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Controls */}
            <View style={styles.controlsContainer}>
                {/* Row 1 */}
                <View style={styles.controlsRow}>
                    <TouchableOpacity style={styles.controlBtnLight} onPress={() => handleScore(1, true, 'wd')}>
                        <Text style={styles.controlBtnTextDark}>Wide</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.controlBtnLight} onPress={() => handleScore(1, true, 'nb')}>
                        <Text style={styles.controlBtnTextDark}>No Ball</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.undoBtn} onPress={() => setCurrentOver(currentOver.slice(0, -1))}>
                        <Ionicons name="refresh" size={24} color={theme.colors.white} />
                    </TouchableOpacity>
                </View>

                {/* Row 2 */}
                <View style={styles.controlsRow}>
                    {[0, 1, 2, 3].map(run => (
                        <TouchableOpacity
                            key={run}
                            style={styles.controlBtnGreen}
                            onPress={() => handleScore(run)}
                        >
                            <Text style={styles.controlBtnTextWhite}>{run}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Row 3 */}
                <View style={styles.controlsRow}>
                    <TouchableOpacity style={styles.controlBtnYellow} onPress={() => handleScore(4)}>
                        <Text style={styles.controlBtnTextWhite}>4</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.controlBtnBlue} onPress={() => handleScore(6)}>
                        <Text style={styles.controlBtnTextWhite}>6</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.controlBtnRed} onPress={() => handleScore(0, false, null, true)}>
                        <Text style={styles.controlBtnTextWhite}>WICKET</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Over Complete Modal */}
            <Modal
                visible={showOverComplete}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Over {overNumber} Complete</Text>

                        <View style={styles.modalStats}>
                            <View style={styles.modalStatItem}>
                                <Text style={styles.modalStatValue}>
                                    {currentOver.reduce((sum, ball) => {
                                        return sum + (ball.value === 'W' ? 0 :
                                            ball.value === 'wd' || ball.value === 'nb' ? 1 :
                                                parseInt(ball.value));
                                    }, 0)}
                                </Text>
                                <Text style={styles.modalStatLabel}>Runs</Text>
                            </View>
                            <View style={styles.modalDivider} />
                            <View style={styles.modalStatItem}>
                                <Text style={styles.modalStatValue}>
                                    {currentOver.filter(b => b.value === 'W').length}
                                </Text>
                                <Text style={styles.modalStatLabel}>Wickets</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.modalButton} onPress={startNextOver}>
                            <Text style={styles.modalButtonText}>Start Over {overNumber + 1} →</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#0F172A',
    },
    headerTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    matchTypeTag: {
        backgroundColor: '#334155',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 2,
        alignSelf: 'center',
    },
    matchTypeText: {
        color: '#94A3B8',
        fontSize: 10,
        fontWeight: '600',
    },
    rankingsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
        borderWidth: 1,
        borderColor: '#334155',
    },
    rankingsButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        alignItems: 'center',
    },
    strikerHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#475569',
    },
    strikerName: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 4,
    },
    strikerStatus: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    statBox: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '600',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#F59E0B',
    },
    targetContainer: {
        marginTop: 10,
        marginBottom: 5,
        alignItems: 'center',
        backgroundColor: '#DCFCE7',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    targetText: {
        color: '#15803D',
        fontWeight: '700',
        fontSize: 14,
    },
    targetSubtext: {
        color: '#166534',
        fontSize: 10,
    },
    oversRemaining: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    bowlerCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    bowlerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    smallAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    smallAvatarText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#475569',
    },
    bowlerName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
    },
    bowlerType: {
        fontSize: 12,
        color: '#64748B',
    },
    bowlerStats: {
        alignItems: 'flex-end',
    },
    bowlerFigures: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0F172A',
    },
    overSection: {
        alignItems: 'center',
    },
    overLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94A3B8',
        marginBottom: 12,
        letterSpacing: 1,
    },
    ballsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    ballBubble: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ballFour: {
        backgroundColor: '#F59E0B',
    },
    ballSix: {
        backgroundColor: '#0F172A',
    },
    ballWicket: {
        backgroundColor: '#DC2626',
    },
    ballText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },
    emptyBall: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#334155',
        borderStyle: 'dashed',
    },
    controlsContainer: {
        padding: 16,
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        gap: 12,
    },
    controlsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    controlBtnLight: {
        flex: 1,
        backgroundColor: '#FFF7ED',
        borderWidth: 1,
        borderColor: '#FDBA74',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    controlBtnTextDark: {
        color: '#9A3412',
        fontWeight: '700',
        fontSize: 14,
    },
    undoBtn: {
        width: 50,
        backgroundColor: '#2E7D32',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlBtnGreen: {
        flex: 1,
        backgroundColor: '#2E7D32',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
    },
    controlBtnTextWhite: {
        color: 'white',
        fontWeight: '700',
        fontSize: 20,
    },
    controlBtnYellow: {
        flex: 1,
        backgroundColor: '#F59E0B',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
    },
    controlBtnBlue: {
        flex: 1,
        backgroundColor: '#0F172A',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
    },
    controlBtnRed: {
        flex: 2,
        backgroundColor: '#C23B22',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCard: {
        backgroundColor: 'white',
        width: '80%',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 20,
    },
    modalStats: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 30,
        marginBottom: 30,
    },
    modalStatItem: {
        alignItems: 'center',
    },
    modalStatValue: {
        fontSize: 32,
        fontWeight: '800',
        color: '#0F172A',
    },
    modalStatLabel: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
    },
    modalDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#E2E8F0',
    },
    modalButton: {
        backgroundColor: '#F59E0B',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default LiveScoringScreen;
