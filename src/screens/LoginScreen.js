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

const LoginScreen = ({ navigation }) => {
    const { signIn, signInWithGoogle, enterGuestMode } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrors({});

        const { success, error } = await signIn(email, password);

        setLoading(false);

        if (!success) {
            // Check if it's an invalid credentials error
            if (error && (
                error.includes('Invalid login credentials') ||
                error.includes('Email not confirmed') ||
                error.includes('User not found')
            )) {
                Alert.alert(
                    'Login Failed',
                    'Invalid email or password. Don\'t have an account?',
                    [
                        { text: 'Try Again', style: 'cancel' },
                        {
                            text: 'Sign Up',
                            onPress: () => navigation.navigate('SignUp'),
                            style: 'default'
                        }
                    ]
                );
            } else {
                Alert.alert('Error', error || 'An error occurred during login');
            }
            return;
        }

        // Success! Navigation will be handled automatically by AppNavigator
        // based on the user's profile state (role, onboarding status, etc.)
    };

    const handleSignUp = () => {
        navigation.navigate('SignUp');
    };

    const handleForgotPassword = () => {
        navigation.navigate('ForgotPassword');
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        const { success, error } = await signInWithGoogle();
        setLoading(false);

        if (!success) {
            Alert.alert('Google Sign-In Failed', error || 'Failed to sign in with Google');
        }
        // Success will be handled by AuthContext and AppNavigator
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
                    <Text style={styles.title}>Welcome back</Text>
                    <Text style={styles.subtitle}>Sign in to continue scoring.</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <Input
                        label="Email Address"
                        placeholder="player@cricket.com"
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

                    <TouchableOpacity
                        style={styles.forgotPassword}
                        onPress={handleForgotPassword}
                    >
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <Button
                        title="Log In"
                        onPress={handleLogin}
                        variant="primary"
                        size="medium"
                        loading={loading}
                        style={styles.loginButton}
                    />

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Google Sign-In Button */}
                    <TouchableOpacity
                        style={styles.googleButton}
                        onPress={handleGoogleSignIn}
                        disabled={loading}
                    >
                        <Ionicons name="logo-google" size={20} color="#DB4437" />
                        <Text style={styles.googleButtonText}>Continue with Google</Text>
                    </TouchableOpacity>

                    <View style={styles.signUpContainer}>
                        <Text style={styles.signUpText}>Don't have an account? </Text>

                        <TouchableOpacity onPress={handleSignUp}>
                            <Text style={styles.signUpLink}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.guestLink}
                        onPress={enterGuestMode}
                    >
                        <Text style={styles.guestText}>Continue as Guest</Text>
                    </TouchableOpacity>
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

    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: -theme.spacing.sm,
        marginBottom: theme.spacing.lg,
    },

    forgotPasswordText: {
        ...theme.typography.bodySmall,
        color: theme.colors.primary,
    },

    loginButton: {
        width: '100%',
        marginBottom: theme.spacing.lg,
    },

    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: theme.spacing.lg,
    },

    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.divider,
    },

    dividerText: {
        ...theme.typography.caption,
        color: theme.colors.textTertiary,
        marginHorizontal: theme.spacing.md,
    },

    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.white,
        borderWidth: 1,
        borderColor: theme.colors.divider,
        borderRadius: theme.borderRadius.medium,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: theme.spacing.lg,
        gap: 12,
    },

    googleButtonText: {
        ...theme.typography.button,
        color: theme.colors.textPrimary,
        fontSize: 15,
    },

    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },

    signUpText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
    },

    signUpLink: {
        ...theme.typography.body,
        color: theme.colors.accent,
        fontWeight: '600',
    },
    guestLink: {
        marginTop: 24,
        alignSelf: 'center',
        padding: 8,
    },
    guestText: {
        color: theme.colors.textSecondary,
        textDecorationLine: 'underline',
    },
});

export default LoginScreen;
