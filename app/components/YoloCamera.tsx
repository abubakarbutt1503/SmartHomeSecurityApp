import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert, Platform } from 'react-native';
import { IconButton } from 'react-native-paper';
import { Camera } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { useAppTheme } from '../../theme/ThemeProvider';
import { isServerReachable, serverAvailabilityMonitor } from '../../utils/networkUtils';

// Configuration
// For mobile devices, 'localhost' won't work because it refers to the device itself
// Replace with your actual machine's IP address on the same network
const DETECTION_SERVER_URL = 'http://192.168.1.X:5000/detect'; // Update this with your computer's IP address
const SERVER_BASE_URL = 'http://192.168.1.X:5000'; // Update this with your computer's IP address
const DETECTION_INTERVAL = 1000; // milliseconds between detections

// Interface for detection objects
interface Detection {
  box: [number, number, number, number]; // [x, y, width, height] - normalized coordinates
  class: string;
  confidence: number;
}

interface YoloCameraProps {
  onClose?: () => void;
  style?: any;
}

export default function YoloCamera({ onClose, style }: YoloCameraProps) {
  const { theme } = useAppTheme();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  
  const cameraRef = useRef<Camera | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Request camera permissions on mount
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      // Check server status
      try {
        // Use isServerReachable to check if server is up
        const isReachable = await isServerReachable(`${SERVER_BASE_URL}/status`);
        
        if (!isReachable) {
          setServerStatus('error');
          console.error('YOLOv5 server is not reachable');
          return;
        }
        
        // If reachable, then check status
        const response = await fetch(`${SERVER_BASE_URL}/status`);
        const data = await response.json();
        if (data.status === 'ok' && data.model_loaded) {
          setServerStatus('connected');
        } else {
          setServerStatus('error');
        }
      } catch (error) {
        console.error('Error connecting to YOLOv5 server:', error);
        setServerStatus('error');
      }
      
      // Setup server availability monitor
      const monitor = serverAvailabilityMonitor(
        `${SERVER_BASE_URL}/status`,
        () => {
          console.log('YOLOv5 server is now available');
          setServerStatus('connected');
        },
        () => {
          console.log('YOLOv5 server is not available');
          setServerStatus('error');
        },
        10000 // Check every 10 seconds
      );
      
      // Start monitoring
      monitor.start();
      
      // Return cleanup function
      return () => {
        if (detectionIntervalRef.current) {
          clearInterval(detectionIntervalRef.current);
        }
        // Stop monitoring
        monitor.stop();
      };
    })();
  }, []);

  // Function to capture image and send to YOLOv5 server for detection
  const detectObjects = async () => {
    if (!cameraRef.current || isLoading) return;
    
    try {
      setIsLoading(true);
      
      // Check if server is still connected
      if (serverStatus !== 'connected') {
        console.error('YOLOv5 server is not connected');
        Alert.alert(
          "Server Unavailable",
          "The YOLOv5 detection server is not available. Please check your connection and try again.",
          [{ text: "OK" }]
        );
        setIsDetecting(false);
        return;
      }
      
      // Capture photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: true,
        exif: false,
      });
      
      // Setup request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      try {
        // Send to server for detection
        const response = await fetch(DETECTION_SERVER_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: photo.base64,
          }),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          setDetections(result.detections);
        } else {
          console.error('Detection error:', result.error);
          throw new Error(result.error || 'Unknown detection error');
        }
      } catch (fetchError) {
        console.error('Fetch error during object detection:', fetchError);
        
        if (fetchError.name === 'AbortError') {
          Alert.alert(
            "Request Timeout",
            "The detection request timed out. The server might be overloaded or unreachable.",
            [{ text: "OK" }]
          );
        } else {
          Alert.alert(
            "Detection Error",
            "Failed to communicate with the detection server. Please check your connection.",
            [{ text: "OK" }]
          );
        }
        
        // Update server status if there's a connection issue
        setServerStatus('error');
        setIsDetecting(false);
      }
    } catch (error) {
      console.error('Error during object detection:', error);
      Alert.alert('Detection Error', 'Failed to detect objects. Please check server connection.');
      setIsDetecting(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle continuous detection
  const toggleLiveDetection = () => {
    if (isDetecting) {
      // Stop detection
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      setIsDetecting(false);
    } else {
      // Start detection
      detectObjects(); // Run once immediately
      detectionIntervalRef.current = setInterval(detectObjects, DETECTION_INTERVAL);
      setIsDetecting(true);
    }
  };

  // Take a single photo and detect
  const takePhotoAndDetect = async () => {
    if (isDetecting) return; // Don't allow single photos during live detection
    await detectObjects();
  };

  // Render detection boxes
  const renderDetectionBoxes = () => {
    // Only show people detections (filter if needed)
    // const peopleDetections = detections.filter(d => d.class === 'person');
    
    return detections.map((detection, index) => {
      const [x, y, width, height] = detection.box;
      const color = detection.class === 'person' ? theme.colors.error : theme.colors.primary;
      
      return (
        <View
          key={index}
          style={{
            position: 'absolute',
            borderWidth: 2,
            borderColor: color,
            left: `${x * 100}%`,
            top: `${y * 100}%`,
            width: `${width * 100}%`,
            height: `${height * 100}%`,
          }}
        >
          <Text style={{ 
            backgroundColor: color, 
            color: 'white', 
            fontSize: 10, 
            padding: 2,
            position: 'absolute',
            top: 0,
            left: 0,
          }}>
            {detection.class} {Math.round(detection.confidence * 100)}%
          </Text>
        </View>
      );
    });
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }
  
  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }

  return (
    <View style={[styles.container, style]}>
      <Camera 
        ref={cameraRef}
        style={styles.camera} 
        type={type}
      >
        {/* Detection boxes overlay */}
        <View style={styles.detectionOverlay}>
          {renderDetectionBoxes()}
        </View>
        
        {/* Status indicator */}
        {serverStatus === 'connecting' && (
          <View style={styles.statusIndicator}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.statusText}>Connecting to YOLOv5 server...</Text>
          </View>
        )}
        
        {serverStatus === 'error' && (
          <View style={styles.statusIndicator}>
            <Text style={[styles.statusText, { color: theme.colors.error }]}>
              YOLOv5 server not available
            </Text>
          </View>
        )}
        
        {isLoading && (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}
        
        {/* Camera controls */}
        <View style={styles.controlsContainer}>
          <IconButton 
            icon="camera-flip" 
            size={30}
            iconColor="white"
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}
          />
          
          <IconButton 
            icon="camera"
            size={40}
            iconColor="white"
            onPress={takePhotoAndDetect}
            disabled={isDetecting || isLoading}
          />
          
          <IconButton 
            icon={isDetecting ? "stop-circle" : "play-circle"}
            size={30}
            iconColor={isDetecting ? theme.colors.error : "white"}
            onPress={toggleLiveDetection}
            disabled={serverStatus !== 'connected'}
          />
          
          {onClose && (
            <IconButton 
              icon="close"
              size={30}
              iconColor="white"
              onPress={onClose}
            />
          )}
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 10,
  },
  detectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  statusIndicator: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
  },
  statusText: {
    color: 'white',
    marginLeft: 8,
  },
}); 