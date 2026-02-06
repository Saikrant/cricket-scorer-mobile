import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import theme from '../theme';
import matchService from '../services/matchService';

const PlayerHistoryScreen = ({ navigation }) => {
    const { profile } = useAuth();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        if (profile?.id) {
            let result;
            if (profile.role === 'scorer') {
                result = await matchService.getMatches(profile.id); // Get matches I scored
            } else {
                result = await matchService.getPlayerMatches(profile.id); // Get matches I played
            }

            const { matches: history, error } = result;
            setMatches(history || []);
        }
        setLoading(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchHistory();
        setRefreshing(false);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    };

    const renderMatchItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
                <View style={[styles.badge, item.status === 'completed' ? styles.badgeFinished : styles.badgeLive]}>
                    <Text style={[styles.badgeText, item.status === 'completed' ? styles.badgeTextFinished : styles.badgeTextLive]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <Text style={styles.matchTitle}>{item.match_name}</Text>
            <Text style={styles.matchType}>{item.match_type === 'individual' ? 'Individual Match' : 'Team Match'}</Text>

            <View style={styles.divider} />

            <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => navigation.navigate('MatchSummary', { matchId: item.id })}
            >
                <Text style={styles.detailsText}>View Details</Text>
                <Ionicons name="chevron-forward" size={16} color="#4B5563" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Match History</Text>
                <Ionicons name="filter" size={20} color="white" />
            </View>

            <FlatList
                data={matches}
                renderItem={renderMatchItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No matches played yet.</Text>
                    </View>
                }
            />
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
    listContent: {
        padding: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    dateText: {
        fontSize: 12,
        color: '#6B7280',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeLive: { backgroundColor: '#DCFCE7' },
    badgeFinished: { backgroundColor: '#F3F4F6' },
    badgeText: { fontSize: 10, fontWeight: '700' },
    badgeTextLive: { color: '#166534' },
    badgeTextFinished: { color: '#4B5563' },
    matchTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 2,
    },
    matchType: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginBottom: 12,
    },
    detailsButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailsText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4B5563',
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#6B7280',
    },
});

export default PlayerHistoryScreen;
