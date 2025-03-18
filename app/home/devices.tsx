import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, FlatList } from 'react-native';
import { 
  Appbar, 
  Text, 
  Card, 
  Button, 
  IconButton, 
  Switch,
  Chip,
  FAB,
  Dialog,
  Portal,
  TextInput,
  SegmentedButtons,
  Badge,
  ProgressBar,
  Searchbar,
  Avatar,
  Divider,
} from 'react-native-paper';
import { router } from 'expo-router';
import { useAppTheme } from '../../theme/ThemeProvider';

// Mock device data
const DEVICES = [
  { 
    id: '1', 
    name: 'Front Door Camera', 
    type: 'camera', 
    online: true, 
    battery: 85, 
    location: 'Front Entrance',
    lastSeen: new Date(),
    ip: '192.168.1.101',
    firmware: '1.2.4',
  },
  { 
    id: '2', 
    name: 'Living Room Motion Sensor', 
    type: 'motion', 
    online: true, 
    battery: 72, 
    location: 'Living Room',
    lastSeen: new Date(),
    ip: '192.168.1.102',
    firmware: '2.0.1',
  },
  { 
    id: '3', 
    name: 'Back Door Sensor', 
    type: 'door', 
    online: true, 
    battery: 95, 
    location: 'Back Door',
    lastSeen: new Date(),
    ip: '192.168.1.103',
    firmware: '1.1.7',
  },
  { 
    id: '4', 
    name: 'Kitchen Smoke Detector', 
    type: 'smoke', 
    online: false, 
    battery: 40, 
    location: 'Kitchen',
    lastSeen: new Date(Date.now() - 86400000),
    ip: '192.168.1.104',
    firmware: '3.2.0',
  },
  { 
    id: '5', 
    name: 'Bedroom Window Sensor', 
    type: 'window', 
    online: true, 
    battery: 63, 
    location: 'Bedroom',
    lastSeen: new Date(),
    ip: '192.168.1.105',
    firmware: '1.5.2',
  },
  { 
    id: '6', 
    name: 'Garage Door Sensor', 
    type: 'door', 
    online: true, 
    battery: 25, 
    location: 'Garage',
    lastSeen: new Date(),
    ip: '192.168.1.106',
    firmware: '1.1.7',
  },
  { 
    id: '7', 
    name: 'Basement Motion Sensor', 
    type: 'motion', 
    online: false, 
    battery: 12, 
    location: 'Basement',
    lastSeen: new Date(Date.now() - 259200000),
    ip: '192.168.1.107',
    firmware: '2.0.1',
  },
];

const getDeviceIcon = (type) => {
  switch (type) {
    case 'camera': return 'cctv';
    case 'motion': return 'motion-sensor';
    case 'door': return 'door';
    case 'window': return 'window-open';
    case 'smoke': return 'smoke-detector';
    default: return 'devices';
  }
};

const getBatteryIcon = (level) => {
  if (level <= 10) return 'battery-10';
  if (level <= 20) return 'battery-20';
  if (level <= 30) return 'battery-30';
  if (level <= 40) return 'battery-40';
  if (level <= 50) return 'battery-50';
  if (level <= 60) return 'battery-60';
  if (level <= 70) return 'battery-70';
  if (level <= 80) return 'battery-80';
  if (level <= 90) return 'battery-90';
  return 'battery';
};

const getBatteryColor = (level, theme) => {
  if (level <= 20) return theme.colors.error;
  if (level <= 40) return theme.colors.warning;
  return theme.colors.success;
};

const getTimeSince = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return `${interval} years ago`;
  if (interval === 1) return '1 year ago';
  
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return `${interval} months ago`;
  if (interval === 1) return '1 month ago';
  
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return `${interval} days ago`;
  if (interval === 1) return '1 day ago';
  
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return `${interval} hours ago`;
  if (interval === 1) return '1 hour ago';
  
  interval = Math.floor(seconds / 60);
  if (interval > 1) return `${interval} minutes ago`;
  if (interval === 1) return '1 minute ago';
  
  if (seconds < 10) return 'just now';
  return `${Math.floor(seconds)} seconds ago`;
};

const DeviceItem = ({ device, onPress, onToggle }) => {
  const { theme } = useAppTheme();
  
  return (
    <Card 
      style={{ 
        ...styles.deviceCard, 
        backgroundColor: theme.colors.surface 
      }}
      onPress={() => onPress(device)}
    >
      <Card.Title
        title={device.name}
        titleStyle={{ color: theme.colors.onSurface }}
        subtitle={device.location}
        subtitleStyle={{ color: theme.colors.onSurfaceVariant }}
        left={(props) => (
          <Avatar.Icon 
            {...props} 
            icon={getDeviceIcon(device.type)} 
            style={{ 
              backgroundColor: device.online 
                ? `${theme.colors.primary}20` 
                : theme.colors.surfaceVariant 
            }}
            color={device.online ? theme.colors.primary : theme.colors.outline}
          />
        )}
        right={(props) => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {device.battery !== undefined && (
              <View style={styles.batteryContainer}>
                <IconButton 
                  {...props}
                  icon={getBatteryIcon(device.battery)}
                  iconColor={getBatteryColor(device.battery, theme)}
                  size={20}
                  style={{ margin: 0 }}
                />
                <Text style={{ 
                  fontSize: 12, 
                  color: getBatteryColor(device.battery, theme),
                  marginRight: 8
                }}>
                  {`${device.battery}%`}
                </Text>
              </View>
            )}
            <Switch
              value={device.online}
              onValueChange={() => onToggle(device.id)}
              color={theme.colors.primary}
              style={{ marginRight: 8 }}
            />
          </View>
        )}
      />
      <Card.Content>
        <View style={styles.deviceStatus}>
          <View style={styles.statusItem}>
            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>Status:</Text>
            <Chip 
              mode="outlined" 
              style={{ 
                backgroundColor: device.online 
                  ? `${theme.colors.success}10`
                  : `${theme.colors.error}10`,
                borderColor: device.online 
                  ? theme.colors.success
                  : theme.colors.error,
                height: 24,
              }}
              textStyle={{ 
                fontSize: 12,
                color: device.online 
                  ? theme.colors.success
                  : theme.colors.error
              }}
            >
              {device.online ? 'Online' : 'Offline'}
            </Chip>
          </View>
          
          <View style={styles.statusItem}>
            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>Last Seen:</Text>
            <Text style={{ color: theme.colors.onSurface, fontSize: 12 }}>
              {getTimeSince(device.lastSeen)}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

export default function DevicesScreen() {
  const { theme } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [devices, setDevices] = useState(DEVICES);
  const [viewMode, setViewMode] = useState('all');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [addDeviceVisible, setAddDeviceVisible] = useState(false);
  
  // Filtered devices based on search and view mode
  const filteredDevices = devices.filter(device => {
    // Search filter
    const matchesSearch = 
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    // View mode filter
    const matchesViewMode = 
      viewMode === 'all' || 
      (viewMode === 'online' && device.online) ||
      (viewMode === 'offline' && !device.online) ||
      (viewMode === 'low-battery' && device.battery <= 20);
    
    return matchesSearch && matchesViewMode;
  });
  
  const handleDevicePress = (device) => {
    setSelectedDevice(device);
  };
  
  const handleDeviceToggle = (deviceId) => {
    setDevices(prevDevices => 
      prevDevices.map(device => 
        device.id === deviceId 
          ? { ...device, online: !device.online, lastSeen: new Date() }
          : device
      )
    );
  };
  
  const handleCloseDetails = () => {
    setSelectedDevice(null);
  };
  
  // Device counters
  const onlineCount = devices.filter(d => d.online).length;
  const offlineCount = devices.filter(d => !d.online).length;
  const lowBatteryCount = devices.filter(d => d.battery <= 20).length;
  
  return (
    <View style={{ ...styles.container, backgroundColor: theme.colors.background }}>
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction onPress={() => router.back()} color={theme.colors.onPrimary} />
        <Appbar.Content title="Devices" color={theme.colors.onPrimary} />
        <Appbar.Action icon="refresh" onPress={() => console.log('Refresh devices')} color={theme.colors.onPrimary} />
      </Appbar.Header>
      
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search devices..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{ 
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 8,
          }}
          iconColor={theme.colors.primary}
          inputStyle={{ color: theme.colors.onSurface }}
        />
      </View>
      
      <View style={styles.statsContainer}>
        <Card style={{ ...styles.statCard, backgroundColor: theme.colors.surfaceVariant }}>
          <View style={styles.statContent}>
            <Text style={{ color: theme.colors.primary, fontSize: 28, fontWeight: 'bold' }}>
              {devices.length}
            </Text>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>Total</Text>
          </View>
        </Card>
        
        <Card style={{ ...styles.statCard, backgroundColor: theme.colors.surfaceVariant }}>
          <View style={styles.statContent}>
            <Text style={{ color: theme.colors.success, fontSize: 28, fontWeight: 'bold' }}>
              {onlineCount}
            </Text>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>Online</Text>
          </View>
        </Card>
        
        <Card style={{ ...styles.statCard, backgroundColor: theme.colors.surfaceVariant }}>
          <View style={styles.statContent}>
            <Text style={{ color: theme.colors.error, fontSize: 28, fontWeight: 'bold' }}>
              {offlineCount}
            </Text>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>Offline</Text>
          </View>
        </Card>
      </View>
      
      <View style={styles.viewToggleContainer}>
        <SegmentedButtons
          value={viewMode}
          onValueChange={setViewMode}
          buttons={[
            { value: 'all', label: 'All', icon: 'devices' },
            { value: 'online', label: 'Online', icon: 'wifi' },
            { value: 'offline', label: 'Offline', icon: 'wifi-off' },
            { 
              value: 'low-battery', 
              label: 'Low Battery', 
              icon: 'battery-alert',
              checkedColor: theme.colors.warning,
            },
          ]}
        />
      </View>
      
      <FlatList
        data={filteredDevices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DeviceItem 
            device={item} 
            onPress={handleDevicePress} 
            onToggle={handleDeviceToggle}
          />
        )}
        contentContainerStyle={styles.deviceListContent}
        style={styles.deviceList}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <IconButton 
              icon="devices"
              size={64}
              iconColor={theme.colors.surfaceVariant}
            />
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              No devices match your filters
            </Text>
          </View>
        )}
      />
      
      <FAB
        icon="plus"
        style={{ 
          ...styles.fab,
          backgroundColor: theme.colors.secondary 
        }}
        color={theme.colors.onSecondary}
        onPress={() => setAddDeviceVisible(true)}
      />
      
      {/* Device Details Dialog */}
      <Portal>
        <Dialog
          visible={selectedDevice !== null}
          onDismiss={handleCloseDetails}
          style={{ backgroundColor: theme.colors.surface }}
        >
          {selectedDevice && (
            <>
              <Dialog.Title>{selectedDevice.name}</Dialog.Title>
              <Dialog.Content>
                <View style={styles.deviceDetailHeader}>
                  <Avatar.Icon 
                    size={60} 
                    icon={getDeviceIcon(selectedDevice.type)} 
                    style={{ 
                      backgroundColor: selectedDevice.online 
                        ? `${theme.colors.primary}20` 
                        : theme.colors.surfaceVariant 
                    }}
                    color={selectedDevice.online ? theme.colors.primary : theme.colors.outline}
                  />
                  
                  <View style={styles.deviceDetailHeaderRight}>
                    <Chip 
                      mode="outlined" 
                      style={{ 
                        backgroundColor: selectedDevice.online 
                          ? `${theme.colors.success}10`
                          : `${theme.colors.error}10`,
                        borderColor: selectedDevice.online 
                          ? theme.colors.success
                          : theme.colors.error,
                      }}
                      textStyle={{ 
                        color: selectedDevice.online 
                          ? theme.colors.success
                          : theme.colors.error
                      }}
                    >
                      {selectedDevice.online ? 'Online' : 'Offline'}
                    </Chip>
                    
                    {selectedDevice.battery !== undefined && (
                      <View style={styles.batteryDetail}>
                        <IconButton 
                          icon={getBatteryIcon(selectedDevice.battery)}
                          iconColor={getBatteryColor(selectedDevice.battery, theme)}
                          size={20}
                          style={{ margin: 0 }}
                        />
                        <Text style={{ 
                          color: getBatteryColor(selectedDevice.battery, theme),
                        }}>
                          {`${selectedDevice.battery}%`}
                        </Text>
                        
                        <ProgressBar 
                          progress={selectedDevice.battery / 100} 
                          color={getBatteryColor(selectedDevice.battery, theme)}
                          style={{ height: 8, width: 60, borderRadius: 4 }}
                        />
                      </View>
                    )}
                  </View>
                </View>
                
                <Divider style={{ marginVertical: 16 }} />
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Location:</Text>
                  <Text style={{ color: theme.colors.onSurface }}>{selectedDevice.location}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Device Type:</Text>
                  <Text style={{ color: theme.colors.onSurface, textTransform: 'capitalize' }}>
                    {selectedDevice.type}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>IP Address:</Text>
                  <Text style={{ color: theme.colors.onSurface }}>{selectedDevice.ip}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Last Seen:</Text>
                  <Text style={{ color: theme.colors.onSurface }}>
                    {getTimeSince(selectedDevice.lastSeen)}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Firmware:</Text>
                  <Text style={{ color: theme.colors.onSurface }}>
                    {selectedDevice.firmware}
                  </Text>
                </View>
                
                <Button 
                  mode="outlined"
                  style={{ 
                    marginTop: 16, 
                    borderColor: selectedDevice.online ? theme.colors.error : theme.colors.success 
                  }}
                  textColor={selectedDevice.online ? theme.colors.error : theme.colors.success}
                  icon={selectedDevice.online ? "wifi-off" : "wifi"}
                  onPress={() => {
                    handleDeviceToggle(selectedDevice.id);
                    handleCloseDetails();
                  }}
                >
                  {selectedDevice.online ? "Set Offline" : "Set Online"}
                </Button>
                
                <Button 
                  mode="contained"
                  style={{ 
                    marginTop: 8, 
                    backgroundColor: theme.colors.primary 
                  }}
                  icon="cog"
                >
                  Device Settings
                </Button>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={handleCloseDetails}>Close</Button>
              </Dialog.Actions>
            </>
          )}
        </Dialog>
      </Portal>
      
      {/* Add Device Dialog */}
      <Portal>
        <Dialog
          visible={addDeviceVisible}
          onDismiss={() => setAddDeviceVisible(false)}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Dialog.Title>Add New Device</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Device Name"
              mode="outlined"
              style={{ 
                backgroundColor: theme.colors.surface, 
                marginBottom: 16 
              }}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              textColor={theme.colors.onSurface}
            />
            
            <TextInput
              label="Location"
              mode="outlined"
              style={{ 
                backgroundColor: theme.colors.surface, 
                marginBottom: 16 
              }}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              textColor={theme.colors.onSurface}
            />
            
            <Text style={{ color: theme.colors.onSurface, marginBottom: 8 }}>Device Type</Text>
            <SegmentedButtons
              value="camera"
              onValueChange={() => {}}
              buttons={[
                { value: 'camera', label: 'Camera', icon: 'cctv' },
                { value: 'motion', label: 'Motion', icon: 'motion-sensor' },
                { value: 'door', label: 'Door', icon: 'door' },
              ]}
              style={{ marginBottom: 16 }}
            />
            
            <Button 
              mode="contained"
              style={{ 
                marginTop: 8, 
                backgroundColor: theme.colors.secondary 
              }}
              icon="qrcode-scan"
            >
              Scan QR Code
            </Button>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAddDeviceVisible(false)}>Cancel</Button>
            <Button onPress={() => setAddDeviceVisible(false)}>Add Device</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  statCard: {
    width: '30%',
    padding: 8,
  },
  statContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewToggleContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  deviceList: {
    flex: 1,
  },
  deviceListContent: {
    padding: 16,
    paddingTop: 0,
  },
  deviceCard: {
    marginBottom: 12,
    borderRadius: 8,
  },
  deviceStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  deviceDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceDetailHeaderRight: {
    flex: 1,
    marginLeft: 16,
    gap: 8,
  },
  batteryDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailLabel: {
    fontWeight: 'bold',
    width: 100,
  },
}); 