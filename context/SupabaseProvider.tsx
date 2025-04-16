import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient, SupabaseClient, Session, AuthChangeEvent } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { router } from 'expo-router';
import { Alert, Linking } from 'react-native';
// Import environment variables from .env file
// import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

// Hardcoded Supabase credentials
const SUPABASE_URL = "https://essfrgmfiopbzdwzucfn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzc2ZyZ21maW9wYnpkd3p1Y2ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MTY5ODAsImV4cCI6MjA1NzI5Mjk4MH0.ktQ4WtnMKoOvIJCXr3N583KuY4p-BGGyuzk5BxtXekM";


// Create types for the Supabase context
interface SupabaseContextType {
  supabase: SupabaseClient | null;
  user: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, userData?: any) => Promise<any>;
  signOut: () => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  updateUserPassword: (password: string, token?: string) => Promise<any>;
}

// Create a default context
const SupabaseContext = createContext<SupabaseContextType>({
  supabase: null,
  user: null,
  loading: true,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signOut: async () => ({}),
  resetPassword: async () => ({}),
  updateUserPassword: async (password: string, token?: string) => ({})
});

// Create a hook to use the context
export const useSupabase = () => useContext(SupabaseContext);

// Define the provider props
interface SupabaseProviderProps {
  children: ReactNode;
}

// Define the SupabaseProvider component
export const SupabaseProvider = ({ children }: SupabaseProviderProps) => {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize Supabase client
  useEffect(() => {
    try {
      // Log Supabase credentials for debugging
      console.log('Supabase URL:', SUPABASE_URL);
      console.log('Supabase Anon Key:', SUPABASE_ANON_KEY ? 'Key exists' : 'Key is missing');
      
      // No need to check for environment variables as we're using hardcoded values
      
      // Create Supabase client using the imported environment variables
      const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true, // Enable detecting auth params in URL
          flowType: 'pkce', // Use PKCE flow for better security
          onAuthStateChange: (event: AuthChangeEvent, session: Session | null) => {
            console.log('Auth state change event:', event, 'Session:', session ? 'Available' : 'None');
          }
        },
      });
      setSupabase(client);
      
      // Subscribe to auth state changes
      const { data: { subscription } } = client.auth.onAuthStateChange(
        (event: AuthChangeEvent, session: Session | null) => {
          setUser(session?.user || null);
          setLoading(false);
          
          // Handle auth state changes for navigation
          if (event === 'SIGNED_IN') {
            // Redirect to dashboard/home when signed in
            router.replace('/home');
          } else if (event === 'SIGNED_OUT') {
            // Redirect to welcome screen when signed out
            router.replace('/');
          } else if (event === 'PASSWORD_RECOVERY') {
            // Handle password recovery event - redirect to reset password confirm page
            console.log('Password recovery event detected, redirecting to reset password page');
            router.replace('/auth/reset-password-confirm');
          }
        }
      );
      
      // Check current session
      client.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user || null);
        setLoading(false);
      });
      
      // Cleanup subscription
      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error initializing Supabase client:', error);
      setLoading(false);
    }
  }, []);

  // Define auth functions
  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: { message: 'Supabase client not initialized' } };
    try {
      const response = await supabase.auth.signInWithPassword({ email, password });
      if (response.error) {
        return { error: response.error };
      }
      return response;
    } catch (error: any) {
      return { error: { message: error.message || 'An error occurred during sign in' } };
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    if (!supabase) return { error: { message: 'Supabase client not initialized' } };
    try {
      const response = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: userData,
          emailRedirectTo: 'homesafetyapp://auth/callback',
        },
      });
      
      if (response.error) {
        return { error: response.error };
      }
      
      // Check if email confirmation is required
      if (response.data?.user && response.data?.session === null) {
        Alert.alert(
          "Email Verification Required",
          "Please check your email to verify your account before logging in."
        );
      }
      
      return response;
    } catch (error: any) {
      return { error: { message: error.message || 'An error occurred during sign up' } };
    }
  };

  const signOut = async () => {
    if (!supabase) return { error: { message: 'Supabase client not initialized' } };
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert('Error', error.message || 'An error occurred during sign out');
        return { error };
      }
      router.replace('/auth/login');
      return { error: null };
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred during sign out');
      return { error: { message: error.message || 'An error occurred during sign out' } };
    }
  };

  const resetPassword = async (email: string) => {
    if (!supabase) return { error: { message: 'Supabase client not initialized' } };
    try {
      // Basic email validation to prevent the "invalid format" error
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { error: { message: 'Please enter a valid email address' } };
      }
      
      // Use the correct URL scheme format for deep linking
      // Make sure this matches exactly with the scheme in app.json
      const redirectUrl = 'homesafetyapp://auth/reset-password-confirm';
      
      console.log('Using redirect URL for password reset:', redirectUrl);
      console.log('Resetting password for email:', email);
      
      // Ensure we're using the correct Supabase API call with proper options
      const response = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      if (response.error) {
        console.error('Password reset error:', response.error);
        return { error: response.error };
      }
      
      // Provide user feedback about checking their email
      Alert.alert(
        "Password Reset Email Sent",
        "Please check your email for a password reset link. Make sure to check your spam folder if you don't see it."
      );
      
      console.log('Password reset email sent successfully');
      return response;
    } catch (error: any) {
      console.error('Exception during password reset:', error);
      return { error: { message: error.message || 'An error occurred during password reset' } };
    }
  };

  // Function to update user password (for password reset)
  const updateUserPassword = async (password: string, token?: string) => {
    if (!supabase) return { error: { message: 'Supabase client not initialized' } };
    try {
      console.log('Attempting to update user password');
      
      // The token should already be processed by the Supabase client when the deep link is opened
      // We just need to update the password, and Supabase will use the current session
      // (which includes the recovery token if this is a password reset flow)
      console.log('Token present:', token ? 'Yes' : 'No');
      
      // Update the password - this works for both normal users and recovery flows
      // as Supabase handles the session context automatically
      const response = await supabase.auth.updateUser({ password });
      
      if (response.error) {
        console.error('Error updating password:', response.error);
        return { error: response.error };
      }
      
      console.log('Password updated successfully');
      return response;
    } catch (error: any) {
      console.error('Exception during password update:', error);
      return { error: { message: error.message || 'An error occurred while updating password' } };
    }
  };

  // Provide the Supabase context to the app
  return (
    <SupabaseContext.Provider
      value={{
        supabase,
        user,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateUserPassword,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );

};

export default SupabaseProvider;