import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import theme from '../theme';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import PlayerOnboardingScreen from '../screens/PlayerOnboardingScreen';
import ScorerOnboardingScreen from '../screens/ScorerOnboardingScreen';

import PlayerDashboardScreen from '../screens/PlayerDashboardScreen';
import GuestDashboardScreen from '../screens/GuestDashboardScreen';
import ScorerDashboardScreen from '../screens/ScorerDashboardScreen';

import PlayerTabNavigator from './PlayerTabNavigator';
import ScorerTabNavigator from './ScorerTabNavigator';
import PlayerLiveMatchScreen from '../screens/PlayerLiveMatchScreen';

import CreateMatchScreen from '../screens/CreateMatchScreen';
import MatchSetupScreen from '../screens/MatchSetupScreen';
import SelectBowlerScreen from '../screens/SelectBowlerScreen';
import LiveScoringScreen from '../screens/LiveScoringScreen';
import PlayerCompleteScreen from '../screens/PlayerCompleteScreen';
import MatchSummaryScreen from '../screens/MatchSummaryScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const { isAuthenticated, profile, initializing, profileLoading, guestMode } = useAuth();

    if (initializing || (isAuthenticated && profileLoading)) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    const getInitialRouteName = () => {
        if (guestMode) return 'GuestDashboard';
        if (!isAuthenticated) return 'Login';
        if (!profile || !profile.role) return 'RoleSelection';
        if (!profile.is_onboarded) {
            return profile.role === 'player' ? 'PlayerOnboarding' : 'ScorerOnboarding';
        }
        return profile.role === 'player' ? 'PlayerDashboard' : 'ScorerDashboard';
    };

    const navigationKey = `${isAuthenticated ? 'auth' : 'guest'}-${profile?.role || 'none'}-${guestMode}`;

    return (
        <NavigationContainer>
            <Stack.Navigator
                key={navigationKey}
                initialRouteName={getInitialRouteName()}
                screenOptions={{ headerShown: false, animation: 'fade' }}
            >
                {guestMode ? (
                    <>
                        <Stack.Screen name="GuestDashboard" component={GuestDashboardScreen} />
                        <Stack.Screen name="PlayerLiveMatch" component={PlayerLiveMatchScreen} />
                    </>
                ) : !isAuthenticated ? (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="SignUp" component={SignUpScreen} />
                        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
                        <Stack.Screen name="PlayerOnboarding" component={PlayerOnboardingScreen} />
                        <Stack.Screen name="ScorerOnboarding" component={ScorerOnboardingScreen} />

                        {/* Dashboards via Tab Navigators */}
                        <Stack.Screen name="PlayerDashboard" component={PlayerTabNavigator} />
                        <Stack.Screen name="ScorerDashboard" component={ScorerTabNavigator} />

                        {/* Common/Shared Screens */}
                        <Stack.Screen name="PlayerLiveMatch" component={PlayerLiveMatchScreen} />

                        {/* Scorer Flow */}
                        <Stack.Screen name="CreateMatchScreen" component={CreateMatchScreen} />
                        <Stack.Screen name="MatchSetup" component={MatchSetupScreen} />
                        <Stack.Screen name="SelectBowler" component={SelectBowlerScreen} />
                        <Stack.Screen name="LiveScoring" component={LiveScoringScreen} />
                        <Stack.Screen name="PlayerComplete" component={PlayerCompleteScreen} />
                        <Stack.Screen name="MatchSummary" component={MatchSummaryScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
});

export default AppNavigator;
