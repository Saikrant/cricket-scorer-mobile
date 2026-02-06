import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import theme from '../theme';
import matchService from '../services/matchService';

const PlayerStatsScreen = () => {
    const { profile } = useAuth();
    const [stats, setStats] = useState({
        matches: 0,
        runs: 0,
        balls: 0,
        average: '0.0',
        strikeRate: '0.0',
        highest: 0,
        fours: 0,
        sixes: 0
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            fetchStats();
        }, [])
    );

    const fetchStats = async () => {
        if (profile?.id) {
            const { stats: careerStats, error } = await matchService.getPlayerCareerStats(profile.id);
            if (careerStats) {
                setStats(careerStats);
            }
        }
        setLoading(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Stats</Text>
                <Ionicons name="settings-outline" size={20} color="white" />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
            >
                {/* Profile Summary */}
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{profile?.full_name?.charAt(0) || 'P'}</Text>
                    </View>
                    <View>
                        <Text style={styles.profileName}>{profile?.full_name}</Text>
                        <View style={styles.roleBadge}>
                            <Text style={styles.roleText}>{profile?.role?.toUpperCase() || 'PLAYER'}</Text>
                        </View>
                    </View>
                </View>

                {/* Tabs (Visual Only for now) */}
                <View style={styles.tabRow}>
                    <View style={[styles.tab, styles.activeTab]}>
                        <Text style={[styles.tabText, styles.activeTabText]}>Overall</Text>
                    </View>
                    <View style={styles.tab}>
                        <Text style={styles.tabText}>Team</Text>
                    </View>
                    <View style={styles.tab}>
                        <Text style={styles.tabText}>Individual</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Performance Summary</Text>

                <View style={styles.grid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Matches</Text>
                        <Text style={styles.statBig}>{stats.matches}</Text>
                        <Text style={styles.statSub}>Total Played</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Total Runs</Text>
                        <Text style={styles.statBig}>{stats.runs}</Text>
                        <Text style={[styles.statSub, { color: '#10B981' }]}>Avg {stats.average}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Highest Score</Text>
                        <Text style={styles.statBig}>{stats.highest}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Strike Rate</Text>
                        <Text style={styles.statBig}>{stats.strikeRate}</Text>
                        <Text style={[styles.statSub, { color: '#10B981' }]}>runs/100 balls</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Fours</Text>
                        <Text style={styles.statBig}>{stats.fours}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Sixes</Text>
                        <Text style={styles.statBig}>{stats.sixes}</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        backgroundColor: '#1E3A5F',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
    scrollContent: {
        padding: 20,
    },
    profileCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#374151',
    },
    profileName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    roleBadge: {
        backgroundColor: '#10B981',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    roleText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '700',
    },
    tabRow: {
        flexDirection: 'row',
        backgroundColor: '#1E3A5F',
        borderRadius: 8,
        padding: 4,
        marginBottom: 24,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 6,
    },
    activeTab: {
        backgroundColor: 'white',
    },
    tabText: {
        color: '#9CA3AF',
        fontWeight: '600',
        fontSize: 12,
    },
    activeTabText: {
        color: '#1E3A5F',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 12,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        width: '48%',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    statLabel: {
        color: '#6B7280',
        fontSize: 12,
        marginBottom: 8,
    },
    statBig: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 4,
    },
    statSub: {
        fontSize: 10,
        color: '#10B981',
        fontWeight: '500',
    },
});

export default PlayerStatsScreen;
