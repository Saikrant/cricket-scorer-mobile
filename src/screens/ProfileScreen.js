import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import theme from '../theme';
import Button from '../components/Button';

const ProfileScreen = ({ navigation }) => {
    const { profile, signOut } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSignOut = async () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        await signOut();
                        setLoading(false);
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Profile</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {profile?.full_name?.charAt(0).toUpperCase() || 'P'}
                        </Text>
                    </View>
                    <Text style={styles.name}>{profile?.full_name || 'Player Name'}</Text>
                    <Text style={styles.role}>{profile?.role ? profile.role.toUpperCase() : 'PLAYER'}</Text>
                    <Text style={styles.email}>{profile?.email || 'email@example.com'}</Text>
                </View>

                {/* Details Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Player Details</Text>
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <Text style={styles.label}>Batting Style</Text>
                            <Text style={styles.value}>{profile?.batting_style || 'Not Set'}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.row}>
                            <Text style={styles.label}>Bowling Style</Text>
                            <Text style={styles.value}>{profile?.bowling_type || 'Not Set'}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.row}>
                            <Text style={styles.label}>Jersey Number</Text>
                            <Text style={styles.value}>#{profile?.jersey_number || '-'}</Text>
                        </View>
                    </View>
                </View>

                {/* Account Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <Button
                        title="Sign Out"
                        onPress={handleSignOut}
                        variant="outline"
                        style={styles.signOutButton}
                        textStyle={{ color: '#EF4444' }}
                        icon={<Ionicons name="log-out-outline" size={20} color="#EF4444" />}
                        loading={loading}
                    />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.version}>Version 1.0.0</Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        backgroundColor: '#1E3A5F',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: 'white',
    },
    content: {
        padding: 20,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 4,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: '700',
        color: '#1E3A5F',
    },
    name: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    role: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
        letterSpacing: 1,
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: '#6B7280',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    label: {
        fontSize: 16,
        color: '#4B5563',
    },
    value: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
    },
    signOutButton: {
        borderColor: '#EF4444',
        backgroundColor: 'white',
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    version: {
        color: '#9CA3AF',
        fontSize: 12,
    },
});

export default ProfileScreen;
