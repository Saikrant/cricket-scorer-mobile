import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

import ScorerDashboardScreen from '../screens/ScorerDashboardScreen';
// Scorer might reuse PlayerHistory logic but filtered for "Matches Scored"
import PlayerHistoryScreen from '../screens/PlayerHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const ScorerTabNavigator = () => {
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
                    } else if (route.name === 'History') {
                        iconName = focused ? 'time' : 'time-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={ScorerDashboardScreen} />
            <Tab.Screen name="History" component={PlayerHistoryScreen} />
            {/* Reuse History for now, logic inside History screen might need tweak or pass params */}
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

export default ScorerTabNavigator;
