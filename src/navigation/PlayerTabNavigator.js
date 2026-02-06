import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

import PlayerDashboardScreen from '../screens/PlayerDashboardScreen';
import PlayerStatsScreen from '../screens/PlayerStatsScreen';
import PlayerHistoryScreen from '../screens/PlayerHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen'; // Assuming we reuse existing or create placeholder

const Tab = createBottomTabNavigator();

// Placeholder for Profile until we create a dedicated one or reuse existing logic
const ProfilePlaceholder = ({ navigation }) => {
    const { useAuth } = require('../contexts/AuthContext');
    const { signOut } = useAuth();

    return (
        <PlayerDashboardScreen navigation={navigation} /> // Reuse dash for now or redirect
    );
};

const PlayerTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textTertiary,
                tabBarStyle: {
                    paddingVertical: 8,
                    height: 60,
                    backgroundColor: 'white',
                    borderTopWidth: 1,
                    borderTopColor: '#E5E7EB',
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    paddingBottom: 8,
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Stats') {
                        iconName = focused ? 'stats-chart' : 'stats-chart-outline';
                    } else if (route.name === 'History') {
                        iconName = focused ? 'time' : 'time-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={PlayerDashboardScreen} />
            <Tab.Screen name="Stats" component={PlayerStatsScreen} />
            <Tab.Screen name="History" component={PlayerHistoryScreen} />
            {/* For Profile, we can stick to Dashboard or add a specific profile screen later */}
            {/* For Profile, we can stick to Dashboard or add a specific profile screen later */}
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

export default PlayerTabNavigator;
