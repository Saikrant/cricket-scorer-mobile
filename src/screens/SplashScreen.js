import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

const SplashScreen = ({ navigation }) => {
    useEffect(() => {
        // Auto-navigate to Login after 2 seconds
        const timer = setTimeout(() => {
            navigation.replace('Login');
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View style={styles.container}>
            {/* Cricket Ball Icon */}
            <View style={styles.iconContainer}>
                <View style={styles.cricketBall}>
                    <Ionicons
                        name="baseball"
                        size={48}
                        color={theme.colors.info}
                    />
                </View>
            </View>

            {/* App Name */}
            <Text style={styles.appName}>Cricket Scorer</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },

    iconContainer: {
        marginBottom: theme.spacing.lg,
    },

    cricketBall: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.medium,
    },

    appName: {
        ...theme.typography.h2,
        color: theme.colors.textPrimary,
        fontWeight: '700',
    },
});

export default SplashScreen;
