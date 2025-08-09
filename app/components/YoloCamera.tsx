import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  Text, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Linking,
  ScrollView
} from 'react-native';

export default function YoloCamera() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');
  
  // Use your PC's IP address here - make sure it matches the Flask server
  const SERVER_URL = 'http://192.168.100.35:5000';
  const VIDEO_FEED_URL = `${SERVER_URL}/video_feed`;
  const CONTROL_URL = `${SERVER_URL}`;

  useEffect(() => {
    // Check if server is reachable when component mounts
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${SERVER_URL}/health`);
      if (response.ok) {
        setHasError(false);
        setServerStatus('connected');
        
        // Check if stream is already running
        const statusResponse = await fetch(`${SERVER_URL}/status`);
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          setIsStreamActive(statusData.is_streaming);
        }
      } else {
        setHasError(true);
        setServerStatus('error');
      }
    } catch (error) {
      console.error('Server connection error:', error);
      setHasError(true);
      setServerStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const startStream = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${SERVER_URL}/start_stream`);
      const data = await response.json();
      
      if (data.success) {
        setIsStreamActive(true);
        setHasError(false);
        Alert.alert(
          'Stream Started', 
          'Video stream is now running. You can view it in your browser.',
          [
            {
              text: 'View Stream',
              onPress: () => openVideoFeedInBrowser()
            },
            {
              text: 'OK',
              style: 'cancel'
            }
          ]
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to start stream');
      }
    } catch (error) {
      console.error('Error starting stream:', error);
      Alert.alert('Error', 'Failed to start stream. Please check server connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const stopStream = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/stop_stream`);
      const data = await response.json();
      
      if (data.success) {
        setIsStreamActive(false);
        Alert.alert('Stream Stopped', 'Video stream has been stopped.');
      } else {
        Alert.alert('Error', data.message || 'Failed to stop stream');
      }
    } catch (error) {
      console.error('Error stopping stream:', error);
      Alert.alert('Error', 'Failed to stop stream');
    }
  };

  const retryConnection = () => {
    setHasError(false);
    setServerStatus('checking');
    checkServerStatus();
  };

  const openInBrowser = () => {
    Linking.openURL(CONTROL_URL);
  };

  const openVideoFeedInBrowser = () => {
    Linking.openURL(VIDEO_FEED_URL);
  };

  const openWebInterface = () => {
    Linking.openURL(CONTROL_URL);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>
            {serverStatus === 'checking' ? 'Checking server connection...' : 'Processing...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasError) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Connection Error</Text>
            <Text style={styles.errorMessage}>
              Unable to connect to the video stream server.
            </Text>
            <Text style={styles.errorDetails}>
              Make sure the Flask server is running at:{'\n'}
              {SERVER_URL}
            </Text>
            
            <View style={styles.errorButtons}>
              <TouchableOpacity style={styles.retryButton} onPress={retryConnection}>
                <Text style={styles.retryButtonText}>Retry Connection</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.browserButton} onPress={openInBrowser}>
                <Text style={styles.browserButtonText}>Open in Browser</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.helpSection}>
              <Text style={styles.helpTitle}>Troubleshooting:</Text>
              <Text style={styles.helpText}>1. Check if your PC and phone are on the same network</Text>
              <Text style={styles.helpText}>2. Verify the IP address is correct</Text>
              <Text style={styles.helpText}>3. Make sure the Flask server is running</Text>
              <Text style={styles.helpText}>4. Check if port 5000 is accessible</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>YOLO Camera</Text>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, { backgroundColor: isStreamActive ? '#28a745' : '#dc3545' }]} />
          <Text style={styles.statusText}>
            {isStreamActive ? 'Streaming' : 'Stopped'}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Stream Controls */}
        <View style={styles.controlsSection}>
          <Text style={styles.sectionTitle}>Stream Controls</Text>
          <View style={styles.controls}>
            <TouchableOpacity 
              style={[styles.controlButton, isStreamActive && styles.controlButtonActive]} 
              onPress={startStream}
              disabled={isStreamActive || isLoading}
            >
              <Text style={styles.controlButtonText}>Start Stream</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.controlButton, !isStreamActive && styles.controlButtonActive]} 
              onPress={stopStream}
              disabled={!isStreamActive || isLoading}
            >
              <Text style={styles.controlButtonText}>Stop Stream</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stream Access */}
        <View style={styles.accessSection}>
          <Text style={styles.sectionTitle}>Access Video Stream</Text>
          
          <TouchableOpacity style={styles.accessButton} onPress={openVideoFeedInBrowser}>
            <Text style={styles.accessButtonText}>Open Video Feed</Text>
            <Text style={styles.accessButtonSubtext}>View real-time YOLO detection</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.accessButton} onPress={openWebInterface}>
            <Text style={styles.accessButtonText}>Open Web Interface</Text>
            <Text style={styles.accessButtonSubtext}>Full control panel with video</Text>
          </TouchableOpacity>
        </View>

        {/* Server Information */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Server Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={[styles.infoValue, { color: isStreamActive ? '#28a745' : '#dc3545' }]}>
              {isStreamActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Server:</Text>
            <Text style={styles.infoValue}>{SERVER_URL}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Model:</Text>
            <Text style={styles.infoValue}>YOLOv5s</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Source:</Text>
            <Text style={styles.infoValue}>Webcam (0)</Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={styles.sectionTitle}>How to Use</Text>
          <Text style={styles.instructionText}>
            1. Press "Start Stream" to begin video processing{'\n'}
            2. Use "Open Video Feed" to view the stream{'\n'}
            3. Use "Open Web Interface" for full control{'\n'}
            4. Press "Stop Stream" when finished
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  controlsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  controls: {
    flexDirection: 'row',
    gap: 15,
    justifyContent: 'center',
  },
  controlButton: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#555',
    minWidth: 120,
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  controlButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  accessSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  accessButton: {
    backgroundColor: '#2c2c2c',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#444',
  },
  accessButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  accessButtonSubtext: {
    color: '#888',
    fontSize: 14,
  },
  infoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  infoLabel: {
    color: '#888',
    fontSize: 14,
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  instructionsSection: {
    padding: 20,
  },
  instructionText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 15,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  errorTitle: {
    color: '#ff3b30',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorDetails: {
    color: '#888',
    fontSize: 14,
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorButtons: {
    flexDirection: 'row',
    gap: 15,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  browserButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  browserButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helpSection: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  helpTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  helpText: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
});
