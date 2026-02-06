import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';
import supabase from '../config/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [guestMode, setGuestMode] = useState(false);

    const enterGuestMode = () => {
        setGuestMode(true);
    };

    const exitGuestMode = () => {
        setGuestMode(false);
    };

    // Initialize auth state
    useEffect(() => {
        initializeAuth();

        // Listen for deep links (OAuth callback)
        const handleDeepLink = async ({ url }) => {
            console.log('Deep link received:', url);
            if (!url) return;

            try {
                // Parse the URL for tokens (Supabase returns them in hash or query)
                // Format: cricketscorer://auth/callback#access_token=...&refresh_token=...
                // OR: cricketscorer://auth/callback?code=...

                // Extract parameters
                const params = {};
                const queryString = url.split('#')[1] || url.split('?')[1];

                if (queryString) {
                    queryString.split('&').forEach(param => {
                        const [key, value] = param.split('=');
                        if (key && value) {
                            params[key] = decodeURIComponent(value);
                        }
                    });
                }

                if (params.access_token && params.refresh_token) {
                    console.log('Detected session in URL, setting session...');
                    const { error } = await supabase.auth.setSession({
                        access_token: params.access_token,
                        refresh_token: params.refresh_token,
                    });
                    if (error) throw error;
                    console.log('Session set successfully from deep link');
                } else if (params.code) {
                    console.log('Detected auth code in URL, exchanging for session...');
                    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
                    if (error) throw error;
                    console.log('Session exchanged successfully');
                }
            } catch (error) {
                console.error('Error processing deep link:', error);
            }
        };

        const { Linking } = require('react-native');
        const subscription = Linking.addEventListener('url', handleDeepLink);

        // Check for initial URL (if app opened from link)
        Linking.getInitialURL().then(url => {
            if (url) handleDeepLink({ url });
        });

        return () => {
            subscription.remove();
        };
    }, []);

    // Subscribe to auth changes
    useEffect(() => {
        const subscription = authService.onAuthStateChange(async (event, session) => {
            console.log('Auth event:', event);
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                // Fetch user profile
                await fetchProfile(session.user.id, session.user.email);
            } else {
                setProfile(null);
            }
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const initializeAuth = async () => {
        try {
            setInitializing(true);
            const { session } = await authService.getSession();

            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                await fetchProfile(session.user.id, session.user.email);
            }
        } catch (error) {
            console.error('Initialize auth error:', error);
        } finally {
            setInitializing(false);
            setLoading(false);
        }
    };

    const fetchProfile = async (userId, email) => {
        try {
            setProfileLoading(true);
            console.log('Fetching profile for user:', userId);
            const { profile, error } = await userService.getProfile(userId);

            if (error) {
                // Profile doesn't exist - create it for the user
                console.log('Profile not found for user:', userId, 'Error:', error);
                console.log('Creating new profile for user...');

                const { profile: newProfile, error: createError } = await userService.createProfile(userId, email);

                if (createError) {
                    console.error('Failed to create profile:', createError);
                    setProfile(null);
                    return;
                }

                console.log('Profile created successfully:', JSON.stringify(newProfile));
                setProfile(newProfile);
                return;
            }

            console.log('Profile found:', JSON.stringify(profile));
            console.log('Role:', profile?.role, 'Is Onboarded:', profile?.is_onboarded);
            setProfile(profile);
        } catch (error) {
            console.error('Fetch profile error:', error);
            setProfile(null);
        } finally {
            setProfileLoading(false);
        }
    };

    const signUp = async (email, password) => {
        try {
            setLoading(true);
            const { user, session, error } = await authService.signUp(email, password);

            if (error) {
                return { success: false, error };
            }

            setUser(user);
            setSession(session);

            // Fetch profile (should be auto-created by trigger)
            if (user) {
                await fetchProfile(user.id, email);
            }

            return { success: true, user };
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email, password) => {
        try {
            setLoading(true);
            const { user, session, error } = await authService.signIn(email, password);

            if (error) {
                return { success: false, error };
            }

            setUser(user);
            setSession(session);

            // Fetch profile
            if (user) {
                await fetchProfile(user.id, user.email);
            }

            return { success: true, user };
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        try {
            setLoading(true);
            await authService.signOut();
            setUser(null);
            setProfile(null);
            setSession(null);
            // Don't navigate manually - conditional rendering in AppNavigator will handle it
        } catch (error) {
            console.error('Sign out error:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (email) => {
        try {
            const { error } = await authService.resetPassword(email);

            if (error) {
                return { success: false, error };
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const signInWithGoogle = async () => {
        try {
            // For React Native, we need to open the browser and let Supabase handle the auth
            // The session will be automatically detected by the auth state listener
            const { data, error } = await authService.signInWithGoogle();

            if (error) {
                return { success: false, error };
            }

            // Open OAuth in browser - Linking will handle the return
            if (data?.url) {
                const { Linking } = require('react-native');
                await Linking.openURL(data.url);
            }

            return { success: true, error: null };
        } catch (error) {
            console.error('Google sign in error in context:', error);
            return { success: false, error: error.message };
        }
    };

    const updateProfile = async (updates) => {
        try {
            if (!user) {
                return { success: false, error: 'No user logged in' };
            }

            const { profile: updatedProfile, error } = await userService.updateProfile(
                user.id,
                { email: user.email, ...updates }
            );

            if (error) {
                return { success: false, error };
            }

            setProfile(updatedProfile);
            return { success: true, profile: updatedProfile };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const completeOnboarding = async (role, data) => {
        try {
            if (!user) {
                return { success: false, error: 'No user logged in' };
            }

            let result;
            if (role === 'player') {
                result = await userService.completePlayerOnboarding(user.id, data);
            } else {
                result = await userService.completeScorerOnboarding(user.id, data);
            }

            if (result.error) {
                return { success: false, error: result.error };
            }

            setProfile(result.profile);
            return { success: true, profile: result.profile };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const value = {
        user,
        profile,
        session,
        loading,
        profileLoading,
        initializing,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        updateProfile,
        completeOnboarding,
        isAuthenticated: !!user,
        isOnboarded: profile?.is_onboarded || false,
        guestMode,
        enterGuestMode,
        exitGuestMode,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthContext;
