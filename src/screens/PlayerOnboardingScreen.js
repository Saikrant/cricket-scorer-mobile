import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import theme from '../theme';
import { useAuth } from '../contexts/AuthContext';

const PlayerOnboardingScreen = ({ navigation }) => {
    const { completeOnboarding } = useAuth();
    const [fullName, setFullName] = useState('');
    const [battingStyle, setBattingStyle] = useState('');
    const [bowlingType, setBowlingType] = useState('');
    const [preferredPosition, setPreferredPosition] = useState('');
    const [jerseyNumber, setJerseyNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const battingStyles = ['Right-handed', 'Left-handed'];
    const bowlingTypes = ['Fast', 'Spin', 'All-rounder', 'None'];

    const validateForm = () => {
        const newErrors = {};

        if (!fullName.trim()) {
            newErrors.fullName = 'Name is required';
        }

        if (!battingStyle) {
            newErrors.battingStyle = 'Please select a batting style';
        }

        if (!bowlingType) {
            newErrors.bowlingType = 'Please select a bowling type';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleComplete = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        const playerData = {
            fullName,
            battingStyle,
            bowlingType,
            preferredPosition: preferredPosition || null,
            jerseyNumber: jerseyNumber ? parseInt(jerseyNumber) : null,
        };

        const { success, error } = await completeOnboarding('player', playerData);

        setLoading(false);

        if (!success) {
            Alert.alert('Error', error || 'Failed to complete onboarding');
            return;
        }

        // Success! Navigate to player dashboard
        navigation.replace('PlayerDashboard');
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="person" size={32} color={theme.colors.white} />
                    </View>
                    <Text style={styles.title}>Player Profile</Text>
                    <Text style={styles.subtitle}>Complete your profile to get started</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <Input
                        label="Full Name *"
                        placeholder="John Doe"
                        value={fullName}
                        onChangeText={setFullName}
                        error={errors.fullName}
                        leftIcon={<Ionicons name="person-outline" size={20} color={theme.colors.iconPrimary} />}
                    />

                    {/* Batting Style Selection */}
                    <Text style={styles.sectionLabel}>Batting Style *</Text>
                    <View style={styles.optionsRow}>
                        {battingStyles.map((style) => (
                            <TouchableOpacity
                                key={style}
                                onPress={() => setBattingStyle(style)}
                                style={styles.optionButton}
                            >
                                <Card
                                    selected={battingStyle === style}
                                    onPress={() => setBattingStyle(style)}
                                    style={styles.optionCard}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        battingStyle === style && styles.optionTextSelected
                                    ]}>
                                        {style}
                                    </Text>
                                </Card>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {errors.battingStyle && <Text style={styles.errorText}>{errors.battingStyle}</Text>}

                    {/* Bowling Type Selection */}
                    <Text style={styles.sectionLabel}>Bowling Type *</Text>
                    <View style={styles.optionsGrid}>
                        {bowlingTypes.map((type) => (
                            <TouchableOpacity
                                key={type}
                                onPress={() => setBowlingType(type)}
                                style={styles.optionGridItem}
                            >
                                <Card
                                    selected={bowlingType === type}
                                    onPress={() => setBowlingType(type)}
                                    style={styles.optionCard}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        bowlingType === type && styles.optionTextSelected
                                    ]}>
                                        {type}
                                    </Text>
                                </Card>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {errors.bowlingType && <Text style={styles.errorText}>{errors.bowlingType}</Text>}

                    <Input
                        label="Preferred Position"
                        placeholder="e.g., Opening Batsman"
                        value={preferredPosition}
                        onChangeText={setPreferredPosition}
                        leftIcon={<Ionicons name="trophy-outline" size={20} color={theme.colors.iconPrimary} />}
                    />

                    <Input
                        label="Jersey Number"
                        placeholder="e.g., 7"
                        value={jerseyNumber}
                        onChangeText={setJerseyNumber}
                        keyboardType="number-pad"
                        leftIcon={<Ionicons name="shirt-outline" size={20} color={theme.colors.iconPrimary} />}
                    />

                    <Button
                        title="Complete Profile"
                        onPress={handleComplete}
                        variant="primary"
                        size="medium"
                        loading={loading}
                        style={styles.submitButton}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
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

    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.md,
        ...theme.shadows.medium,
    },

    title: {
        ...theme.typography.h1,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.xs,
    },

    subtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },

    form: {
        flex: 1,
    },

    sectionLabel: {
        ...theme.typography.label,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.sm,
        marginTop: theme.spacing.sm,
    },

    optionsRow: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.md,
    },

    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.md,
    },

    optionButton: {
        flex: 1,
    },

    optionGridItem: {
        width: '48%',
    },

    optionCard: {
        padding: theme.spacing.md,
        alignItems: 'center',
    },

    optionText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },

    optionTextSelected: {
        color: theme.colors.accent,
        fontWeight: '600',
    },

    errorText: {
        ...theme.typography.caption,
        color: theme.colors.error,
        marginTop: -theme.spacing.sm,
        marginBottom: theme.spacing.sm,
        marginLeft: theme.spacing.xs,
    },

    submitButton: {
        width: '100%',
        marginTop: theme.spacing.lg,
    },
});

export default PlayerOnboardingScreen;
