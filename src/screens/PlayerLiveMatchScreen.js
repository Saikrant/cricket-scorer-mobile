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

        // Fetch match players to find current strikers and their scores
        // In a real app we'd have a 'balls' table or 'match_state' table. 
        // Here we infer state from 'match_players' (who is batting) and aggregated runs.

        try {
            const { players } = await matchService.getMatchPlayers(matchId);
            const { match } = await matchService.getMatch(matchId);

            if (players && match) {
                // Determine current batsman
                const striker = players.find(p => p.status === 'batting');
                const nonStriker = players.find(p => p.status === 'batting' && p.player_id !== striker?.player_id); // In individual mode usually just 1

                // Calculate match total score (sum of all runs)
                const totalRuns = players.reduce((sum, p) => sum + (p.runs || 0), 0);

                setMatchData({
                    striker,
                    totalRuns,
                    matchName: match.match_name,
                    overs: 0, // Simplified, hard to calculate total overs without ball-by-ball table in this view
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
                        <Text style={styles.bigScore}>{matchData.totalRuns}</Text>
                        <Text style={styles.runsLabel}>RUNS</Text>
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
