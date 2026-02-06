import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import theme from '../theme';
import matchService from '../services/matchService';

const SelectBowlerScreen = ({ navigation, route }) => {
    const { matchId, overNumber = 1, lastBowlerId } = route.params || {};
    const [players, setPlayers] = useState([]);
    const [selectedBowlerId, setSelectedBowlerId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentBatsman, setCurrentBatsman] = useState(null);

    useEffect(() => {
        fetchMatchPlayers();
    }, [matchId]);

    const fetchMatchPlayers = async () => {
        try {
            const { players: allPlayers, error } = await matchService.getMatchPlayers(matchId);
            if (error) {
                Alert.alert('Error', 'Failed to load players');
                return;
            }

            // Find current batsman (status = 'batting' or 'on_strike')
            // If no one is batting (start of match), the first player is the batsman
            let batsman = allPlayers.find(p => p.status === 'batting' || p.status === 'on_strike');

            if (!batsman) {
                // If it's the very first over, assume first player is batsman ??
                // Or maybe Match Setup set the first player?
                // For "Sunday League Individual", everyone bats once.
                // We'll assume the player with status 'waiting' and lowest batting_order is next?
                // For now, let's assume one is set to 'batting'. 
                // If None, we pick the first 'waiting' one.
                batsman = allPlayers.find(p => p.status === 'waiting');

                if (batsman) {
                    // Auto-set them to batting? Or just treat as batting for logic
                    // Ideally we update DB, but for now just local logic
                }
            }

            setCurrentBatsman(batsman);

            // Filter out the current batsman from potential bowlers
            // Can't bowl to yourself!
            const eligibleBowlers = batsman
                ? allPlayers.filter(p => p.player_id !== batsman.player_id)
                : allPlayers;

            setPlayers(eligibleBowlers);
        } catch (error) {
            console.error('Error fetching match players:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartOver = () => {
        if (!selectedBowlerId) {
            Alert.alert('Select Bowler', 'Please select a bowler to start the over');
            return;
        }

        const selectedBowler = players.find(p => p.player_id === selectedBowlerId);

        navigation.navigate('LiveScoring', {
            matchId,
            overNumber,
            bowler: selectedBowler,
            batsman: currentBatsman, // Pass the batsman
        });
    };

    const renderOverSummary = () => {
        if (overNumber === 1) return null;

        // Placeholder stats for the previous over
        // In real implementation, pass these stats via route params or fetch them
        return (
            <View style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                    <Text style={styles.summaryTitle}>Over {overNumber - 1} Complete</Text>
                    <View style={styles.summaryBadge}>
                        <Text style={styles.summaryBadgeText}>COMPLETED</Text>
                    </View>
                </View>
                <View style={styles.summaryStats}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>12</Text>
                        <Text style={styles.statLabel}>Runs</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>1</Text>
                        <Text style={styles.statLabel}>Wicket</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>6.00</Text>
                        <Text style={styles.statLabel}>Econ</Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderPlayerItem = ({ item }) => {
        const isSelected = item.player_id === selectedBowlerId;
        const isLastBowler = item.player_id === lastBowlerId;

        return (
            <TouchableOpacity
                style={[
                    styles.playerItem,
                    isSelected && styles.playerItemSelected,
                    isLastBowler && styles.playerItemDisabled
                ]}
                onPress={() => !isLastBowler && setSelectedBowlerId(item.player_id)}
                disabled={isLastBowler}
                activeOpacity={0.7}
            >
                <View style={styles.playerInfo}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {item.player_name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.playerName}>{item.player_name}</Text>
                        <Text style={styles.playerRole}>{item.bowling_style || 'Right-arm Fast'}</Text>
                    </View>
                </View>

                {isSelected && (
                    <View style={styles.checkIcon}>
                        <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.dark} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Select Next</Text>
                    <Text style={styles.headerTitle}>Bowler</Text>
                </View>
            </View>

            <View style={styles.content}>
                {renderOverSummary()}

                <Text style={styles.sectionTitle}>Available Bowlers</Text>

                {loading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
                ) : (
                    <FlatList
                        data={players}
                        renderItem={renderPlayerItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.startButton, !selectedBowlerId && styles.startButtonDisabled]}
                    onPress={handleStartOver}
                    disabled={!selectedBowlerId}
                >
                    <Text style={styles.startButtonText}>Start Over {overNumber} →</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: theme.colors.white,
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.dark,
        lineHeight: 28,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    summaryCard: {
        backgroundColor: '#1E3A5F',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    summaryTitle: {
        color: theme.colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    summaryBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    summaryBadgeText: {
        color: theme.colors.white,
        fontSize: 10,
        fontWeight: '700',
    },
    summaryStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        color: theme.colors.white,
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        marginBottom: 12,
    },
    listContainer: {
        gap: 12,
        paddingBottom: 20,
    },
    playerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.white,
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    playerItemSelected: {
        borderColor: '#F9A825',
        backgroundColor: '#FFFDE7',
    },
    playerItemDisabled: {
        opacity: 0.5,
        backgroundColor: '#F0F0F0',
    },
    playerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: theme.colors.primary,
        fontSize: 18,
        fontWeight: '700',
    },
    playerName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.dark,
        marginBottom: 2,
    },
    playerRole: {
        fontSize: 13,
        color: theme.colors.textTertiary,
    },
    checkIcon: {
        marginRight: 4,
    },
    loader: {
        marginTop: 40,
    },
    footer: {
        padding: 20,
        backgroundColor: theme.colors.white,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    startButton: {
        backgroundColor: '#F9A825',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    startButtonDisabled: {
        backgroundColor: '#E0E0E0',
    },
    startButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E3A5F',
    },
});

export default SelectBowlerScreen;
