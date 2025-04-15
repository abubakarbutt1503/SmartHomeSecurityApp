import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import ThemeProvider from '../theme/ThemeProvider';
import { useAppTheme } from '../theme/ThemeProvider';
import SupabaseProvider from '../context/SupabaseProvider';
import { useSupabase } from '../context/SupabaseProvider';
import { useEffect } from 'react';
import { useSegments, useRouter } from 'expo-router';

// Auth protection hook to prevent unauthorized access
function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const { user, loading } = useSupabase();

  useEffect(() => {
    // Skip protection logic while still loading
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inHomeGroup = segments[0] === 'home';
    // Improved root screen detection to handle all possible segment states
    const isRootScreen = !segments[0] || segments[0] === '';
    
    // Special case for password reset confirmation page
    const isResetPasswordConfirm = segments[0] === 'auth' && segments.length > 1 && segments[1] === 'reset-password-confirm';
    
    // If this is a password reset page, don't redirect regardless of auth state
    if (isResetPasswordConfirm) {
      console.log('Password reset confirmation page detected, skipping auth redirect');
      return;
    }

    // Determine where to redirect based on auth state
    if (!user) {
      // If user is not signed in and trying to access protected routes
      if (inHomeGroup) {
        router.replace('/');
      }
    } else {
      // If user is signed in and trying to access auth screens or root
      if (inAuthGroup || isRootScreen) {
        router.replace('/home');
      }
    }
  }, [user, loading, segments, router]);
}

// Wrap the Stack component to get access to the theme
const ThemedStack = () => {
  const { theme, isDarkMode } = useAppTheme();
  useProtectedRoute();
  
  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { 
            backgroundColor: theme.colors.background 
          },
        }}
      />
    </>
  );
};

export default function Layout() {
  return (
    <ThemeProvider>
      <SupabaseProvider>
        <ThemedStack />
      </SupabaseProvider>
    </ThemeProvider>
  );
}