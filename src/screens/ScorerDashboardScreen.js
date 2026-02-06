import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import matchService from '../services/matchService';
import { useFocusEffect } from '@react-navigation/native';
import theme from '../theme';

const ScorerDashboardScreen = ({ navigation }) => {
    const { profile, signOut } = useAuth();
    const [recentMatches, setRecentMatches] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    useFocusEffect(
        React.useCallback(() => {
            fetchRecentMatches();
        }, [])
    );

    const fetchRecentMatches = async () => {
        if (profile?.id) {
            const { matches, error } = await matchService.getRecentMatches(profile.id, 3);
            if (matches) {
                setRecentMatches(matches);
            }
        }
        setLoading(false);
    };

    const handleCreateMatch = () => {
        navigation.navigate('CreateMatchScreen');
    };

    const handleSignOut = async () => {
        await signOut();
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric'
        });
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
                    <Text style={styles.headerTitle}>Cricket Scorer</Text>
                </View>

                <TouchableOpacity style={styles.profileButton} onPress={handleSignOut}>
                    <Ionicons name="log-out-outline" size={28} color={theme.colors.white} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Hero Card */}
                <View style={styles.heroCard}>
                    <Text style={styles.heroTitle}>Start New Match</Text>
                    <Text style={styles.heroSubtitle}>
                        Score a professional team match or a casual individual game.
                    </Text>

                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={handleCreateMatch}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={20} color={theme.colors.dark} />
                        <Text style={styles.createButtonText}>Create Match</Text>
                    </TouchableOpacity>
                </View>

                {/* Recent Matches Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Matches</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('History')}>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {recentMatches.length > 0 ? (
                        recentMatches.map((match) => (
                            <TouchableOpacity
                                key={match.id}
                                style={styles.matchCard}
                                onPress={() => navigation.navigate('MatchSummary', { matchId: match.id })}
                            >
                                <View style={styles.matchHeader}>
                                    <Text style={styles.matchName}>{match.match_name}</Text>
                                    <Text style={styles.matchDate}>{formatDate(match.created_at)}</Text>
                                </View>
                                <Text style={styles.matchLocation}>{match.location || 'No Location'}</Text>
                                <View style={[styles.statusBadge,
                                match.status === 'live' ? styles.statusLive :
                                    match.status === 'completed' ? styles.statusCompleted : styles.statusSetup
                                ]}>
                                    <Text style={[styles.statusText,
                                    match.status === 'live' ? styles.textLive :
                                        match.status === 'completed' ? styles.textCompleted : styles.textSetup
                                    ]}>
                                        {match.status.toUpperCase()}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="trophy-outline" size={48} color={theme.colors.textTertiary} />
                            <Text style={styles.emptyStateText}>No matches yet</Text>
                            <Text style={styles.emptyStateSubtext}>
                                Create your first match to start scoring!
                            </Text>
                        </View>
                    )}
                </View>
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
    },
    heroCard: {
        backgroundColor: '#1E3A5F',
        margin: 20,
        padding: 24,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.white,
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: 20,
        marginBottom: 20,
    },
    createButton: {
        backgroundColor: '#F9A825',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        gap: 8,
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E3A5F',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.dark,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#F9A825',
    },
    emptyState: {
        backgroundColor: theme.colors.white,
        padding: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
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
    matchCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    matchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    matchName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    matchDate: {
        fontSize: 12,
        color: theme.colors.textTertiary,
    },
    matchLocation: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 12,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusSetup: { backgroundColor: '#F3F4F6' },
    statusLive: { backgroundColor: '#DCFCE7' },
    statusCompleted: { backgroundColor: '#DBEAFE' },
    statusText: { fontSize: 10, fontWeight: '700' },
    textSetup: { color: '#4B5563' },
    textLive: { color: '#166534' },
    textCompleted: { color: '#1E40AF' },
    navLabel: {
        fontSize: 12,
        marginTop: 4,
        color: theme.colors.textTertiary,
    },
    navLabelActive: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
});

export default ScorerDashboardScreen;
