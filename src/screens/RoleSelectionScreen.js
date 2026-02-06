import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import Button from '../components/Button';
import theme from '../theme';
import { useAuth } from '../contexts/AuthContext';

const RoleSelectionScreen = ({ navigation }) => {
    const { updateProfile, signOut } = useAuth();
    const [selectedRole, setSelectedRole] = useState(null); // 'player' or 'scorer'
    const [loading, setLoading] = useState(false);

    const handleContinue = async () => {
        if (!selectedRole) {
            alert('Please select a role');
            return;
        }

        setLoading(true);

        // Save role to profile
        const { success } = await updateProfile({ role: selectedRole });

        setLoading(false);

        if (!success) {
            alert('Failed to save role. Please try again.');
            return;
        }

        // Navigate to appropriate onboarding screen
        if (selectedRole === 'player') {
            navigation.navigate('PlayerOnboarding');
        } else {
            navigation.navigate('ScorerOnboarding');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.appLabel}>CRICKET SCORER</Text>
                    <Text style={styles.title}>Select your role</Text>
                    <Text style={styles.subtitle}>How will you use the app today?</Text>
                </View>

                {/* Role Cards */}
                <View style={styles.rolesContainer}>
                    {/* Player Card */}
                    <Card
                        onPress={() => setSelectedRole('player')}
                        selected={selectedRole === 'player'}
                        elevation="medium"
                        padding="large"
                        style={styles.roleCard}
                    >
                        <View style={styles.iconContainer}>
                            <View style={[
                                styles.iconCircle,
                                selectedRole === 'player' && styles.iconCircleSelected
                            ]}>
                                <Ionicons
                                    name="person-outline"
                                    size={32}
                                    color={selectedRole === 'player' ? theme.colors.primary : theme.colors.iconPrimary}
                                />
                            </View>
                            {selectedRole === 'player' && (
                                <View style={styles.checkmark}>
                                    <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                                </View>
                            )}
                        </View>

                        <Text style={styles.roleTitle}>Player</Text>
                        <Text style={styles.roleDescription}>
                            Join teams, track your batting & bowling stats, and view match history.
                        </Text>
                    </Card>

                    {/* Scorer Card */}
                    <Card
                        onPress={() => setSelectedRole('scorer')}
                        selected={selectedRole === 'scorer'}
                        elevation="medium"
                        padding="large"
                        style={styles.roleCard}
                    >
                        <View style={styles.iconContainer}>
                            <View style={[
                                styles.iconCircle,
                                selectedRole === 'scorer' && styles.iconCircleSelected
                            ]}>
                                <Ionicons
                                    name="clipboard-outline"
                                    size={32}
                                    color={selectedRole === 'scorer' ? theme.colors.primary : theme.colors.iconPrimary}
                                />
                            </View>
                            {selectedRole === 'scorer' && (
                                <View style={styles.checkmark}>
                                    <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                                </View>
                            )}
                        </View>

                        <Text style={styles.roleTitle}>Scorer</Text>
                        <Text style={styles.roleDescription}>
                            Create matches, manage squads, and score games ball-by-ball.
                        </Text>
                    </Card>
                </View>

                {/* Continue Button */}
                <View style={styles.footer}>
                    <Button
                        title="Continue →"
                        onPress={handleContinue}
                        variant="primary"
                        size="large"
                        style={styles.continueButton}
                    />

                    <TouchableOpacity
                        style={{ marginTop: 24, alignSelf: 'center', padding: 8 }}
                        onPress={signOut}
                    >
                        <Text style={{
                            color: theme.colors.textSecondary,
                            textDecorationLine: 'underline',
                            fontSize: 14
                        }}>
                            Log Out / Switch Account
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },

    scrollContent: {
        flexGrow: 1,
        padding: theme.padding.screen,
    },

    header: {
        marginTop: theme.spacing.xl,
        marginBottom: theme.spacing.xl,
        alignItems: 'center',
    },

    appLabel: {
        ...theme.typography.labelSmall,
        color: theme.colors.textTertiary,
        letterSpacing: 1.5,
        marginBottom: theme.spacing.md,
    },

    title: {
        ...theme.typography.h1,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.sm,
    },

    subtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },

    rolesContainer: {
        flex: 1,
        gap: theme.spacing.md,
    },

    roleCard: {
        position: 'relative',
    },

    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.md,
    },

    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },

    iconCircleSelected: {
        backgroundColor: '#E0EFFF',
    },

    checkmark: {
        position: 'absolute',
        right: 0,
        top: 0,
    },

    roleTitle: {
        ...theme.typography.h3,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.sm,
    },

    roleDescription: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        lineHeight: 22,
    },

    footer: {
        marginTop: theme.spacing.xl,
        marginBottom: theme.spacing.lg,
    },

    continueButton: {
        width: '100%',
    },
});

export default RoleSelectionScreen;
