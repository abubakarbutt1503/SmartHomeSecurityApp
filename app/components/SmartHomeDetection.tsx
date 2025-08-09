import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import { startDetection, setShapes, sendPushToken } from '../../utils/api';

export default function SmartHomeDetection() {
  useEffect(() => {
    registerPushToken();
  }, []);

  const registerPushToken = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token');
      return;
    }
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;
    console.log("Expo Push Token:", token);
    await sendPushToken(token);
  };

  const handleStartDetection = async () => {
    // Example rectangle boundary
    const shapes = [
      {
        type: "rectangle",
        data: [[100, 100], [300, 300]],
      },
    ];
    await setShapes(shapes);
    await startDetection();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Home Detection</Text>
      <Button title="Start Detection" onPress={handleStartDetection} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
}); 