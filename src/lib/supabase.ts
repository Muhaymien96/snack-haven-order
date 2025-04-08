
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// These are public keys - safe to expose in client-side code
const supabaseUrl = 'https://xbwcqxjgappwbjkcokdr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhid2NxeGpnYXBwd2Jqa2Nva2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMDkwMjUsImV4cCI6MjA1OTY4NTAyNX0.YXq2e39kqzSR75pbWUZXV4h99NmJa94AmRW3oRcNsC8';

// Create a single supabase client for the entire app
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signUp = async (
  name: string,
  surname: string,
  blockNumber: number,
  unitNumber: number,
  mobileNumber: string,
  password: string
) => {
  const { data, error } = await supabase.auth.signUp({
    email: `${mobileNumber}@user.snackhaven.co.za`, // Using mobile as unique identifier
    password,
    options: {
      data: {
        name,
        surname,
        block_number: blockNumber,
        unit_number: unitNumber,
        mobile_number: mobileNumber,
      },
    },
  });
  
  return { data, error };
};

export const signIn = async (mobileNumber: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: `${mobileNumber}@user.snackhaven.co.za`,
    password,
  });
  
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
};
