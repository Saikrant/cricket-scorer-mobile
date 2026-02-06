import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Replace with your actual Supabase credentials
// Get these from: https://supabase.com/dashboard → Your Project → Settings → API
const SUPABASE_URL = 'https://pwujwfmmhhctfcvwogrr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3dWp3Zm1taGhjdGZjdndvZ3JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNTk4MTMsImV4cCI6MjA4NTgzNTgxM30.vFqVbjdRZu_pqa27QBZOKN2-404vK7k3PKVuoZNb99A';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

export default supabase;
