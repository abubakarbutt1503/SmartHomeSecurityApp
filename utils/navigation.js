// Navigation utility functions
import { router } from 'expo-router';

// Function to navigate to the signup page
export const navigateToSignup = () => {
  router.push('/auth/signup');
};

// Function to navigate to the login page
export const navigateToLogin = () => {
  router.push('/auth/login');
};

// Function to navigate to the home page
export const navigateToHome = () => {
  router.replace('/home');
};

// Function to navigate back
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