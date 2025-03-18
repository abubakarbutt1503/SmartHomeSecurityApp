import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, useColorScheme, Alert } from 'react-native';
import { 
  Appbar, 
  Badge, 
  Button, 
  Card, 
  FAB, 
  IconButton, 
  Text, 
  Switch,
  useTheme as usePaperTheme,
  Avatar,
  Divider,
  ProgressBar,
  SegmentedButtons,
  ActivityIndicator
} from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme/ThemeProvider';
import { 
  navigateToDevices, 
  navigateToAlerts, 
  navigateToSettings,
  navigateToCamera,
  navigateToActivity
} from '../../utils/navigation';
import { 
  toggleSystemArming, 
  refreshSystemStatus, 
  triggerPanicAlarm, 
  lockAllDevices, 
  recordAllCameras, 
  testAlarms 
} from '../../utils/dashboardFunctions';

export default function Home() {
  const { theme, isDarkMode } = useAppTheme();
  const [systemArmed, setSystemArmed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Mock data for unread alerts count and system status
  const [systemStatus, setSystemStatus] = useState('Normal');
  const [lastCheck, setLastCheck] = useState('2 minutes ago');
  const [batteryLevel, setBatteryLevel] = useState(75);
  const [deviceStatus, setDeviceStatus] = useState({ online: 6, offline: 1, total: 7 });
  const [unreadAlerts, setUnreadAlerts] = useState(2);
  
  // Calculate the online device percentage
  const onlineDevicePercentage = deviceStatus.online / deviceStatus.total;
  
  // Mock data for recent alerts
  const recentAlerts = [
    {
      id: '1',
      title: 'Motion Detected',
      location: 'Front Door',
      time: '15 minutes ago',
      icon: 'motion-sensor',
      severity: 'medium',
    },
    {
      id: '2',
      title: 'Window Opened',
      location: 'Living Room',
      time: '2 hours ago',
      icon: 'window-open',
      severity: 'high',
    }
  ];
  
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return theme.colors.error;
      case 'high': return theme.colors.error;
      case 'medium': return theme.colors.warning;
      case 'low': return theme.colors.success;
      default: return theme.colors.primary;
    }
  };
  
  // Function to handle system status refresh
  const handleRefreshStatus = async () => {
    setRefreshing(true);
    try {
      const result = await refreshSystemStatus();
      setSystemStatus(result.systemStatus);
      setLastCheck(result.lastCheck);
      setBatteryLevel(result.batteryLevel);
    } catch (error) {
      Alert.alert("Error", "Failed to refresh system status.");
    } finally {
      setRefreshing(false);
    }
  };

  // Function to handle system arming/disarming
  const handleArmingToggle = () => {
    toggleSystemArming(systemArmed, setSystemArmed);
  };
  
  return (
    <SafeAreaProvider>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
          <Appbar.Content title="Home Safety" color={theme.colors.onPrimary} />
          <Appbar.Action 
            icon="bell" 
            color={theme.colors.onPrimary} 
            onPress={navigateToAlerts}
          />
          {unreadAlerts > 0 && (
            <Badge 
              size={16} 
              style={{ 
                position: 'absolute', 
                top: 10, 
                right: 10,
                backgroundColor: theme.colors.error 
              }}
            >
              {unreadAlerts}
            </Badge>
          )}
          <Appbar.Action 
            icon="cog" 
            color={theme.colors.onPrimary} 
            onPress={navigateToSettings}
          />
        </Appbar.Header>
        
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* System Status Card */}
          <Card style={{ ...styles.card, backgroundColor: theme.colors.surface }}>
            <Card.Title 
              title="System Status" 
              titleStyle={{ color: theme.colors.onSurface }}
              right={(props) => (
                <View style={styles.systemStatusContainer}>
                  <Text style={{ 
                    color: systemStatus === 'Normal' ? theme.colors.success : theme.colors.error,
                    fontWeight: 'bold'
                  }}>
                    {systemStatus}
                  </Text>
                  {refreshing ? (
                    <ActivityIndicator 
                      animating={true} 
                      color={theme.colors.primary} 
                      size={24}
                      style={{ marginHorizontal: 16 }}
                    />
                  ) : (
                    <IconButton 
                      {...props} 
                      icon="refresh" 
                      iconColor={theme.colors.primary}
                      onPress={handleRefreshStatus}
                    />
                  )}
                </View>
              )}
            />
            
            <Card.Content>
              <View style={styles.systemInfoRow}>
                <View style={styles.systemInfoItem}>
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>Status</Text>
                  <View style={styles.statusIndicatorContainer}>
                    <View 
                      style={[
                        styles.statusIndicator, 
                        { backgroundColor: systemStatus === 'Normal' ? theme.colors.success : theme.colors.error }
                      ]} 
                    />
                    <Text style={{ color: theme.colors.onSurface }}>
                      {systemStatus}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.systemInfoItem}>
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>Last Check</Text>
                  <Text style={{ color: theme.colors.onSurface }}>{lastCheck}</Text>
                </View>
                
                <View style={styles.systemInfoItem}>
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>Battery</Text>
                  <View style={styles.batteryContainer}>
                    <Text style={{ color: theme.colors.onSurface }}>{batteryLevel}%</Text>
                    <ProgressBar 
                      progress={batteryLevel / 100} 
                      color={
                        batteryLevel > 50 
                          ? theme.colors.success 
                          : batteryLevel > 20 
                            ? theme.colors.warning 
                            : theme.colors.error
                      }
                      style={styles.batteryProgress}
                    />
                  </View>
                </View>
              </View>
              
              <Divider style={styles.divider} />
              
              <View style={styles.armingContainer}>
                <Text style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                  System Arming
                </Text>
                <View style={styles.armingToggleContainer}>
                  <IconButton 
                    icon={systemArmed ? 'shield' : 'shield-off'} 
                    iconColor={systemArmed ? theme.colors.primary : theme.colors.error}
                    size={36}
                    onPress={handleArmingToggle}
                    style={styles.armingButton}
                  />
                  <Text style={{ 
                    color: systemArmed ? theme.colors.primary : theme.colors.error,
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}>
                    {systemArmed ? 'ARMED' : 'DISARMED'}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
          
          {/* Quick Access Cards */}
          <View style={styles.quickAccessRow}>
            <Card 
              style={{ ...styles.quickAccessCard, backgroundColor: theme.colors.surface }}
              onPress={navigateToCamera}
            >
              <Card.Content style={styles.quickAccessContent}>
                <Avatar.Icon 
                  icon="cctv" 
                  size={48} 
                  style={{ backgroundColor: theme.colors.primary ? theme.colors.primary + '33' : '#00000033' }}
                  color={theme.colors.primary}
                />
                <Text style={{ color: theme.colors.onSurface, marginTop: 8 }}>Cameras</Text>
              </Card.Content>
            </Card>
            
            <Card 
              style={{ ...styles.quickAccessCard, backgroundColor: theme.colors.surface }}
              onPress={navigateToDevices}
            >
              <Card.Content style={styles.quickAccessContent}>
                <Avatar.Icon 
                  icon="devices" 
                  size={48} 
                  style={{ backgroundColor: theme.colors.primary ? theme.colors.primary + '33' : '#00000033' }}
                  color={theme.colors.primary}
                />
                <Text style={{ color: theme.colors.onSurface, marginTop: 8 }}>Devices</Text>
              </Card.Content>
            </Card>
            
            <Card 
              style={{ ...styles.quickAccessCard, backgroundColor: theme.colors.surface }}
              onPress={navigateToAlerts}
            >
              <Card.Content style={styles.quickAccessContent}>
                <Avatar.Icon 
                  icon="bell-alert" 
                  size={48} 
                  style={{ backgroundColor: theme.colors.primary ? theme.colors.primary + '33' : '#00000033' }}
                  color={theme.colors.primary}
                />
                <Text style={{ color: theme.colors.onSurface, marginTop: 8 }}>Alerts</Text>
                {unreadAlerts > 0 && (
                  <Badge 
                    size={20} 
                    style={{ 
                      position: 'absolute', 
                      top: 0, 
                      right: 0,
                      backgroundColor: theme.colors.error 
                    }}
                  >
                    {unreadAlerts}
                  </Badge>
                )}
              </Card.Content>
            </Card>
            
            <Card 
              style={{ ...styles.quickAccessCard, backgroundColor: theme.colors.surface }}
              onPress={navigateToSettings}
            >
              <Card.Content style={styles.quickAccessContent}>
                <Avatar.Icon 
                  icon="cog" 
                  size={48} 
                  style={{ backgroundColor: theme.colors.primary ? theme.colors.primary + '33' : '#00000033' }}
                  color={theme.colors.primary}
                />
                <Text style={{ color: theme.colors.onSurface, marginTop: 8 }}>Settings</Text>
              </Card.Content>
            </Card>
          </View>
          
          {/* Device Status Card */}
          <Card 
            style={{ ...styles.card, backgroundColor: theme.colors.surface }}
            onPress={navigateToDevices}
          >
            <Card.Title 
              title="Device Status" 
              titleStyle={{ color: theme.colors.onSurface }}
              subtitle={`${deviceStatus.online} / ${deviceStatus.total} devices online`}
              subtitleStyle={{ color: theme.colors.onSurfaceVariant }}
              right={(props) => (
                <IconButton 
                  {...props} 
                  icon="chevron-right" 
                  iconColor={theme.colors.primary}
                  onPress={navigateToDevices}
                />
              )}
            />
            
            <Card.Content>
              <ProgressBar 
                progress={onlineDevicePercentage} 
                color={
                  onlineDevicePercentage > 0.8 
                    ? theme.colors.success 
                    : onlineDevicePercentage > 0.5 
                      ? theme.colors.warning 
                      : theme.colors.error
                }
                style={styles.deviceProgress}
              />
              
              <View style={styles.deviceStatusRow}>
                <View style={styles.deviceStatusItem}>
                  <View 
                    style={[
                      styles.statusIndicator, 
                      { backgroundColor: theme.colors.success }
                    ]} 
                  />
                  <Text style={{ color: theme.colors.onSurface }}>{deviceStatus.online} Online</Text>
                </View>
                
                <View style={styles.deviceStatusItem}>
                  <View 
                    style={[
                      styles.statusIndicator, 
                      { backgroundColor: theme.colors.error }
                    ]} 
                  />
                  <Text style={{ color: theme.colors.onSurface }}>{deviceStatus.offline} Offline</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
          
          {/* Recent Alerts Card */}
          <Card 
            style={{ ...styles.card, backgroundColor: theme.colors.surface }}
            onPress={navigateToAlerts}
          >
            <Card.Title 
              title="Recent Alerts" 
              titleStyle={{ color: theme.colors.onSurface }}
              right={(props) => (
                <IconButton 
                  {...props} 
                  icon="chevron-right" 
                  iconColor={theme.colors.primary}
                  onPress={navigateToAlerts}
                />
              )}
            />
            
            <Card.Content>
              {recentAlerts.map((alert, index) => (
                <React.Fragment key={alert.id}>
                  <View style={styles.alertItem}>
                    <Avatar.Icon 
                      icon={alert.icon} 
                      size={36} 
                      style={{ backgroundColor: getSeverityColor(alert.severity) ? getSeverityColor(alert.severity) + '33' : '#00000033' }}
                      color={getSeverityColor(alert.severity)}
                    />
                    
                    <View style={styles.alertInfo}>
                      <Text style={{ color: theme.colors.onSurface, fontWeight: '600' }}>
                        {alert.title}
                      </Text>
                      <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
                        {alert.location} • {alert.time}
                      </Text>
                    </View>
                  </View>
                  
                  {index < recentAlerts.length - 1 && (
                    <Divider style={styles.alertDivider} />
                  )}
                </React.Fragment>
              ))}
              
              <Button 
                mode="outlined"
                style={styles.viewAllButton}
                contentStyle={{ paddingVertical: 2 }}
                labelStyle={{ color: theme.colors.primary }}
                onPress={navigateToAlerts}
              >
                View All Alerts
              </Button>
            </Card.Content>
          </Card>
          
          {/* Quick Actions Card */}
          <Card style={{ ...styles.card, backgroundColor: theme.colors.surface }}>
            <Card.Title 
              title="Quick Actions" 
              titleStyle={{ color: theme.colors.onSurface }}
            />
            
            <Card.Content>
              <View style={styles.quickActionsGrid}>
                <Card 
                  style={{ ...styles.actionCard, backgroundColor: theme.colors.surfaceVariant }}
                  onPress={triggerPanicAlarm}
                >
                  <Card.Content style={styles.actionContent}>
                    <IconButton 
                      icon="alarm-light" 
                      iconColor={theme.colors.error}
                      size={40}
                      onPress={triggerPanicAlarm}
                    />
                    <Text style={{ color: theme.colors.error, textAlign: 'center' }}>
                      Panic Alarm
                    </Text>
                  </Card.Content>
                </Card>
                
                <Card 
                  style={{ ...styles.actionCard, backgroundColor: theme.colors.surfaceVariant }}
                  onPress={lockAllDevices}
                >
                  <Card.Content style={styles.actionContent}>
                    <IconButton 
                      icon="lock" 
                      iconColor={theme.colors.primary}
                      size={40}
                      onPress={lockAllDevices}
                    />
                    <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                      Lock All
                    </Text>
                  </Card.Content>
                </Card>
                
                <Card 
                  style={{ ...styles.actionCard, backgroundColor: theme.colors.surfaceVariant }}
                  onPress={recordAllCameras}
                >
                  <Card.Content style={styles.actionContent}>
                    <IconButton 
                      icon="record-rec" 
                      iconColor={theme.colors.error}
                      size={40}
                      onPress={recordAllCameras}
                    />
                    <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                      Record All
                    </Text>
                  </Card.Content>
                </Card>
                
                <Card 
                  style={{ ...styles.actionCard, backgroundColor: theme.colors.surfaceVariant }}
                  onPress={testAlarms}
                >
                  <Card.Content style={styles.actionContent}>
                    <IconButton 
                      icon="alarm-check" 
                      iconColor={theme.colors.primary}
                      size={40}
                      onPress={testAlarms}
                    />
                    <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                      Test Alarms
                    </Text>
                  </Card.Content>
                </Card>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
        
        <FAB
          icon={systemArmed ? "shield" : "shield-off"}
          label={systemArmed ? "Disarm System" : "Arm System"}
          style={{ 
            ...styles.fab,
            backgroundColor: systemArmed ? theme.colors.error : theme.colors.primary
          }}
          color={systemArmed ? theme.colors.onError : theme.colors.onPrimary}
          onPress={handleArmingToggle}
        />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusCard: {
    flex: 1,
    margin: 4,
    padding: 16,
    borderRadius: 8,
  },
  systemStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  systemInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  systemInfoItem: {
    alignItems: 'flex-start',
  },
  statusIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  batteryContainer: {
    marginTop: 4,
    alignItems: 'flex-start',
    width: 100,
  },
  batteryProgress: {
    height: 4,
    width: '100%',
    borderRadius: 2,
    marginTop: 4,
  },
  divider: {
    marginVertical: 12,
  },
  armingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  armingToggleContainer: {
    alignItems: 'center',
  },
  armingButton: {
    margin: 0,
  },
  quickAccessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickAccessCard: {
    width: '23%',
    borderRadius: 12,
    elevation: 2,
  },
  quickAccessContent: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  deviceProgress: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  deviceStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deviceStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  alertInfo: {
    marginLeft: 12,
    flex: 1,
  },
  alertDivider: {
    marginVertical: 8,
  },
  viewAllButton: {
    marginTop: 12,
    borderRadius: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 8,
  },
  actionContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
}); 