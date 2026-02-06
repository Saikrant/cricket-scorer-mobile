import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import matchService from '../services/matchService';


const PlayerCompleteScreen = ({ navigation, route }) => {
    const { matchId, playerInfo } = route.params || {};

    const [availableBatsmen, setAvailableBatsmen] = useState([]);
    const [availableBowlers, setAvailableBowlers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedBatsmanId, setSelectedBatsmanId] = useState(null);
    const [selectedBowlerId, setSelectedBowlerId] = useState(null);

    useEffect(() => {
        fetchMatchData();
    }, [matchId]);

    const fetchMatchData = async () => {
        try {
            const { players, error } = await matchService.getMatchPlayers(matchId);
            if (error) {
                console.error('Error fetching players:', error);
                return;
            }

            // Filter for Next Batsman: Only those who fall under 'waiting' status
            // (Assumes players yet to bat have 'waiting' status)
            const batsmen = players.filter(p => p.status === 'waiting');
            setAvailableBatsmen(batsmen);

            // Bowlers: All players are eligible initially (filtering happens on selection?)
            // Or just list everyone. We will filter out the SELECTED batsman dynamically in render or selection logic if needed.
            // Actually, any player can bowl except the one batting next. 
            setAvailableBowlers(players);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartNextInnings = async () => {
        if (!selectedBatsmanId || !selectedBowlerId) {
            alert('Please select both the next batsman and a bowler.');
            return;
        }

        const nextBatsman = availableBatsmen.find(b => b.player_id === selectedBatsmanId);
        const nextBowler = availableBowlers.find(b => b.player_id === selectedBowlerId);

        if (!nextBatsman || !nextBowler) {
            alert('Invalid selection.');
            return;
        }

        // Update status of next batsman to 'batting'
        await matchService.updatePlayerStatus(matchId, nextBatsman.player_id, 'batting');

        navigation.navigate('LiveScoring', {
            matchId,
            overNumber: 1,
            bowler: nextBowler,
            batsman: nextBatsman
        });
    };

    const handleViewStats = () => {
        navigation.navigate('MatchSummary', { matchId });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Score Card */}
                <View style={styles.card}>
                    <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>INNINGS COMPLETE</Text>
                    </View>

                    <View style={styles.playerHeader}>
                        <View style={styles.avatarLarge}>
                            <Text style={styles.avatarTextLarge}>{playerInfo.name.charAt(0)}</Text>
                        </View>
                        <View>
                            <Text style={styles.playerNameLarge}>{playerInfo.name}</Text>
                            <Text style={styles.playerSubtext}>Right-hand Bat</Text>
                        </View>
                    </View>

                    <View style={styles.scoreContainer}>
                        <View>
                            <Text style={styles.scoreText}>{playerInfo.runs}</Text>
                            <Text style={styles.ballsText}>off {playerInfo.balls} balls</Text>
                        </View>
                        <View style={styles.miniStats}>
                            <View style={styles.miniStatItem}>
                                <Text style={styles.miniStatLabel}>4S</Text>
                                <Text style={styles.miniStatValue}>{playerInfo.fours}</Text>
                            </View>
                            <View style={styles.miniStatItem}>
                                <Text style={styles.miniStatLabel}>6S</Text>
                                <Text style={styles.miniStatValue}>{playerInfo.sixes}</Text>
                            </View>
                            <View style={styles.miniStatItem}>
                                <Text style={styles.miniStatLabel}>SR</Text>
                                <Text style={styles.miniStatValue}>{playerInfo.strikeRate}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.rankBadge}>
                        <Ionicons name="trophy-outline" size={14} color="#15803D" />
                        <Text style={styles.rankText}>Current Rank: 1st</Text>
                    </View>
                </View>

                {/* Next Batsman Selection */}
                <Text style={styles.sectionHeader}>SELECT NEXT BATSMAN</Text>
                <View style={styles.selectionList}>
                    {availableBatsmen.length > 0 ? availableBatsmen.map(item => (
                        <TouchableOpacity
                            key={item.player_id}
                            style={[
                                styles.selectionItem,
                                selectedBatsmanId === item.player_id && styles.selectedItem
                            ]}
                            onPress={() => setSelectedBatsmanId(item.player_id)}
                        >
                            <View style={styles.itemInfo}>
                                <View style={styles.avatarSmall}>
                                    <Text style={styles.avatarTextSmall}>{item.player_name.charAt(0)}</Text>
                                </View>
                                <View>
                                    <Text style={styles.itemName}>{item.player_name}</Text>
                                    <Text style={styles.itemSubtext}>Waiting</Text>
                                </View>
                            </View>
                            <View style={[
                                styles.radioButton,
                                selectedBatsmanId === item.player_id && styles.radioButtonSelected
                            ]}>
                                {selectedBatsmanId === item.player_id && <View style={styles.radioButtonInner} />}
                            </View>
                        </TouchableOpacity>
                    )) : (
                        <Text style={{ color: '#64748B', fontStyle: 'italic' }}>No batsmen remaining.</Text>
                    )}
                </View>

                {/* Bowler Selection */}
                <Text style={styles.sectionHeader}>SELECT BOWLER</Text>
                <View style={styles.selectionList}>
                    {availableBowlers
                        .filter(b => b.player_id !== selectedBatsmanId) // Exclude selected batsman
                        .map(item => (
                            <TouchableOpacity
                                key={item.player_id}
                                style={[
                                    styles.selectionItem,
                                    selectedBowlerId === item.player_id && styles.selectedItem
                                ]}
                                onPress={() => setSelectedBowlerId(item.player_id)}
                            >
                                <View style={styles.itemInfo}>
                                    <View style={styles.avatarSmall}>
                                        <Text style={styles.avatarTextSmall}>{item.player_name.charAt(0)}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.itemName}>{item.player_name}</Text>
                                        <Text style={styles.itemSubtext}>Bowler</Text>
                                    </View>
                                </View>
                                <View style={[
                                    styles.radioButton,
                                    selectedBowlerId === item.player_id && styles.radioButtonSelected
                                ]}>
                                    {selectedBowlerId === item.player_id && <View style={styles.radioButtonInner} />}
                                </View>
                            </TouchableOpacity>
                        ))}
                </View>

                {/* Spacer for button */}
                <View style={{ height: 100 }} />

            </ScrollView>

            {/* Bottom Button */}
            <View style={styles.footer}>
                {availableBatsmen.length > 0 ? (
                    <TouchableOpacity
                        style={[styles.primaryButton, (!selectedBatsmanId || !selectedBowlerId) && styles.buttonDisabled]}
                        disabled={!selectedBatsmanId || !selectedBowlerId}
                        onPress={handleStartNextInnings}
                    >
                        <Text style={styles.primaryButtonText}>Start Next Innings →</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleViewStats}
                    >
                        <Text style={styles.primaryButtonText}>End Match & View Results</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollContent: {
        padding: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    badgeContainer: {
        backgroundColor: '#FEF2F2',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 16,
    },
    badgeText: {
        color: '#EF4444',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    playerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
        alignSelf: 'flex-start',
        marginLeft: 10,
    },
    avatarLarge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarTextLarge: {
        fontSize: 20,
        fontWeight: '700',
        color: '#374151',
    },
    playerNameLarge: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    playerSubtext: {
        fontSize: 12,
        color: '#6B7280',
    },
    scoreContainer: {
        backgroundColor: '#0F172A',
        borderRadius: 12,
        padding: 16,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    scoreText: {
        fontSize: 32,
        fontWeight: '800',
        color: '#F59E0B',
    },
    ballsText: {
        color: '#94A3B8',
        fontSize: 12,
    },
    miniStats: {
        alignItems: 'flex-end',
        gap: 2,
    },
    miniStatItem: {
        flexDirection: 'row',
        gap: 8,
    },
    miniStatLabel: {
        color: '#94A3B8',
        fontSize: 10,
        fontWeight: '600',
        width: 20,
    },
    miniStatValue: {
        color: 'white',
        fontSize: 10,
        fontWeight: '700',
        textAlign: 'right',
        width: 30,
    },
    rankBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    rankText: {
        color: '#15803D',
        fontSize: 12,
        fontWeight: '600',
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6B7280',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    selectionList: {
        gap: 12,
        marginBottom: 24,
    },
    selectionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    selectedItem: {
        borderColor: '#F59E0B',
    },
    itemInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarSmall: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarTextSmall: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    itemSubtext: {
        fontSize: 12,
        color: '#6B7280',
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonSelected: {
        borderColor: '#F59E0B',
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#F59E0B',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    primaryButton: {
        backgroundColor: '#F59E0B',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#D1D5DB',
        opacity: 0.7,
    },
    primaryButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default PlayerCompleteScreen;
