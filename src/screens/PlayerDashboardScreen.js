import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import theme from '../theme';
import matchService from '../services/matchService';

const PlayerDashboardScreen = ({ navigation }) => {
    const { profile, signOut } = useAuth();
    const [recentMatches, setRecentMatches] = useState([]);
    const [stats, setStats] = useState({
        matches: 0,
        runs: 0,
        balls: 0,
        wickets: 0
    });
    const fetchStats = async () => {
        if (profile?.id) {
            const { stats: careerStats, error } = await matchService.getPlayerCareerStats(profile.id);
            if (careerStats) {
                setStats(careerStats);
            }
        }
        setLoading(false);
    };
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchData();
        fetchStats();
    }, []);

    const fetchData = async () => {
        if (profile?.id) {
            const { matches } = await matchService.getPlayerMatches(profile.id, 3);
            setRecentMatches(matches || []);
        }
        setLoading(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        await fetchStats();
        setRefreshing(false);
    };

    const handleSignOut = async () => {
        await signOut();
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="baseball" size={24} color={theme.colors.white} />
                    </View>
                    <Text style={styles.headerTitle}>Player Stats</Text>
                </View>

                <TouchableOpacity style={styles.profileButton} onPress={handleSignOut}>
                    <Ionicons name="log-out-outline" size={28} color={theme.colors.white} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
                }
            >
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.profileHeader}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {profile?.full_name?.charAt(0).toUpperCase() || 'P'}
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.profileName}>{profile?.full_name || 'Player Name'}</Text>
                            <Text style={styles.profileRole}>{profile?.role ? profile.role.toUpperCase() : 'PLAYER'}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.statsGrid}>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Batting</Text>
                            <Text style={styles.statValue}>{profile?.batting_style || 'N/A'}</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Bowling</Text>
                            <Text style={styles.statValue}>{profile?.bowling_type || 'N/A'}</Text>
                        </View>
                        {profile?.jersey_number && (
                            <View style={styles.statBox}>
                                <Text style={styles.statLabel}>Jersey</Text>
                                <Text style={styles.statValue}>#{profile.jersey_number}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Career Summary (Placeholder Stats for now) */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Career Summary</Text>
                </View>

                <View style={styles.summaryContainer}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>{stats.matches}</Text>
                        <Text style={styles.summaryLabel}>Matches</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>{stats.runs}</Text>
                        <Text style={styles.summaryLabel}>Runs</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>{stats.wickets}</Text>
                        <Text style={styles.summaryLabel}>Wickets</Text>
                    </View>
                </View>

                {/* Live Match Card (If player is in one) */}
                {recentMatches.find(m => m.status === 'live') && (
                    <TouchableOpacity
                        style={styles.liveMatchCard}
                        onPress={() => {
                            const liveMatch = recentMatches.find(m => m.status === 'live');
                            navigation.navigate('PlayerLiveMatch', { matchId: liveMatch.id });
                        }}
                    >
                        <View style={styles.liveHeader}>
                            <View style={styles.liveBadge}>
                                <Text style={styles.liveBadgeText}>YOUR MATCH - LIVE</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="white" />
                        </View>
                        <Text style={styles.liveMatchTitle}>
                            {recentMatches.find(m => m.status === 'live').match_name}
                        </Text>
                        <Text style={styles.liveMatchSub}>Tap to view live score</Text>
                    </TouchableOpacity>
                )}

                {/* Other Live Matches Link */}
                <TouchableOpacity
                    style={styles.globalLiveCard}
                    onPress={() => navigation.navigate('GuestDashboard')}
                >
                    <View style={styles.globalLiveContent}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="radio" size={20} color="white" />
                        </View>
                        <View style={styles.globalLiveTextContainer}>
                            <Text style={styles.globalLiveTitle}>View All Live Matches</Text>
                            <Text style={styles.globalLiveSub}>Watch scores from other ongoing games</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#1E3A5F" />
                </TouchableOpacity>

                {/* Recent Matches Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Matches</Text>
                </View>

                {recentMatches.length > 0 ? (
                    recentMatches.map((match) => (
                        <View key={match.id} style={styles.matchCard}>
                            <View style={styles.matchHeader}>
                                <Text style={styles.matchTournament}>{match.match_name}</Text>
                                <View style={[styles.statusBadge,
                                match.status === 'live' ? styles.statusLive : styles.statusFinished
                                ]}>
                                    <Text style={[styles.statusText,
                                    match.status === 'live' ? styles.statusTextLive : styles.statusTextFinished
                                    ]}>
                                        {match.status.toUpperCase()}
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.matchDetails}>
                                {formatDate(match.match_date)} • {match.location || 'Unknown Location'}
                            </Text>

                            <View style={styles.matchFooter}>
                                <Text style={styles.matchType}>{match.match_type === 'individual' ? 'Individual Match' : 'Team Match'}</Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={48} color={theme.colors.textTertiary} />
                        <Text style={styles.emptyStateText}>No matches played yet</Text>
                        <Text style={styles.emptyStateSubtext}>
                            Once you're added to a match lineup, it will appear here.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: '#1E3A5F',
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.white,
    },
    profileButton: {
        padding: 4,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    profileCard: {
        backgroundColor: theme.colors.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 4,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    profileName: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.dark,
        marginBottom: 4,
    },
    profileRole: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.primary,
        letterSpacing: 0.5,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.textTertiary,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.dark,
        textAlign: 'center',
    },
    sectionHeader: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.dark,
    },
    summaryContainer: {
        flexDirection: 'row',
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        justifyContent: 'space-between',
    },
    summaryItem: {
        alignItems: 'center',
        flex: 1,
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.dark,
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 12,
        color: theme.colors.textTertiary,
    },
    matchCard: {
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.primary,
    },
    matchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    matchTournament: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.dark,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusLive: {
        backgroundColor: '#E3F2FD',
    },
    statusFinished: {
        backgroundColor: '#F5F5F5',
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    statusTextLive: {
        color: theme.colors.primary,
    },
    statusTextFinished: {
        color: theme.colors.textSecondary,
    },
    matchDetails: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 8,
    },
    matchFooter: {
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 8,
        marginTop: 4,
    },
    matchType: {
        fontSize: 12,
        color: theme.colors.textTertiary,
        fontStyle: 'italic',
    },
    emptyState: {
        backgroundColor: theme.colors.white,
        padding: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        marginTop: 12,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: theme.colors.textTertiary,
        textAlign: 'center',
        marginTop: 4,
    },
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: theme.colors.white,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        paddingBottom: 8,
        paddingTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 8,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    navLabel: {
        fontSize: 12,
        marginTop: 4,
        color: theme.colors.textTertiary,
    },
    navLabelActive: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    liveMatchCard: {
        backgroundColor: '#1E3A5F',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
    },
    liveHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    liveBadge: {
        backgroundColor: '#EF4444',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    liveBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '800',
    },
    liveMatchTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    liveMatchSub: {
        color: '#94A3B8',
        fontSize: 12,
    },
    globalLiveCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    globalLiveContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
    },
    globalLiveTextContainer: {
        flex: 1,
    },
    globalLiveTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E3A5F',
    },
    globalLiveSub: {
        fontSize: 12,
        color: '#6B7280',
    },

});

export default PlayerDashboardScreen;
