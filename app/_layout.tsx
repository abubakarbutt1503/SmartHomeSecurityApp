import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import ThemeProvider from '../theme/ThemeProvider';
import { useAppTheme } from '../theme/ThemeProvider';

// Wrap the Stack component to get access to the theme
const ThemedStack = () => {
  const { theme, isDarkMode } = useAppTheme();
  
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
      <ThemedStack />
    </ThemeProvider>
  );
} 