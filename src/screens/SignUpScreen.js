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
import theme from '../theme';
import { useAuth } from '../contexts/AuthContext';

const SignUpScreen = ({ navigation }) => {
    const { signUp } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        // Email validation
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
        }

        // Password validation
        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        // Confirm password validation
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignUp = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrors({});

        const { success, error } = await signUp(email, password);

        setLoading(false);

        if (!success) {
            Alert.alert('Sign Up Failed', error || 'Please try again');
            return;
        }

        // Success! Show success message
        Alert.alert(
            'Account Created!',
            'Your account has been created successfully. Please log in.',
            [
                {
                    text: 'OK',
                    onPress: () => navigation.replace('Login'),
                },
            ]
        );
    };

    const handleLogin = () => {
        navigation.navigate('Login');
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
                        <Ionicons name="baseball" size={24} color={theme.colors.white} />
                    </View>
                </View>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Sign up to start scoring</Text>
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
                        error={errors.email}
                        leftIcon={
                            <Ionicons
                                name="mail-outline"
                                size={20}
                                color={theme.colors.iconPrimary}
                            />
                        }
                    />

                    <Input
                        label="Password"
                        placeholder="••••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        error={errors.password}
                        leftIcon={
                            <Ionicons
                                name="lock-closed-outline"
                                size={20}
                                color={theme.colors.iconPrimary}
                            />
                        }
                    />

                    <Input
                        label="Confirm Password"
                        placeholder="••••••••••"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        error={errors.confirmPassword}
                        leftIcon={
                            <Ionicons
                                name="lock-closed-outline"
                                size={20}
                                color={theme.colors.iconPrimary}
                            />
                        }
                    />

                    <Button
                        title="Sign Up"
                        onPress={handleSignUp}
                        variant="primary"
                        size="medium"
                        loading={loading}
                        style={styles.signUpButton}
                    />

                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Already have an account? </Text>
                        <TouchableOpacity onPress={handleLogin}>
                            <Text style={styles.loginLink}>Log In</Text>
                        </TouchableOpacity>
                    </View>
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
        marginTop: theme.spacing['2xl'],
        marginBottom: theme.spacing.xl,
    },

    logo: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.small,
    },

    header: {
        marginBottom: theme.spacing.xl,
    },

    title: {
        ...theme.typography.h1,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.sm,
    },

    subtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
    },

    form: {
        flex: 1,
    },

    signUpButton: {
        width: '100%',
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.lg,
    },

    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },

    loginText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
    },

    loginLink: {
        ...theme.typography.body,
        color: theme.colors.accent,
        fontWeight: '600',
    },
});

export default SignUpScreen;
