import supabase from '../config/supabase';

/**
 * Authentication Service
 * Handles all auth operations with Supabase
 */

export const authService = {
    /**
     * Sign up with email and password
     */
    signUp: async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;
            return { user: data.user, session: data.session, error: null };
        } catch (error) {
            console.error('Sign up error:', error);
            return { user: null, session: null, error: error.message };
        }
    },

    /**
     * Sign in with email and password
     */
    signIn: async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            return { user: data.user, session: data.session, error: null };
        } catch (error) {
            console.error('Sign in error:', error);
            return { user: null, session: null, error: error.message };
        }
    },

    /**
     * Sign in with Google OAuth
     */
    signInWithGoogle: async () => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    // Use the Supabase redirect endpoint - it will handle the callback
                    skipBrowserRedirect: true,
                    redirectTo: 'cricketscorer://auth/callback',
                },
            });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Google sign in error:', error);
            return { data: null, error: error.message };
        }
    },

    /**
     * Sign out
     */
    signOut: async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Sign out error:', error);
            return { error: error.message };
        }
    },

    /**
     * Get current user
     */
    getCurrentUser: async () => {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) throw error;
            return { user, error: null };
        } catch (error) {
            console.error('Get current user error:', error);
            return { user: null, error: error.message };
        }
    },

    /**
     * Get current session
     */
    getSession: async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;
            return { session, error: null };
        } catch (error) {
            console.error('Get session error:', error);
            return { session: null, error: error.message };
        }
    },

    /**
     * Reset password - send recovery email
     */
    resetPassword: async (email) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'cricketscorer://reset-password',
            });

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Reset password error:', error);
            return { error: error.message };
        }
    },

    /**
     * Update password
     */
    updatePassword: async (newPassword) => {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Update password error:', error);
            return { error: error.message };
        }
    },

    /**
     * Subscribe to auth state changes
     */
    onAuthStateChange: (callback) => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                callback(event, session);
            }
        );

        return subscription;
    },
};

export default authService;
