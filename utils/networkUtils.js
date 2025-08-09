/**
 * Network utility functions for the Home Safety App
 */
import NetInfo from '@react-native-community/netinfo';

/**
 * Check if the device is connected to the internet
 * @returns {Promise<boolean>} True if connected, false otherwise
 */
export const isNetworkConnected = async () => {
  const state = await NetInfo.fetch();
  return state.isConnected && state.isInternetReachable;
};

/**
 * Check if a specific server is reachable
 * @param {string} url - The URL to check
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<boolean>} True if server is reachable, false otherwise
 */
export const isServerReachable = async (url, timeout = 5000) => {
  try {
    // First check if we have network connectivity
    const isConnected = await isNetworkConnected();
    if (!isConnected) {
      console.log('No network connectivity');
      return false;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // Try to fetch the health endpoint of Supabase
    const healthUrl = url.replace(/\/$/, '') + '/rest/v1/';
    console.log('Checking server reachability at:', healthUrl);
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzc2ZyZ21maW9wYnpkd3p1Y2ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MTY5ODAsImV4cCI6MjA1NzI5Mjk4MH0.ktQ4WtnMKoOvIJCXr3N583KuY4p-BGGyuzk5BxtXekM'
      }
    });
    
    clearTimeout(timeoutId);
    
    // Even if we get a 401 (unauthorized), it means the server is reachable
    return response.status < 500;
  } catch (error) {
    console.error(`Server connectivity check failed for ${url}:`, error);
    return false;
  }
};

/**
 * Enhanced fetch function with timeout and error handling
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Response>} - Fetch response
 */
export const enhancedFetch = async (url, options = {}, timeout = 10000) => {
  // First check network connectivity
  const isConnected = await isNetworkConnected();
  if (!isConnected) {
    throw new Error('No internet connection. Please check your network settings.');
  }
  
  // Setup timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request to ${url} timed out after ${timeout}ms`);
    }
    throw error;
  }
};

/**
 * Regular polling to check server availability
 * @param {string} url - URL to check
 * @param {function} onAvailable - Callback when server becomes available
 * @param {function} onUnavailable - Callback when server is unavailable
 * @param {number} interval - Polling interval in milliseconds
 * @returns {Object} - Control object with start and stop methods
 */
export const serverAvailabilityMonitor = (
  url, 
  onAvailable = () => {},
  onUnavailable = () => {},
  interval = 5000
) => {
  let timerId = null;
  let lastStatus = null;
  
  const checkServer = async () => {
    const isAvailable = await isServerReachable(url);
    
    // Only trigger callbacks when status changes
    if (isAvailable !== lastStatus) {
      if (isAvailable) {
        onAvailable();
      } else {
        onUnavailable();
      }
      lastStatus = isAvailable;
    }
  };
  
  return {
    start: () => {
      if (!timerId) {
        // Check immediately
        checkServer();
        // Then start polling
        timerId = setInterval(checkServer, interval);
      }
    },
    stop: () => {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
    },
    isRunning: () => timerId !== null,
    check: checkServer, // Allow manual checks
  };
}; 