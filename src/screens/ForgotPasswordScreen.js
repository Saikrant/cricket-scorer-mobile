import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import Input from '../components/Input';
import theme from '../theme';
import { useAuth } from '../contexts/AuthContext';

const ForgotPasswordScreen = ({ navigation }) => {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const validateEmail = () => {
        if (!email.trim()) {
            setError('Email is required');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Email is invalid');
            return false;
        }
        return true;
    };

    const handleResetPassword = async () => {
        if (!validateEmail()) {
            return;
        }

        setLoading(true);
        setError('');

        const { success, error: resetError } = await resetPassword(email);

        setLoading(false);

        if (!success) {
            Alert.alert('Error', resetError || 'Failed to send reset email');
            return;
        }

        // Success
        Alert.alert(
            'Check Your Email',
            'We have sent you a password reset link. Please check your email.',
            [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]
        );
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
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <View style={styles.logo}>
                        <Ionicons name="key-outline" size={32} color={theme.colors.white} />
                    </View>
                </View>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Forgot Password?</Text>
                    <Text style={styles.subtitle}>
                        Enter your email address and we'll send you a link to reset your password.
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <Input
                        label="Email Address"
                        placeholder="your@email.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={error}
                        leftIcon={
                            <Ionicons
                                name="mail-outline"
                                size={20}
                                color={theme.colors.iconPrimary}
                            />
                        }
                    />

                    <Button
                        title="Send Reset Link"
                        onPress={handleResetPassword}
                        variant="primary"
                        size="medium"
                        loading={loading}
                        style={styles.resetButton}
                    />

                    <Button
                        title="Back to Login"
                        onPress={() => navigation.goBack()}
                        variant="text"
                        size="medium"
                        style={styles.backButton}
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

    logoContainer: {
        marginTop: theme.spacing['3xl'],
        marginBottom: theme.spacing.xl,
        alignItems: 'center',
    },

    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.medium,
    },

    header: {
        marginBottom: theme.spacing.xl,
        alignItems: 'center',
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
        lineHeight: 22,
    },

    form: {
        flex: 1,
        marginTop: theme.spacing.lg,
    },

    resetButton: {
        width: '100%',
        marginTop: theme.spacing.md,
    },

    backButton: {
        width: '100%',
        marginTop: theme.spacing.sm,
    },
});

export default ForgotPasswordScreen;
