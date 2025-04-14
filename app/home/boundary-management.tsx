import React, { useState, useRef } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, Image, TouchableOpacity, Dimensions, PanResponder } from 'react-native';
import {
  Appbar,
  Text,
  Card,
  Button,
  IconButton,
  Chip,
  Portal,
  Dialog,
  TextInput,
  List,
  Switch,
  Menu,
  Divider,
  FAB,
  SegmentedButtons,
  useTheme
} from 'react-native-paper';
import { useAppTheme } from '../../theme/ThemeProvider';
import { useNavigation, useRoute } from '@react-navigation/native';

// Define safe colors outside the component
const createSafeColors = (appTheme) => {
  return {
    primary: appTheme?.theme?.colors?.primary || '#6200ee',
    onPrimary: appTheme?.theme?.colors?.onPrimary || '#ffffff',
    primaryContainer: appTheme?.theme?.colors?.primaryContainer || '#f1e4ff',
    onPrimaryContainer: appTheme?.theme?.colors?.onPrimaryContainer || '#21005d',
    secondary: appTheme?.theme?.colors?.secondary || '#03dac6',
    onSecondary: appTheme?.theme?.colors?.onSecondary || '#ffffff',
    surface: appTheme?.theme?.colors?.surface || '#ffffff',
    onSurface: appTheme?.theme?.colors?.onSurface || '#121212',
    background: appTheme?.theme?.colors?.background || '#f6f6f6',
    error: appTheme?.theme?.colors?.error || '#b00020',
    onError: appTheme?.theme?.colors?.onError || '#ffffff',
    outline: appTheme?.theme?.colors?.outline || '#79747e'
  };
};

export default function BoundaryManagementScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { theme } = useAppTheme();
  const safeColors = createSafeColors({ theme });
  
  // Sample camera data
  const [cameras, setCameras] = useState([
    { id: '1', name: 'Front Door Camera', location: 'Front Door', isActive: true, hasBoundaries: true },
    { id: '2', name: 'Back Yard Camera', location: 'Back Yard', isActive: true, hasBoundaries: false },
    { id: '3', name: 'Kitchen Camera', location: 'Kitchen', isActive: false, hasBoundaries: false },
    { id: '4', name: 'Garage Camera', location: 'Garage', isActive: true, hasBoundaries: true },
  ]);
  
  // Boundary management state
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [boundaries, setBoundaries] = useState([
    { id: '1', cameraId: '1', name: 'Front Door Zone', color: '#FF5722', points: [{x: 0.2, y: 0.2}, {x: 0.4, y: 0.2}, {x: 0.4, y: 0.4}, {x: 0.2, y: 0.4}] },
    { id: '2', cameraId: '1', name: 'Porch Zone', color: '#2196F3', points: [{x: 0.5, y: 0.5}, {x: 0.7, y: 0.5}, {x: 0.7, y: 0.7}, {x: 0.5, y: 0.7}] },
    { id: '3', cameraId: '4', name: 'Car Zone', color: '#4CAF50', points: [{x: 0.3, y: 0.3}, {x: 0.6, y: 0.3}, {x: 0.6, y: 0.6}, {x: 0.3, y: 0.6}] },
  ]);
  
  // Drawing state
  const [drawingBoundary, setDrawingBoundary] = useState(false);
  const [currentPoints, setCurrentPoints] = useState([]);
  const [boundaryName, setBoundaryName] = useState('');
  const [boundaryColor, setBoundaryColor] = useState('#FF5722');
  const [nameDialogVisible, setNameDialogVisible] = useState(false);
  const [editingBoundary, setEditingBoundary] = useState(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedBoundary, setSelectedBoundary] = useState(null);
  
  // Reference to the drawing area
  const imageRef = useRef(null);
  
  // Calculate relative position from absolute
  const calculateRelativePosition = (absoluteX, absoluteY, callback) => {
    imageRef.current.measure((x, y, width, height, pageX, pageY) => {
      const relativeX = (absoluteX - pageX) / width;
      const relativeY = (absoluteY - pageY) / height;
      
      // Ensure points are within bounds
      const boundedX = Math.max(0, Math.min(1, relativeX));
      const boundedY = Math.max(0, Math.min(1, relativeY));
      
      callback({ x: boundedX, y: boundedY });
    });
  };
  
  // Handle tap on the camera preview
  const handleImageTap = (event) => {
    if (!drawingBoundary || !selectedCamera) return;
    
    const { locationX, locationY, pageX, pageY } = event.nativeEvent;
    
    calculateRelativePosition(pageX, pageY, (relativePosition) => {
      const newPoints = [...currentPoints, relativePosition];
      setCurrentPoints(newPoints);
      
      // If we have 4 points, finish the boundary
      if (newPoints.length === 4) {
        setDrawingBoundary(false);
        setNameDialogVisible(true);
      }
    });
  };
  
  // Complete boundary creation
  const completeBoundary = () => {
    if (currentPoints.length < 3) return;
    
    const newBoundary = {
      id: Date.now().toString(),
      cameraId: selectedCamera.id,
      name: boundaryName,
      color: boundaryColor,
      points: currentPoints
    };
    
    setBoundaries([...boundaries, newBoundary]);
    
    // Update camera to show it has boundaries
    setCameras(
      cameras.map(camera => 
        camera.id === selectedCamera.id 
          ? { ...camera, hasBoundaries: true } 
          : camera
      )
    );
    
    // Reset drawing state
    setNameDialogVisible(false);
    setCurrentPoints([]);
    setBoundaryName('');
  };
  
  // Update an existing boundary
  const updateBoundary = () => {
    if (!editingBoundary) return;
    
    const updatedBoundaries = boundaries.map(boundary =>
      boundary.id === editingBoundary.id
        ? { ...boundary, name: boundaryName, color: boundaryColor }
        : boundary
    );
    
    setBoundaries(updatedBoundaries);
    setNameDialogVisible(false);
    setEditingBoundary(null);
  };
  
  // Delete a boundary
  const deleteBoundary = () => {
    if (!selectedBoundary) return;
    
    const updatedBoundaries = boundaries.filter(boundary => 
      boundary.id !== selectedBoundary.id
    );
    
    setBoundaries(updatedBoundaries);
    
    // If no boundaries left for this camera, update hasBoundaries
    const cameraBoundaries = updatedBoundaries.filter(boundary => 
      boundary.cameraId === selectedCamera.id
    );
    
    if (cameraBoundaries.length === 0) {
      setCameras(
        cameras.map(camera => 
          camera.id === selectedCamera.id 
            ? { ...camera, hasBoundaries: false } 
            : camera
        )
      );
    }
    
    setDeleteDialogVisible(false);
    setSelectedBoundary(null);
  };
  
  // Cancel drawing
  const cancelDrawing = () => {
    setDrawingBoundary(false);
    setCurrentPoints([]);
  };
  
  // Edit a boundary
  const editBoundary = (boundary) => {
    setEditingBoundary(boundary);
    setBoundaryName(boundary.name);
    setBoundaryColor(boundary.color);
    setNameDialogVisible(true);
  };
  
  // Show context menu for a boundary
  const showBoundaryMenu = (boundary, event) => {
    setSelectedBoundary(boundary);
    setMenuPosition({ x: event.nativeEvent.pageX, y: event.nativeEvent.pageY });
    setMenuVisible(true);
  };
  
  // Render camera card
  const renderCameraCard = (camera) => (
    <Card
      key={camera.id}
      style={[styles.cameraCard, { backgroundColor: safeColors.surface }]}
      onPress={() => setSelectedCamera(camera)}
    >
      <Card.Title
        title={camera.name}
        subtitle={camera.location}
        right={(props) => (
          <Chip
            mode="outlined"
            style={{
              backgroundColor: camera.isActive ? `${safeColors.primary}20` : 'transparent',
              borderColor: camera.isActive ? safeColors.primary : safeColors.outline,
            }}
            textStyle={{ color: camera.isActive ? safeColors.primary : safeColors.outline }}
          >
            {camera.isActive ? 'Active' : 'Inactive'}
          </Chip>
        )}
      />
      <Card.Content>
        <Text style={{ color: safeColors.onSurfaceVariant }}>
          {camera.hasBoundaries ? 'Has configured boundaries' : 'No boundaries configured'}
        </Text>
      </Card.Content>
      <Card.Actions>
        <Button 
          textColor={safeColors.primary}
          onPress={() => setSelectedCamera(camera)}
        >
          {camera.hasBoundaries ? 'Edit Boundaries' : 'Set Boundaries'}
        </Button>
      </Card.Actions>
    </Card>
  );
  
  // Color options for boundaries
  const colorOptions = [
    { value: '#FF5722', label: 'Orange' },
    { value: '#2196F3', label: 'Blue' },
    { value: '#4CAF50', label: 'Green' },
    { value: '#9C27B0', label: 'Purple' },
    { value: '#F44336', label: 'Red' },
  ];
  
  // Calculate coordinates for drawing a boundary
  const getPolygonPoints = (points) => {
    if (!points || points.length < 3) return '';
    return points.map(point => `${point.x * 100}%, ${point.y * 100}%`).join(' ');
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: safeColors.background }]}>
      <Appbar.Header style={[styles.appbar, { backgroundColor: safeColors.primary }]}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={safeColors.onPrimary} />
        <Appbar.Content 
          title={selectedCamera ? selectedCamera.name : "Boundary Management"} 
          subtitle={selectedCamera ? "Configure boundaries" : "Select a camera"}
          color={safeColors.onPrimary}
        />
        {selectedCamera && (
          <Appbar.Action
            icon="arrow-left-circle"
            color={safeColors.onPrimary}
            onPress={() => setSelectedCamera(null)}
          />
        )}
      </Appbar.Header>
      
      <View style={styles.content}>
        {!selectedCamera ? (
          // Camera selection view
          <ScrollView>
            <Text style={[styles.sectionTitle, { color: safeColors.onSurface }]}>
              Select a camera to configure boundaries
            </Text>
            <Text style={[styles.sectionDescription, { color: safeColors.onSurfaceVariant }]}>
              Tap on a camera to set up or edit detection boundaries
            </Text>
            
            {cameras.map(renderCameraCard)}
          </ScrollView>
        ) : (
          // Boundary configuration view
          <View style={styles.boundaryConfigContainer}>
            <View style={styles.previewContainer}>
              {/* Camera preview - using a placeholder image */}
              <TouchableOpacity 
                activeOpacity={0.9}
                onPress={handleImageTap}
                disabled={!drawingBoundary}
              >
                <View 
                  style={[
                    styles.cameraPreview, 
                    { borderColor: drawingBoundary ? safeColors.primary : 'transparent' }
                  ]}
                  ref={imageRef}
                >
                  <Image
                    source={{ uri: 'https://via.placeholder.com/640x360/333333/FFFFFF?text=Camera+Feed' }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                  
                  {/* Render existing boundaries */}
                  {boundaries
                    .filter(boundary => boundary.cameraId === selectedCamera.id)
                    .map(boundary => (
                      <TouchableOpacity
                        key={boundary.id}
                        style={[
                          styles.boundary,
                          {
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: `${boundary.color}40`,
                            borderColor: boundary.color,
                            borderWidth: 2,
                            borderRadius: 4,
                            clipPath: `polygon(${getPolygonPoints(boundary.points)})`,
                          }
                        ]}
                        onLongPress={(e) => showBoundaryMenu(boundary, e)}
                      />
                    ))}
                  
                  {/* Render current drawing points */}
                  {currentPoints.map((point, index) => (
                    <View
                      key={index}
                      style={[
                        styles.drawingPoint,
                        {
                          left: `${point.x * 100}%`,
                          top: `${point.y * 100}%`,
                          backgroundColor: boundaryColor,
                        }
                      ]}
                    />
                  ))}
                  
                  {/* Draw lines between points */}
                  {currentPoints.length > 1 && currentPoints.map((point, index) => {
                    if (index === 0) return null;
                    const prevPoint = currentPoints[index - 1];
                    const angle = Math.atan2(
                      (point.y - prevPoint.y) * 100,
                      (point.x - prevPoint.x) * 100
                    ) * 180 / Math.PI;
                    const distance = Math.sqrt(
                      Math.pow((point.x - prevPoint.x) * 100, 2) +
                      Math.pow((point.y - prevPoint.y) * 100, 2)
                    );
                    
                    return (
                      <View
                        key={`line-${index}`}
                        style={{
                          position: 'absolute',
                          width: distance + '%',
                          height: 2,
                          backgroundColor: boundaryColor,
                          left: `${prevPoint.x * 100}%`,
                          top: `${prevPoint.y * 100}%`,
                          transformOrigin: 'left center',
                          transform: [{ rotate: `${angle}deg` }],
                        }}
                      />
                    );
                  })}
                  
                  {/* Close the shape if we have at least 3 points */}
                  {currentPoints.length >= 3 && (
                    <View
                      style={{
                        position: 'absolute',
                        width: Math.sqrt(
                          Math.pow((currentPoints[0].x - currentPoints[currentPoints.length - 1].x) * 100, 2) +
                          Math.pow((currentPoints[0].y - currentPoints[currentPoints.length - 1].y) * 100, 2)
                        ) + '%',
                        height: 2,
                        backgroundColor: boundaryColor,
                        left: `${currentPoints[currentPoints.length - 1].x * 100}%`,
                        top: `${currentPoints[currentPoints.length - 1].y * 100}%`,
                        transformOrigin: 'left center',
                        transform: [{
                          rotate: `${Math.atan2(
                            (currentPoints[0].y - currentPoints[currentPoints.length - 1].y) * 100,
                            (currentPoints[0].x - currentPoints[currentPoints.length - 1].x) * 100
                          ) * 180 / Math.PI}deg`
                        }],
                      }}
                    />
                  )}
                </View>
              </TouchableOpacity>
              
              {/* Drawing instructions */}
              {drawingBoundary && (
                <View style={styles.drawingInstructions}>
                  <Text style={{ color: safeColors.onSurface, textAlign: 'center' }}>
                    Tap to place points ({currentPoints.length}/4)
                  </Text>
                  <Text style={{ color: safeColors.onSurfaceVariant, textAlign: 'center', fontSize: 12 }}>
                    Create a rectangular boundary by tapping four corners
                  </Text>
                  <Button 
                    mode="outlined" 
                    onPress={cancelDrawing}
                    style={{ marginTop: 8, borderColor: safeColors.error }}
                    textColor={safeColors.error}
                  >
                    Cancel
                  </Button>
                </View>
              )}
              
              {/* Boundary list */}
              {!drawingBoundary && (
                <View style={styles.boundaryList}>
                  <Text style={[styles.sectionTitle, { color: safeColors.onSurface }]}>
                    Boundaries
                  </Text>
                  
                  {boundaries.filter(boundary => boundary.cameraId === selectedCamera.id).length === 0 ? (
                    <Text style={{ color: safeColors.onSurfaceVariant, textAlign: 'center', marginTop: 16 }}>
                      No boundaries configured for this camera.
                    </Text>
                  ) : (
                    boundaries
                      .filter(boundary => boundary.cameraId === selectedCamera.id)
                      .map(boundary => (
                        <Card
                          key={boundary.id}
                          style={[styles.boundaryCard, { backgroundColor: safeColors.surface }]}
                        >
                          <Card.Title
                            title={boundary.name}
                            left={(props) => (
                              <View
                                style={[
                                  styles.colorIndicator,
                                  { backgroundColor: boundary.color }
                                ]}
                              />
                            )}
                            right={(props) => (
                              <IconButton
                                {...props}
                                icon="dots-vertical"
                                onPress={(e) => showBoundaryMenu(boundary, e)}
                              />
                            )}
                          />
                        </Card>
                      ))
                  )}
                </View>
              )}
            </View>
            
            {/* FAB for adding new boundary */}
            {!drawingBoundary && (
              <FAB
                style={[styles.fab, { backgroundColor: safeColors.primary }]}
                icon="plus"
                color={safeColors.onPrimary}
                onPress={() => setDrawingBoundary(true)}
              />
            )}
          </View>
        )}
      </View>
      
      {/* Boundary name dialog */}
      <Portal>
        <Dialog
          visible={nameDialogVisible}
          onDismiss={() => {
            setNameDialogVisible(false);
            if (!editingBoundary) setCurrentPoints([]);
          }}
        >
          <Dialog.Title style={{ color: safeColors.onSurface }}>
            {editingBoundary ? 'Edit Boundary' : 'New Boundary'}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Boundary Name"
              value={boundaryName}
              onChangeText={setBoundaryName}
              style={{ backgroundColor: safeColors.surface, marginBottom: 16 }}
              outlineColor={safeColors.outline}
              activeOutlineColor={safeColors.primary}
            />
            
            <Text style={{ color: safeColors.onSurface, marginBottom: 8 }}>Boundary Color</Text>
            <SegmentedButtons
              value={boundaryColor}
              onValueChange={setBoundaryColor}
              buttons={colorOptions.map(color => ({
                value: color.value,
                label: '',
                style: { backgroundColor: `${color.value}40` },
                icon: boundaryColor === color.value ? 'check' : undefined,
              }))}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setNameDialogVisible(false);
                if (!editingBoundary) setCurrentPoints([]);
              }}
              textColor={safeColors.primary}
            >
              Cancel
            </Button>
            <Button
              onPress={editingBoundary ? updateBoundary : completeBoundary}
              mode="contained"
              style={{ backgroundColor: safeColors.primary }}
              disabled={!boundaryName.trim()}
            >
              {editingBoundary ? 'Update' : 'Create'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Delete confirmation dialog */}
      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Title style={{ color: safeColors.onSurface }}>Delete Boundary</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: safeColors.onSurface }}>
              Are you sure you want to delete this boundary?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setDeleteDialogVisible(false)}
              textColor={safeColors.primary}
            >
              Cancel
            </Button>
            <Button
              onPress={deleteBoundary}
              textColor={safeColors.error}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Boundary context menu */}
      <Portal>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={menuPosition}
        >
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              editBoundary(selectedBoundary);
            }}
            title="Edit"
            leadingIcon="pencil"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              setDeleteDialogVisible(true);
            }}
            title="Delete"
            leadingIcon="delete"
          />
        </Menu>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appbar: {
    elevation: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    marginBottom: 16,
  },
  cameraCard: {
    marginBottom: 16,
    elevation: 2,
  },
  boundaryConfigContainer: {
    flex: 1,
  },
  previewContainer: {
    flex: 1,
  },
  cameraPreview: {
    width: '100%',
    aspectRatio: 16/9,
    borderWidth: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  drawingPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: -6,
    marginTop: -6,
  },
  drawingInstructions: {
    marginTop: 16,
    padding: 16,
    alignItems: 'center',
  },
  boundaryList: {
    marginTop: 16,
  },
  boundaryCard: {
    marginBottom: 8,
    elevation: 1,
  },
  colorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  boundary: {
    opacity: 0.6,
    zIndex: 10,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
}); 