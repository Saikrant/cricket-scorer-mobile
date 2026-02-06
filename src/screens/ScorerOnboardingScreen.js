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

const ScorerOnboardingScreen = ({ navigation }) => {
    const { completeOnboarding } = useAuth();
    const [fullName, setFullName] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const experienceLevels = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];

    const validateForm = () => {
        const newErrors = {};

        if (!fullName.trim()) {
            newErrors.fullName = 'Name is required';
        }

        if (!experienceLevel) {
            newErrors.experienceLevel = 'Please select your experience level';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleComplete = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        const scorerData = {
            fullName,
            experienceLevel,
        };

        const { success, error } = await completeOnboarding('scorer', scorerData);

        setLoading(false);

        if (!success) {
            Alert.alert('Error', error || 'Failed to complete onboarding');
            return;
        }

        // Success! Navigate to scorer dashboard
        navigation.replace('ScorerDashboard');
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
                        <Ionicons name="clipboard" size={32} color={theme.colors.white} />
                    </View>
                    <Text style={styles.title}>Scorer Profile</Text>
                    <Text style={styles.subtitle}>Complete your profile to start scoring</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <Input
                        label="Full Name *"
                        placeholder="Jane Smith"
                        value={fullName}
                        onChangeText={setFullName}
                        error={errors.fullName}
                        leftIcon={<Ionicons name="person-outline" size={20} color={theme.colors.iconPrimary} />}
                    />

                    {/* Experience Level Selection */}
                    <Text style={styles.sectionLabel}>Experience Level *</Text>
                    <View style={styles.optionsGrid}>
                        {experienceLevels.map((level) => (
                            <TouchableOpacity
                                key={level}
                                onPress={() => setExperienceLevel(level)}
                                style={styles.optionGridItem}
                            >
                                <Card
                                    selected={experienceLevel === level}
                                    onPress={() => setExperienceLevel(level)}
                                    style={styles.optionCard}
                                >
                                    <Ionicons
                                        name={
                                            level === 'Beginner' ? 'star-outline' :
                                                level === 'Intermediate' ? 'star-half' :
                                                    level === 'Advanced' ? 'star' :
                                                        'trophy'
                                        }
                                        size={24}
                                        color={experienceLevel === level ? theme.colors.accent : theme.colors.iconSecondary}
                                        style={styles.optionIcon}
                                    />
                                    <Text style={[
                                        styles.optionText,
                                        experienceLevel === level && styles.optionTextSelected
                                    ]}>
                                        {level}
                                    </Text>
                                </Card>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {errors.experienceLevel && <Text style={styles.errorText}>{errors.experienceLevel}</Text>}

                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle-outline" size={20} color={theme.colors.accent} />
                        <Text style={styles.infoText}>
                            {experienceLevel === 'Beginner' && 'New to scoring? We\'ll guide you through the basics.'}
                            {experienceLevel === 'Intermediate' && 'You have some experience scoring matches.'}
                            {experienceLevel === 'Advanced' && 'You\'re an experienced scorer familiar with complex scenarios.'}
                            {experienceLevel === 'Professional' && 'You have professional scoring experience.'}
                            {!experienceLevel && 'Select your experience level to see more info.'}
                        </Text>
                    </View>

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
        marginTop: theme.spacing.md,
    },

    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.md,
    },

    optionGridItem: {
        width: '48%',
    },

    optionCard: {
        padding: theme.spacing.md,
        alignItems: 'center',
        minHeight: 100,
        justifyContent: 'center',
    },

    optionIcon: {
        marginBottom: theme.spacing.xs,
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

    infoBox: {
        flexDirection: 'row',
        backgroundColor: theme.colors.cardBackground,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.md,
        gap: theme.spacing.sm,
    },

    infoText: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        flex: 1,
        lineHeight: 18,
    },

    submitButton: {
        width: '100%',
        marginTop: theme.spacing.lg,
    },
});

export default ScorerOnboardingScreen;
