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
import { useAppTheme } from '../../theme/ThemeProvider';

export default function YoloCamera() {
  const { theme } = useAppTheme();
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
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
            {serverStatus === 'checking' ? 'Checking server connection...' : 'Processing...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.errorContainer}>
            <Text style={[styles.errorTitle, { color: theme.colors.error }]}>Connection Error</Text>
            <Text style={[styles.errorMessage, { color: theme.colors.onBackground }]}>
              Unable to connect to the video stream server.
            </Text>
            <Text style={[styles.errorDetails, { color: theme.colors.onSurfaceVariant }]}>
              Make sure the Flask server is running at:{'\n'}
              {SERVER_URL}
            </Text>
            
            <View style={styles.errorButtons}>
              <TouchableOpacity 
                style={[styles.retryButton, { backgroundColor: theme.colors.primary }]} 
                onPress={retryConnection}
              >
                <Text style={[styles.retryButtonText, { color: theme.colors.onPrimary }]}>Retry Connection</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.browserButton, { backgroundColor: theme.colors.secondary }]} 
                onPress={openInBrowser}
              >
                <Text style={[styles.browserButtonText, { color: theme.colors.onSecondary }]}>Open in Browser</Text>
              </TouchableOpacity>
            </View>
            
            <View style={[styles.helpSection, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline }]}>
              <Text style={[styles.helpTitle, { color: theme.colors.onSurface }]}>Troubleshooting:</Text>
              <Text style={[styles.helpText, { color: theme.colors.onSurfaceVariant }]}>1. Check if your PC and phone are on the same network</Text>
              <Text style={[styles.helpText, { color: theme.colors.onSurfaceVariant }]}>2. Verify the IP address is correct</Text>
              <Text style={[styles.helpText, { color: theme.colors.onSurfaceVariant }]}>3. Make sure the Flask server is running</Text>
              <Text style={[styles.helpText, { color: theme.colors.onSurfaceVariant }]}>4. Check if port 5000 is accessible</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outline }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>YOLO Camera</Text>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, { backgroundColor: isStreamActive ? theme.colors.secondary : theme.colors.error }]} />
          <Text style={[styles.statusText, { color: theme.colors.onSurface }]}>
            {isStreamActive ? 'Streaming' : 'Stopped'}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Stream Controls */}
        <View style={[styles.controlsSection, { borderBottomColor: theme.colors.outline }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Stream Controls</Text>
          <View style={styles.controls}>
            <TouchableOpacity 
              style={[
                styles.controlButton, 
                { 
                  backgroundColor: isStreamActive ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
                  borderColor: theme.colors.outline
                }
              ]} 
              onPress={startStream}
              disabled={isStreamActive || isLoading}
            >
              <Text style={[styles.controlButtonText, { color: theme.colors.onSurface }]}>Start Stream</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.controlButton, 
                { 
                  backgroundColor: !isStreamActive ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
                  borderColor: theme.colors.outline
                }
              ]} 
              onPress={stopStream}
              disabled={!isStreamActive || isLoading}
            >
              <Text style={[styles.controlButtonText, { color: theme.colors.onSurface }]}>Stop Stream</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stream Access */}
        <View style={[styles.accessSection, { borderBottomColor: theme.colors.outline }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Access Video Stream</Text>
          
          <TouchableOpacity 
            style={[styles.accessButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]} 
            onPress={openVideoFeedInBrowser}
          >
            <Text style={[styles.accessButtonText, { color: theme.colors.onSurface }]}>Open Video Feed</Text>
            <Text style={[styles.accessButtonSubtext, { color: theme.colors.onSurfaceVariant }]}>View real-time YOLO detection</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.accessButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]} 
            onPress={openWebInterface}
          >
            <Text style={[styles.accessButtonText, { color: theme.colors.onSurface }]}>Open Web Interface</Text>
            <Text style={[styles.accessButtonSubtext, { color: theme.colors.onSurfaceVariant }]}>Full control panel with video</Text>
          </TouchableOpacity>
        </View>

        {/* Server Information */}
        <View style={[styles.infoSection, { borderBottomColor: theme.colors.outline }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Server Information</Text>
          <View style={[styles.infoRow, { borderBottomColor: theme.colors.outline }]}>
            <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Status:</Text>
            <Text style={[styles.infoValue, { color: isStreamActive ? theme.colors.secondary : theme.colors.error }]}>
              {isStreamActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
          <View style={[styles.infoRow, { borderBottomColor: theme.colors.outline }]}>
            <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Server:</Text>
            <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>{SERVER_URL}</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomColor: theme.colors.outline }]}>
            <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Model:</Text>
            <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>YOLOv5s</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomColor: theme.colors.outline }]}>
            <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Source:</Text>
            <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>Webcam (0)</Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>How to Use</Text>
          <Text style={[styles.instructionText, { color: theme.colors.onSurfaceVariant }]}>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
  },
  sectionTitle: {
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
    borderWidth: 1,
    minWidth: 120,
    alignItems: 'center',
  },
  controlButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  accessSection: {
    padding: 20,
    borderBottomWidth: 1,
  },
  accessButton: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
  },
  accessButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  accessButtonSubtext: {
    fontSize: 14,
  },
  infoSection: {
    padding: 20,
    borderBottomWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  instructionsSection: {
    padding: 20,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorDetails: {
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
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  browserButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  browserButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  helpSection: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  helpText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
});
