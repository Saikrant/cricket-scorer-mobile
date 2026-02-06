import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import theme from '../theme';
import matchService from '../services/matchService';

const GuestDashboardScreen = ({ navigation }) => {
    const { exitGuestMode } = useAuth();
    const [liveMatches, setLiveMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchLiveMatches();
    }, []);

    const fetchLiveMatches = async () => {
        const { matches } = await matchService.getLiveMatches();
        setLiveMatches(matches || []);
        setLoading(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchLiveMatches();
        setRefreshing(false);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="baseball" size={24} color="white" />
                    <Text style={styles.headerTitle}>Guest Access</Text>
                </View>
                <TouchableOpacity onPress={exitGuestMode} style={styles.exitButton}>
                    <Text style={styles.exitText}>Login</Text>
                    <Ionicons name="log-in-outline" size={20} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
            >
                <Text style={styles.sectionTitle}>Live Matches</Text>

                {liveMatches.length > 0 ? (
                    liveMatches.map((match) => (
                        <TouchableOpacity
                            key={match.id}
                            style={styles.matchCard}
                            onPress={() => navigation.navigate('PlayerLiveMatch', { matchId: match.id })}
                        >
                            <View style={styles.matchHeader}>
                                <Text style={styles.matchName}>{match.match_name}</Text>
                                <View style={styles.liveBadge}>
                                    <Text style={styles.liveText}>LIVE</Text>
                                </View>
                            </View>
                            <Text style={styles.matchDetails}>
                                {match.location} • Started at {formatDate(match.created_at)}
                            </Text>
                            <View style={styles.footer}>
                                <Text style={styles.tapText}>Tap to watch live score</Text>
                                <Ionicons name="chevron-forward" size={16} color="#6B7280" />
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="radio-outline" size={48} color="#9CA3AF" />
                        <Text style={styles.emptyText}>No live matches right now.</Text>
                        <Text style={styles.emptySub}>Check back later!</Text>
                    </View>
                )}
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
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
    exitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    exitText: {
        color: 'white',
        fontWeight: '600',
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 16,
    },
    matchCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    matchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    matchName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        flex: 1,
        marginRight: 8,
    },
    liveBadge: {
        backgroundColor: '#EF4444',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    liveText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '800',
    },
    matchDetails: {
        color: '#6B7280',
        fontSize: 14,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 12,
    },
    tapText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    emptySub: {
        marginTop: 4,
        color: '#6B7280',
    },
});

export default GuestDashboardScreen;
