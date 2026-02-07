import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import Button from '../components/Button';
import theme from '../theme';
import matchService from '../services/matchService';

const MatchSetupScreen = ({ navigation, route }) => {
    const { matchDetails, selectedTemplate } = route.params;
    const { user, profile } = useAuth();

    const [oversPerPlayer, setOversPerPlayer] = useState(selectedTemplate?.overs_per_player || 2);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const [availablePlayers, setAvailablePlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [saveAsTemplate, setSaveAsTemplate] = useState(false);
    const [templateName, setTemplateName] = useState('');

    const totalOvers = oversPerPlayer * selectedPlayers.length;

    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, batting_style, bowling_type, role, is_onboarded')
                .eq('role', 'player')
                .order('full_name', { ascending: true });

            if (error) throw error;
            const playersData = data || [];
            setAvailablePlayers(playersData);

            // Pre-select players from template if available
            if (selectedTemplate?.player_ids && selectedTemplate.player_ids.length > 0) {
                const templatePlayers = selectedTemplate.player_ids
                    .map((id, index) => {
                        const player = playersData.find(p => p.id === id);
                        if (player) {
                            return { ...player, battingOrder: index + 1 };
                        }
                        return null;
                    })
                    .filter(Boolean);
                setSelectedPlayers(templatePlayers);
            }
        } catch (error) {
            console.error('Error fetching players:', error);
            Alert.alert('Error', 'Failed to load players');
        } finally {
            setLoading(false);
        }
    };

    const addPlayer = (player) => {
        if (selectedPlayers.find(p => p.id === player.id)) {
            Alert.alert('Already Added', 'This player is already in the batting order');
            return;
        }

        setSelectedPlayers([...selectedPlayers, {
            ...player,
            battingOrder: selectedPlayers.length + 1,
        }]);
        setSearchQuery('');
    };

    const removePlayer = (playerId) => {
        const updated = selectedPlayers
            .filter(p => p.id !== playerId)
            .map((p, index) => ({ ...p, battingOrder: index + 1 }));
        setSelectedPlayers(updated);
    };

    const movePlayer = (fromIndex, toIndex) => {
        const updated = [...selectedPlayers];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        const reordered = updated.map((p, index) => ({ ...p, battingOrder: index + 1 }));
        setSelectedPlayers(reordered);
    };

    const handleStartMatch = async () => {
        if (selectedPlayers.length < 2) {
            Alert.alert('Not Enough Players', 'Please add at least 2 players to start the match');
            return;
        }

        setCreating(true);

        try {
            // Create match
            const { match, error } = await matchService.createMatch({
                ...matchDetails,
                scorer_id: user.id,
                overs_per_player: oversPerPlayer,
                total_overs: totalOvers,
            });

            if (error || !match) {
                throw new Error(error || 'Failed to create match');
            }

            // Add players to match
            const playersToAdd = selectedPlayers.map((player, index) => ({
                player_id: player.id,
                player_name: player.full_name,
                batting_order: index + 1,
            }));

            const { error: playersError } = await matchService.addMatchPlayers(match.id, playersToAdd);

            if (playersError) {
                throw new Error(playersError);
            }

            // Save as template if toggled
            if (saveAsTemplate && templateName.trim() && profile?.id) {
                await matchService.saveMatchTemplate(profile.id, templateName.trim(), {
                    match_name: matchDetails.match_name,
                    location: matchDetails.location,
                    overs_per_player: oversPerPlayer,
                    player_ids: selectedPlayers.map(p => p.id),
                    player_names: selectedPlayers.map(p => p.full_name),
                });
            }

            // Navigate to Select Bowler for the first over
            navigation.replace('SelectBowler', {
                matchId: match.id,
                overNumber: 1,
            });

        } catch (error) {
            console.error('Create match error:', error);
            Alert.alert('Error', error.message || 'Failed to create match');
        } finally {
            setCreating(false);
        }
    };

    const filteredPlayers = availablePlayers
        .filter(player => !selectedPlayers.find(p => p.id === player.id))
        .filter(player =>
            player.full_name.toLowerCase().includes(searchQuery.toLowerCase())
        );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.dark} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Match</Text>
                    <Text style={styles.headerTitle}>Setup</Text>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Overs Per Player */}
                <View style={styles.oversSection}>
                    <View>
                        <Text style={styles.oversLabel}>Overs Per Player</Text>
                        <Text style={styles.oversSubtext}>Determines total overs</Text>
                    </View>

                    <View style={styles.oversControl}>
                        <TouchableOpacity
                            style={styles.oversButton}
                            onPress={() => setOversPerPlayer(Math.max(1, oversPerPlayer - 1))}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="remove" size={20} color={theme.colors.dark} />
                        </TouchableOpacity>

                        <View style={styles.oversValueContainer}>
                            <Text style={styles.oversValue}>{oversPerPlayer}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.oversButton}
                            onPress={() => setOversPerPlayer(oversPerPlayer + 1)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="add" size={20} color={theme.colors.dark} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Save as Template Toggle */}
                <TouchableOpacity
                    style={styles.saveTemplateToggle}
                    onPress={() => setSaveAsTemplate(!saveAsTemplate)}
                >
                    <Ionicons
                        name={saveAsTemplate ? "checkbox" : "square-outline"}
                        size={24}
                        color={saveAsTemplate ? theme.colors.primary : theme.colors.textTertiary}
                    />
                    <Text style={styles.saveTemplateLabel}>Save this lineup as a template</Text>
                </TouchableOpacity>

                {saveAsTemplate && (
                    <View style={styles.templateNameInput}>
                        <TextInput
                            style={styles.templateTextInput}
                            placeholder="Template name (e.g. Sunday Squad)"
                            value={templateName}
                            onChangeText={setTemplateName}
                            placeholderTextColor={theme.colors.textTertiary}
                        />
                    </View>
                )}

                {/* Total Overs Display */}
                <View style={styles.totalOversContainer}>
                    <Text style={styles.totalOversLabel}>Calculated Total Overs</Text>
                    <Text style={styles.totalOversValue}>{totalOvers}</Text>
                </View>

                {/* Batting Order Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Batting Order</Text>
                        <Text style={styles.playerCount}>{selectedPlayers.length} Players Added</Text>
                    </View>

                    {/* Search/Add Player */}
                    <View style={styles.addPlayerRow}>
                        <View style={styles.searchContainer}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search players or browse all..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>

                        {/* Show players when searching OR when input is focused but empty */}
                        <View style={styles.searchResults}>
                            {loading ? (
                                <ActivityIndicator size="small" color={theme.colors.primary} />
                            ) : filteredPlayers.length > 0 ? (
                                <ScrollView style={styles.scrollableResults} nestedScrollEnabled>
                                    {filteredPlayers.slice(0, searchQuery ? 5 : 10).map(player => (
                                        <TouchableOpacity
                                            key={player.id}
                                            style={styles.searchResultItem}
                                            onPress={() => addPlayer(player)}
                                        >
                                            <Text style={styles.searchResultName}>{player.full_name}</Text>
                                            <Text style={styles.searchResultDetail}>
                                                {player.batting_style} • {player.bowling_type}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            ) : (
                                <Text style={styles.noResults}>No more players found</Text>
                            )}
                        </View>
                    </View>

                    {/* Selected Players List */}
                    {selectedPlayers.length > 0 ? (
                        <View style={styles.playersList}>
                            {selectedPlayers.map((player, index) => (
                                <View key={player.id} style={styles.playerItem}>
                                    <View style={styles.dragHandle}>
                                        <Ionicons name="menu" size={20} color={theme.colors.textTertiary} />
                                    </View>

                                    <View style={styles.playerAvatar}>
                                        <Text style={styles.playerInitial}>
                                            {player.full_name.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>

                                    <View style={styles.playerInfo}>
                                        <Text style={styles.playerName}>{player.full_name}</Text>
                                        <Text style={styles.playerRank}>Rank {player.battingOrder}</Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => removePlayer(player.id)}
                                        style={styles.removeButton}
                                    >
                                        <Ionicons name="close" size={20} color={theme.colors.textTertiary} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyPlayers}>
                            <Ionicons name="people-outline" size={48} color={theme.colors.textTertiary} />
                            <Text style={styles.emptyText}>No players added yet</Text>
                            <Text style={styles.emptySubtext}>Search and add players to continue</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Start Match Button */}
            <View style={styles.footer}>
                <Button
                    title="Start Match"
                    onPress={handleStartMatch}
                    variant="primary"
                    size="large"
                    loading={creating}
                    leftIcon={<Ionicons name="play" size={20} color={theme.colors.white} />}
                    style={styles.startButton}
                />
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
    },

    oversSection: {
        backgroundColor: theme.colors.white,
        margin: 20,
        marginBottom: 12,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    oversLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.dark,
    },

    oversSubtext: {
        fontSize: 12,
        color: theme.colors.textTertiary,
        marginTop: 2,
    },

    oversControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#2E7D32',
    },

    oversButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
    },

    oversValueContainer: {
        width: 60,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2E7D32',
    },

    oversValue: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.white,
    },

    totalOversContainer: {
        backgroundColor: theme.colors.white,
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    totalOversLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },

    totalOversValue: {
        fontSize: 28,
        fontWeight: '700',
        color: theme.colors.dark,
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

    playerCount: {
        fontSize: 14,
        color: theme.colors.textTertiary,
    },

    addPlayerRow: {
        marginBottom: 16,
        position: 'relative',
        zIndex: 100,
    },

    searchContainer: {
        flexDirection: 'row',
        gap: 8,
    },

    searchInput: {
        flex: 1,
        backgroundColor: theme.colors.white,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },

    searchResults: {
        marginTop: 8,
        backgroundColor: theme.colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        maxHeight: 300,
    },

    scrollableResults: {
        maxHeight: 300,
    },

    searchResultItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },

    searchResultName: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.dark,
    },

    searchResultDetail: {
        fontSize: 13,
        color: theme.colors.textTertiary,
        marginTop: 2,
    },

    noResults: {
        padding: 16,
        textAlign: 'center',
        color: theme.colors.textTertiary,
        fontSize: 14,
    },

    playersList: {
        gap: 8,
    },

    playerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        padding: 12,
        borderRadius: 8,
        gap: 12,
    },

    dragHandle: {
        padding: 4,
    },

    playerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
    },

    playerInitial: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.primary,
    },

    playerInfo: {
        flex: 1,
    },

    playerName: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.dark,
    },

    playerRank: {
        fontSize: 13,
        color: theme.colors.textTertiary,
        marginTop: 2,
    },

    removeButton: {
        padding: 4,
    },

    emptyPlayers: {
        backgroundColor: theme.colors.white,
        padding: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },

    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        marginTop: 12,
    },

    emptySubtext: {
        fontSize: 14,
        color: theme.colors.textTertiary,
        marginTop: 4,
    },

    footer: {
        padding: 20,
        backgroundColor: theme.colors.white,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },

    startButton: {
        backgroundColor: '#F9A825',
    },

    // Template save styles
    saveTemplateToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        gap: 12,
    },

    saveTemplateLabel: {
        fontSize: 15,
        color: theme.colors.dark,
        flex: 1,
    },

    templateNameInput: {
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        marginBottom: 16,
        padding: 4,
    },

    templateTextInput: {
        padding: 14,
        fontSize: 15,
        color: theme.colors.dark,
    },
});

export default MatchSetupScreen;
