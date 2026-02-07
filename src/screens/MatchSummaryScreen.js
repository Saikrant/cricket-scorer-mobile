import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import { useAuth } from '../contexts/AuthContext';
import matchService from '../services/matchService';

const MatchSummaryScreen = ({ navigation, route }) => {
    const { matchId } = route.params || {};
    const [standings, setStandings] = useState([]);
    const [bowlerStandings, setBowlerStandings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMatchResults();
    }, [matchId]);

    const fetchMatchResults = async () => {
        try {
            const { players, error } = await matchService.getMatchPlayers(matchId);
            if (error) {
                console.error('Error fetching results:', error);
                return;
            }

            // Sort by runs desc, then balls asc (better strike rate/efficiency)
            const sortedPlayers = [...players].sort((a, b) => {
                if (b.runs !== a.runs) return b.runs - a.runs;
                return a.balls_faced - b.balls_faced;
            });

            // Map to standings format
            const standingsData = sortedPlayers.map((p, index) => ({
                id: p.player_id,
                rank: index + 1,
                name: p.player_name,
                score: p.runs || 0,
                balls: p.balls_faced || 0,
                fours: p.fours || 0,
                sixes: p.sixes || 0,
                strikeRate: p.balls_faced > 0 ? ((p.runs / p.balls_faced) * 100).toFixed(1) : '0.0',
                label: index === 0 ? 'Winner' : index === 1 ? 'Runner Up' : `${index + 1}th Place`
            }));

            setStandings(standingsData);

            // Fetch bowling stats
            const { bowlers, error: bowlersError } = await matchService.getMatchBowlers(matchId);
            if (!bowlersError && bowlers && bowlers.length > 0) {
                // Sort by wickets desc, then economy asc
                const sortedBowlers = [...bowlers].sort((a, b) => {
                    if ((b.wickets || 0) !== (a.wickets || 0)) return (b.wickets || 0) - (a.wickets || 0);
                    const econA = (a.overs || 0) > 0 ? (a.runs_conceded || 0) / (a.overs || 1) : 0;
                    const econB = (b.overs || 0) > 0 ? (b.runs_conceded || 0) / (b.overs || 1) : 0;
                    return econA - econB;
                });

                const bowlerData = sortedBowlers.map((b, index) => ({
                    id: b.player_id,
                    rank: index + 1,
                    name: b.player_name || 'Unknown',
                    overs: b.overs || 0,
                    runs: b.runs_conceded || 0,
                    wickets: b.wickets || 0,
                    economy: (b.overs || 0) > 0 ? ((b.runs_conceded || 0) / (b.overs || 1)).toFixed(2) : '0.00',
                    label: index === 0 ? 'Best Bowler' : `${b.wickets || 0} wickets`
                }));

                setBowlerStandings(bowlerData);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Top player (Winner)
    const winner = standings.length > 0 ? standings[0] : null;

    const { profile } = useAuth();

    // ...

    const handleBackToHome = () => {
        const targetScreen = profile?.role === 'scorer' ? 'ScorerDashboard' : 'PlayerDashboard';

        // Reset to dashboard to clear stack
        navigation.reset({
            index: 0,
            routes: [{ name: targetScreen }],
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBackToHome} style={styles.backButton}>
                    <Ionicons name="close" size={24} color={theme.colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Match Summary</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Winner Hero Section */}
                {winner && (
                    <View style={styles.heroSection}>
                        <Text style={styles.leagueTitle}>SUNDAY LEAGUE • FINAL</Text>
                        <View style={styles.winnerTag}>
                            <Ionicons name="trophy" size={14} color="#F59E0B" />
                            <Text style={styles.winnerTagText}>Winner Declared</Text>
                        </View>

                        <View style={styles.winnerCard}>
                            <View style={styles.crownContainer}>
                                <Ionicons name="star" size={20} color="#F59E0B" />
                            </View>
                            <View style={styles.winnerAvatar}>
                                <Text style={styles.winnerAvatarText}>{winner.name.charAt(0)}</Text>
                            </View>

                            <Text style={styles.winnerName}>{winner.name}</Text>
                            <View style={styles.winnerScoreRow}>
                                <Text style={styles.winnerScore}>{winner.score}</Text>
                                <Text style={styles.winnerRunsLabel}>runs</Text>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.winnerStatsRow}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statVal}>{winner.balls}</Text>
                                    <Text style={styles.statLbl}>BALLS</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statVal}>{winner.fours}</Text>
                                    <Text style={styles.statLbl}>4S</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statVal}>{winner.sixes}</Text>
                                    <Text style={styles.statLbl}>6S</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statVal}>{winner.strikeRate}</Text>
                                    <Text style={styles.statLbl}>S.R.</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* Final Standings List */}
                <View style={styles.standingsSection}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Batting Leaderboard</Text>
                        <Text style={styles.viewAllText}>View Full Stats</Text>
                    </View>

                    {standings.map((item, index) => (
                        <View key={item.id} style={styles.standingRow}>
                            <Text style={styles.rankNumber}>{item.rank}</Text>
                            <View style={styles.rowAvatar}>
                                <Text style={styles.rowAvatarText}>{item.name.charAt(0)}</Text>
                            </View>
                            <View style={styles.rowInfo}>
                                <Text style={styles.rowName}>{item.name}</Text>
                                <Text style={styles.rowLabel}>{item.label}</Text>
                            </View>
                            <View style={styles.rowStats}>
                                <Text style={styles.rowScore}>{item.score}</Text>
                                <Text style={styles.rowBalls}>{item.balls} balls</Text>
                            </View>
                        </View>
                    ))}

                    {/* Bowling Leaderboard */}
                    {bowlerStandings.length > 0 && (
                        <>
                            <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
                                <Text style={styles.sectionTitle}>Bowling Leaderboard</Text>
                            </View>

                            {bowlerStandings.map((item) => (
                                <View key={`bowl-${item.id}`} style={styles.standingRow}>
                                    <Text style={styles.rankNumber}>{item.rank}</Text>
                                    <View style={[styles.rowAvatar, { backgroundColor: '#E8F5E9' }]}>
                                        <Text style={[styles.rowAvatarText, { color: '#2E7D32' }]}>{item.name.charAt(0)}</Text>
                                    </View>
                                    <View style={styles.rowInfo}>
                                        <Text style={styles.rowName}>{item.name}</Text>
                                        <Text style={styles.rowLabel}>{item.label}</Text>
                                    </View>
                                    <View style={styles.rowStats}>
                                        <Text style={styles.rowScore}>{item.wickets}/{item.runs}</Text>
                                        <Text style={styles.rowBalls}>{item.overs} ov • {item.economy} econ</Text>
                                    </View>
                                </View>
                            ))}
                        </>
                    )}
                </View>

                {/* Actions */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity style={styles.actionButtonDark}>
                        <Ionicons name="share-social-outline" size={20} color="white" />
                        <Text style={styles.actionButtonText}>Share Match Result</Text>
                    </TouchableOpacity>

                    <View style={styles.secondaryActions}>
                        <TouchableOpacity style={styles.actionButtonOutline}>
                            <Ionicons name="download-outline" size={20} color="#0F172A" />
                            <Text style={styles.actionButtonTextOutline}>PDF</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButtonOutline}>
                            <Ionicons name="document-text-outline" size={20} color="#0F172A" />
                            <Text style={styles.actionButtonTextOutline}>CSV</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={handleBackToHome}>
                        <Text style={styles.backLink}>Back to Home</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A', // Dark top
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
    heroSection: {
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 40,
        backgroundColor: '#0F172A', // Navy background for hero
    },
    leagueTitle: {
        color: '#94A3B8',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 10,
    },
    winnerTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#334155',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
        marginBottom: 24,
    },
    winnerTagText: {
        color: '#F59E0B',
        fontSize: 12,
        fontWeight: '700',
    },
    winnerCard: {
        backgroundColor: 'white',
        width: '90%',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        // Shadow for premium feel
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    crownContainer: {
        position: 'absolute',
        top: -15,
        backgroundColor: '#FFFBEB',
        padding: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'white',
    },
    winnerAvatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    winnerAvatarText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#334151',
    },
    winnerName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 4,
    },
    winnerScoreRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
        marginBottom: 16,
    },
    winnerScore: {
        fontSize: 48,
        fontWeight: '800',
        color: '#F59E0B',
    },
    winnerRunsLabel: {
        fontSize: 18,
        color: '#64748B',
        fontWeight: '500',
    },
    divider: {
        width: '80%',
        height: 2,
        backgroundColor: '#E2E8F0', // Greenish line in mockup
        marginBottom: 16,
    },
    winnerStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    statItem: {
        alignItems: 'center',
    },
    statVal: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
    },
    statLbl: {
        fontSize: 10,
        color: '#64748B',
        marginTop: 2,
        fontWeight: '600',
    },
    standingsSection: {
        backgroundColor: '#F1F5F9', // Light gray/off-white
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -30, // Overlap effect
        padding: 24,
        minHeight: 400,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
    },
    viewAllText: {
        fontSize: 12,
        color: '#F59E0B',
        fontWeight: '600',
    },
    standingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    rankNumber: {
        fontSize: 16,
        fontWeight: '700',
        color: '#94A3B8',
        width: 30,
    },
    rowAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    rowAvatarText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#475569',
    },
    rowInfo: {
        flex: 1,
    },
    rowName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
    },
    rowLabel: {
        fontSize: 12,
        color: '#64748B',
    },
    rowStats: {
        alignItems: 'flex-end',
    },
    rowScore: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
    },
    rowBalls: {
        fontSize: 11,
        color: '#64748B',
    },
    actionsContainer: {
        padding: 24,
        backgroundColor: '#F1F5F9',
    },
    actionButtonDark: {
        backgroundColor: '#0F172A',
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryActions: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    actionButtonOutline: {
        flex: 1,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    actionButtonTextOutline: {
        color: '#0F172A',
        fontWeight: '600',
        fontSize: 14,
    },
    backLink: {
        textAlign: 'center',
        color: '#64748B',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default MatchSummaryScreen;
