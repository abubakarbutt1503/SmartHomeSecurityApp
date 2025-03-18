import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Dimensions } from 'react-native';
import { 
  Appbar, 
  Text, 
  Card, 
  Button, 
  IconButton, 
  SegmentedButtons,
  FAB, 
  Chip
} from 'react-native-paper';
import { navigateBack, navigateToHome } from '../../utils/navigation';
import { useAppTheme } from '../../theme/ThemeProvider';

// Mock camera data
const CAMERAS = [
  { id: '1', name: 'Front Door', online: true, recording: false },
  { id: '2', name: 'Back Yard', online: true, recording: true },
  { id: '3', name: 'Living Room', online: false, recording: false },
  { id: '4', name: 'Garage', online: true, recording: false },
];

const CameraCard = ({ camera }) => {
  const { theme } = useAppTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  return (
    <Card 
      style={{ 
        ...styles.cameraCard, 
        backgroundColor: theme.colors.surface,
        ...(isFullscreen && styles.fullscreenCard)
      }}
    >
      <Card.Title 
        title={camera.name} 
        titleStyle={{ color: theme.colors.onSurface }}
        right={(props) => (
          <View style={styles.cameraCardActions}>
            {camera.recording && (
              <Chip 
                mode="outlined" 
                style={{ 
                  backgroundColor: `${theme.colors.error}20`,
                  borderColor: theme.colors.error,
                }}
                textStyle={{ color: theme.colors.error }}
                icon="record-circle"
              >
                REC
              </Chip>
            )}
            
            <IconButton 
              {...props} 
              icon={isFullscreen ? "fullscreen-exit" : "fullscreen"} 
              onPress={() => setIsFullscreen(!isFullscreen)}
              iconColor={theme.colors.primary}
            />
          </View>
        )}
      />
      
      <Card.Content style={styles.cameraContent}>
        <View
          style={{ 
            ...styles.cameraPlaceholder,
            backgroundColor: theme.colors.surfaceVariant,
            borderColor: theme.colors.outline,
          }}
        >
          {camera.online ? (
            <>
              <IconButton 
                icon="video" 
                size={40} 
                iconColor={theme.colors.primary}
              />
              <Text style={{ color: theme.colors.onSurfaceVariant }}>Live feed placeholder</Text>
            </>
          ) : (
            <>
              <IconButton 
                icon="video-off" 
                size={40} 
                iconColor={theme.colors.error}
              />
              <Text style={{ color: theme.colors.onSurfaceVariant }}>Camera offline</Text>
            </>
          )}
        </View>
      </Card.Content>
      
      <Card.Actions>
        <IconButton 
          icon="video" 
          disabled={!camera.online}
          iconColor={camera.online ? theme.colors.primary : theme.colors.onSurfaceVariant}
        />
        <IconButton 
          icon={camera.recording ? "stop-circle" : "record-circle"} 
          disabled={!camera.online}
          iconColor={camera.recording ? theme.colors.error : (camera.online ? theme.colors.primary : theme.colors.onSurfaceVariant)}
        />
        <IconButton 
          icon="image-multiple" 
          disabled={!camera.online}
          iconColor={camera.online ? theme.colors.primary : theme.colors.onSurfaceVariant}
        />
        <IconButton 
          icon="cog" 
          iconColor={theme.colors.primary}
        />
      </Card.Actions>
    </Card>
  );
};

export default function CameraScreen() {
  const { theme } = useAppTheme();
  const [viewMode, setViewMode] = useState('grid');
  
  return (
    <View style={{ ...styles.container, backgroundColor: theme.colors.background }}>
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction onPress={navigateBack} color={theme.colors.onPrimary} />
        <Appbar.Content title="Cameras" color={theme.colors.onPrimary} />
        <Appbar.Action icon="home" onPress={navigateToHome} color={theme.colors.onPrimary} />
      </Appbar.Header>
      
      <View style={styles.viewControls}>
        <SegmentedButtons
          value={viewMode}
          onValueChange={setViewMode}
          buttons={[
            { value: 'grid', icon: 'view-grid', label: 'Grid' },
            { value: 'list', icon: 'view-list', label: 'List' },
          ]}
        />
        
        <View style={styles.statusIndicator}>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>Status: </Text>
          <View style={styles.onlineStatus}>
            <View style={{ 
              ...styles.statusDot, 
              backgroundColor: theme.colors.online 
            }} />
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              {CAMERAS.filter(c => c.online).length}/{CAMERAS.length} Online
            </Text>
          </View>
        </View>
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {viewMode === 'grid' ? (
          <View style={styles.cameraGrid}>
            {CAMERAS.map(camera => (
              <View key={camera.id} style={styles.gridItem}>
                <CameraCard camera={camera} />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.cameraList}>
            {CAMERAS.map(camera => (
              <CameraCard key={camera.id} camera={camera} />
            ))}
          </View>
        )}
      </ScrollView>
      
      <FAB
        icon="plus"
        style={{ 
          ...styles.fab,
          backgroundColor: theme.colors.secondary 
        }}
        color={theme.colors.onSecondary}
        onPress={() => console.log('Add camera')}
      />
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  viewControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  cameraGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8, // To compensate for gridItem padding
  },
  gridItem: {
    width: '50%',
    padding: 8,
  },
  cameraList: {
    gap: 16,
  },
  cameraCard: {
    borderRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  fullscreenCard: {
    marginBottom: 16,
  },
  cameraCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  cameraContent: {
    paddingVertical: 8,
  },
  cameraPlaceholder: {
    aspectRatio: 16/9,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
}); 