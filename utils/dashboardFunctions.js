// Dashboard utility functions
import { Alert } from 'react-native';

// Function to arm or disarm the system
export const toggleSystemArming = (currentState, setState) => {
  if (!currentState) {
    // Arming the system
    Alert.alert(
      "Arm System",
      "Are you sure you want to arm the security system?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Arm", 
          onPress: () => {
            setState(true);
            // Here you would typically make an API call to your backend
            // to actually arm the system
            Alert.alert("System Armed", "Your security system is now armed.");
          }
        }
      ]
    );
  } else {
    // Disarming the system
    Alert.alert(
      "Disarm System",
      "Are you sure you want to disarm the security system?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Disarm", 
          onPress: () => {
            setState(false);
            // Here you would typically make an API call to your backend
            // to actually disarm the system
            Alert.alert("System Disarmed", "Your security system is now disarmed.");
          }
        }
      ]
    );
  }
};

// Function to refresh system status
export const refreshSystemStatus = () => {
  // Here you would make an API call to fetch the latest system status
  Alert.alert("Refreshing", "Checking system status...");
  
  // Simulating a network request
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        systemStatus: 'Normal',
        lastCheck: 'Just now',
        batteryLevel: 75
      });
    }, 1000);
  });
};

 