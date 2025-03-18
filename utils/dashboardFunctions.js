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

// Function to trigger panic alarm
export const triggerPanicAlarm = () => {
  Alert.alert(
    "EMERGENCY PANIC ALARM",
    "Are you sure you want to trigger the panic alarm? This will alert authorities.",
    [
      { text: "Cancel", style: "cancel" },
      { 
        text: "TRIGGER ALARM", 
        style: "destructive",
        onPress: () => {
          // Here you would make an API call to trigger the alarm
          Alert.alert(
            "Alarm Triggered", 
            "Emergency services have been notified. Stay safe."
          );
        }
      }
    ]
  );
};

// Function to lock all connected smart locks
export const lockAllDevices = () => {
  Alert.alert(
    "Lock All Devices",
    "Do you want to lock all connected doors and windows?",
    [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Lock All", 
        onPress: () => {
          // Here you would make an API call to lock all devices
          Alert.alert("Devices Locked", "All connected doors and windows have been locked.");
        }
      }
    ]
  );
};

// Function to start recording on all cameras
export const recordAllCameras = () => {
  Alert.alert(
    "Record All Cameras",
    "Do you want to start recording on all cameras?",
    [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Start Recording", 
        onPress: () => {
          // Here you would make an API call to start recording on all cameras
          Alert.alert("Recording Started", "All cameras are now recording.");
        }
      }
    ]
  );
};

// Function to test all alarms
export const testAlarms = () => {
  Alert.alert(
    "Test Alarms",
    "Do you want to run a test of all alarm systems? This will produce sound.",
    [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Test Alarms", 
        onPress: () => {
          // Here you would make an API call to test the alarms
          Alert.alert("Testing", "Alarm test sequence initiated. This will last for 5 seconds.");
        }
      }
    ]
  );
}; 