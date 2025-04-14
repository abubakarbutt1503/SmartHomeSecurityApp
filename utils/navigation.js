// Navigation utility functions
import { router } from 'expo-router';

// Auth screens navigation
export const navigateToSignup = () => {
  router.push('/auth/signup');
};

export const navigateToLogin = () => {
  router.push('/auth/login');
};

export const navigateToResetPassword = () => {
  router.push('/auth/reset-password');
};

// Home dashboard navigation
export const navigateToHome = () => {
  router.replace('/home');
};

// Home tab screens navigation
export const navigateToDevices = () => {
  router.push('/home/devices');
};

export const navigateToAlerts = () => {
  router.push('/home/alerts');
};

export const navigateToSettings = () => {
  router.push('/home/settings');
};

export const navigateToCamera = () => {
  router.push('/home/camera');
};

export const navigateToActivity = () => {
  router.push('/home/activity');
};

export const navigateToBoundary = () => {
  router.push('/home/add-boundary');
};

// Common navigation functions
export const navigateBack = () => {
  router.back();
};

// Function for sign out
export const handleSignOut = () => {
  // Clear any auth tokens or user data here
  // For example: clearAuthData();
  
  // Navigate back to landing page
  router.replace('/');
};