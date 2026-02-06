import supabase from '../config/supabase';

/**
 * User Profile Service
 * Handles all profile operations with Supabase
 */

export const userService = {
    /**
     * Create user profile manually (if trigger fails)
     */
    createProfile: async (userId, email) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .insert({
                    id: userId,
                    email: email,
                })
                .select()
                .single();

            if (error) throw error;
            return { profile: data, error: null };
        } catch (error) {
            console.error('Create profile error:', error);
            return { profile: null, error: error.message };
        }
    },

    /**
     * Get user profile by ID
     */
    getProfile: async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return { profile: data, error: null };
        } catch (error) {
            console.error('Get profile error:', error);
            return { profile: null, error: error.message };
        }
    },

    /**
     * Update user profile
     */
    updateProfile: async (userId, updates) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return { profile: data, error: null };
        } catch (error) {
            console.error('Update profile error:', error);
            return { profile: null, error: error.message };
        }
    },

    /**
     * Complete onboarding for Player
     */
    completePlayerOnboarding: async (userId, playerData) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({
                    role: 'player',
                    full_name: playerData.fullName,
                    batting_style: playerData.battingStyle,
                    bowling_type: playerData.bowlingType,
                    preferred_position: playerData.preferredPosition,
                    jersey_number: playerData.jerseyNumber,
                    profile_photo_url: playerData.profilePhotoUrl || null,
                    is_onboarded: true,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return { profile: data, error: null };
        } catch (error) {
            console.error('Complete player onboarding error:', error);
            return { profile: null, error: error.message };
        }
    },

    /**
     * Complete onboarding for Scorer
     */
    completeScorerOnboarding: async (userId, scorerData) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({
                    role: 'scorer',
                    full_name: scorerData.fullName,
                    experience_level: scorerData.experienceLevel,
                    profile_photo_url: scorerData.profilePhotoUrl || null,
                    is_onboarded: true,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return { profile: data, error: null };
        } catch (error) {
            console.error('Complete scorer onboarding error:', error);
            return { profile: null, error: error.message };
        }
    },

    /**
     * Upload profile photo
     */
    uploadProfilePhoto: async (userId, fileUri) => {
        try {
            // Create file from URI
            const fileName = `${userId}-${Date.now()}.jpg`;
            const filePath = `avatars/${fileName}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, {
                    uri: fileUri,
                    type: 'image/jpeg',
                    name: fileName,
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            return { url: publicUrl, error: null };
        } catch (error) {
            console.error('Upload profile photo error:', error);
            return { url: null, error: error.message };
        }
    },
};

export default userService;
