import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { Platform } from 'react-native';
import colors from './colors';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryLight,
    secondary: colors.secondary,
    secondaryContainer: colors.secondaryLight,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    error: colors.danger,
    errorContainer: '#FECDD3', // Light red background for error containers
    onPrimary: colors.textOnPrimary,
    onSecondary: colors.textOnPrimary,
    onSurface: colors.textPrimary,
    onSurfaceVariant: colors.textSecondary,
    outline: colors.border,
  },
  roundness: 8,
  elevation: {
    level0: 0,
    level1: 2,
    level2: 3,
    level3: 6,
    level4: 8,
    level5: 12,
  },
  mode: 'adaptive', // Adapt to system preferences
  animation: {
    scale: Platform.OS === 'ios' ? 1 : 0.9, // Slightly faster animations on Android
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#60A5FA', // Lighter blue for dark theme
    primaryContainer: '#1E3A8A', // Darker blue container for dark theme
    secondary: '#34D399', // Lighter green for dark theme
    secondaryContainer: '#065F46', // Darker green container for dark theme
    background: '#111827', // Very dark blue for background
    surface: '#1F2937', // Dark blue-gray for surfaces
    surfaceVariant: '#374151', // Slightly lighter surface for contrast
    error: '#F87171', // Lighter red for dark theme
    errorContainer: '#7F1D1D', // Dark red background for error containers
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSurface: '#F3F4F6', // Light gray for text on surfaces
    onSurfaceVariant: '#D1D5DB', // Lighter gray for secondary text
    outline: '#4B5563', // Medium gray for borders
  },
  roundness: 8,
  elevation: {
    level0: 0,
    level1: 2,
    level2: 3,
    level3: 6,
    level4: 8,
    level5: 12,
  },
  mode: 'adaptive',
  animation: {
    scale: Platform.OS === 'ios' ? 1 : 0.9,
  },
};

export type AppTheme = typeof lightTheme;

export default {
  light: lightTheme,
  dark: darkTheme,
}; 