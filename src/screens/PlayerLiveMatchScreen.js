import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import matchService from '../services/matchService';

const PlayerLiveMatchScreen = ({ route, navigation }) => {
    const { matchId } = route.params || {};
    const [loading, setLoading] = useState(true);
    const [matchData, setMatchData] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        fetchLiveScore();
        const interval = setInterval(fetchLiveScore, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [matchId]);

    const fetchLiveScore = async () => {
        if (!matchId) return;

        try {
            const { players } = await matchService.getMatchPlayers(matchId);
            const { bowlers } = await matchService.getMatchBowlers(matchId);
            const { match } = await matchService.getMatch(matchId);

            if (players && match) {
                // Determine current batsman
                const striker = players.find(p => p.status === 'batting');

                // Calculate match stats
                const totalRuns = players.reduce((sum, p) => sum + (p.runs || 0), 0);
                const wickets = players.filter(p => p.status === 'out').length;

                // Calculate overs from bowling stats
                let totalLegalBalls = 0;
                if (bowlers) {
                    bowlers.forEach(b => {
                        // total balls bowled = (overs * 6) + (balls % 6) ideally, 
                        // but let's assume 'overs' is stored as e.g. 1.2 (1 over 2 balls)
                        // This might be tricky if stored as float.
                        // Let's assume the scorer updates 'overs' as a string or float like 10.3
                        const ov = b.overs || 0;
                        const wholeOvers = Math.floor(ov);
                        const extraBalls = Math.round((ov - wholeOvers) * 10);
                        totalLegalBalls += (wholeOvers * 6) + extraBalls;
                    });
                }

                const currentOvers = `${Math.floor(totalLegalBalls / 6)}.${totalLegalBalls % 6}`;

                setMatchData({
                    striker,
                    totalRuns,
                    wickets,
                    currentOvers,
                    matchName: match.match_name,
                });
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!matchData) {
        return (
            <View style={styles.center}>
                <Text>Loading live score...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="radio-outline" size={24} color="#EF4444" />
                <Text style={styles.liveText}>LIVE</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.scoreCard}>
                    <Text style={styles.matchName}>{matchData.matchName}</Text>

                    <View style={styles.scoreRow}>
                        <Text style={styles.bigScore}>
                            {matchData.totalRuns}/{matchData.wickets}
                        </Text>
                        <Text style={styles.oversLabel}>
                            ({matchData.currentOvers} Overs)
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionLabel}>CURRENT BATSMAN</Text>
                    {matchData.striker ? (
                        <View style={styles.batsmanRow}>
                            <View>
                                <Text style={styles.batsmanName}>{matchData.striker.player_name}</Text>
                                <Text style={styles.batsmanStatus}>On Strike</Text>
                            </View>
                            <View style={styles.batsmanStats}>
                                <Text style={styles.statVal}>{matchData.striker.runs}</Text>
                                <Text style={styles.statLbl}>({matchData.striker.balls_faced})</Text>
                            </View>
                        </View>
                    ) : (
                        <Text style={styles.waitingText}>Waiting for next batsman...</Text>
                    )}
                </View>

                <Text style={styles.lastUpdated}>
                    Last updated: {lastUpdated.toLocaleTimeString()}
                </Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
        paddingBottom: 20,
        gap: 8,
    },
    liveText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 1,
    },
    content: {
        padding: 20,
    },
    scoreCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
    },
    matchName: {
        fontSize: 16,
        color: '#64748B',
        fontWeight: '600',
        marginBottom: 16,
    },
    scoreRow: {
        alignItems: 'center',
        marginBottom: 24,
    },
    bigScore: {
        fontSize: 64,
        fontWeight: '800',
        color: '#0F172A',
        lineHeight: 64,
    },
    oversLabel: {
        fontSize: 20,
        fontWeight: '600',
        color: '#64748B',
        marginTop: 4,
    },
    runsLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#94A3B8',
        letterSpacing: 2,
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#E2E8F0',
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
        marginBottom: 12,
        alignSelf: 'flex-start',
    },
    batsmanRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 12,
    },
    batsmanName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
    },
    batsmanStatus: {
        fontSize: 12,
        color: '#15803D',
        fontWeight: '600',
        marginTop: 4,
    },
    batsmanStats: {
        alignItems: 'flex-end',
    },
    statVal: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0F172A',
    },
    statLbl: {
        fontSize: 14,
        color: '#64748B',
    },
    waitingText: {
        color: '#64748B',
        fontStyle: 'italic',
    },
    lastUpdated: {
        textAlign: 'center',
        color: '#475569',
        marginTop: 20,
        fontSize: 12,
    },
});

export default PlayerLiveMatchScreen;
