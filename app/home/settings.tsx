import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView } from 'react-native';
import { 
  Appbar, 
  Text, 
  List, 
  Switch, 
  Divider,
  Button,
  Dialog,
  Portal,
  RadioButton,
  Menu,
  Card,
  Avatar,
  IconButton,
  ProgressBar,
  SegmentedButtons,
  TextInput,
  Chip,
  useTheme
} from 'react-native-paper';
import { navigateBack, navigateToHome, handleSignOut } from '../../utils/navigation';
import { useAppTheme, useThemeMode } from '../../theme/ThemeProvider';

// Define safe colors outside the component
const createSafeColors = (appTheme) => ({
  primary: appTheme?.colors?.primary || '#6200ee',
  onPrimary: appTheme?.colors?.onPrimary || '#ffffff',
  primaryContainer: appTheme?.colors?.primaryContainer || '#f1e4ff',
  onPrimaryContainer: appTheme?.colors?.onPrimaryContainer || '#21005d',
  secondary: appTheme?.colors?.secondary || '#03dac6',
  onSecondary: appTheme?.colors?.onSecondary || '#ffffff',
  secondaryContainer: appTheme?.colors?.secondaryContainer || '#d6f7f1',
  onSecondaryContainer: appTheme?.colors?.onSecondaryContainer || '#003731',
  tertiary: appTheme?.colors?.tertiary || '#ff8a00',
  onTertiary: appTheme?.colors?.onTertiary || '#ffffff',
  tertiaryContainer: appTheme?.colors?.tertiaryContainer || '#ffd9bc',
  onTertiaryContainer: appTheme?.colors?.onTertiaryContainer || '#2a1700',
  error: appTheme?.colors?.error || '#b00020',
  onError: appTheme?.colors?.onError || '#ffffff',
  surface: appTheme?.colors?.surface || '#ffffff',
  onSurface: appTheme?.colors?.onSurface || '#121212',
  background: appTheme?.colors?.background || '#f6f6f6',
  onBackground: appTheme?.colors?.onBackground || '#121212',
  surfaceVariant: appTheme?.colors?.surfaceVariant || '#f5f5f5',
  onSurfaceVariant: appTheme?.colors?.onSurfaceVariant || '#6b6b6b',
  outline: appTheme?.colors?.outline || '#79747e',
  success: appTheme?.colors?.success || '#4caf50',
  warning: appTheme?.colors?.warning || '#ff9800',
});

export default function SettingsScreen() {
  const { colors } = useTheme();
  const appTheme = useAppTheme();
  const { theme, toggleTheme } = useThemeMode();
  
  // Create safe colors for this instance
  const safeColors = createSafeColors(appTheme);
  
  // State variables
  const [systemMode, setSystemMode] = useState('normal');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [autoLockEnabled, setAutoLockEnabled] = useState(true);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(true);
  const [accountDialogVisible, setAccountDialogVisible] = useState(false);
  const [systemModeDialogVisible, setSystemModeDialogVisible] = useState(false);
  const [storageDialogVisible, setStorageDialogVisible] = useState(false);
  const [resetDialogVisible, setResetDialogVisible] = useState(false);
  
  // Notification settings
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [alertNotificationsEnabled, setAlertNotificationsEnabled] = useState(true);
  const [systemNotificationsEnabled, setSystemNotificationsEnabled] = useState(true);
  const [deviceNotificationsEnabled, setDeviceNotificationsEnabled] = useState(true);
  
  // Security settings
  const [autoLockTimeout, setAutoLockTimeout] = useState(5);
  
  // System settings
  const [diagnosticsEnabled, setDiagnosticsEnabled] = useState(true);
  const [dataBackupEnabled, setDataBackupEnabled] = useState(true);
  
  // Dialogs
  const [themeDialogVisible, setThemeDialogVisible] = useState(false);
  const [autoLockDialogVisible, setAutoLockDialogVisible] = useState(false);
  const [dataBackupDialogVisible, setDataBackupDialogVisible] = useState(false);
  
  // Profile data (mock)
  const profileName = 'John Doe';
  const profileEmail = 'john.doe@example.com';
  
  // Storage data (mock)
  const storageTotal = 20; // GB
  const storageUsed = 8.7; // GB
  const totalStoragePercent = Math.round((storageUsed / storageTotal) * 100);
  
  // Individual storage items
  const videoStorage = 4.2;
  const videoStoragePercent = Math.round((videoStorage / storageTotal) * 100);
  
  const imageStorage = 2.8;
  const imageStoragePercent = Math.round((imageStorage / storageTotal) * 100);
  
  const logStorage = 1.7;
  const logStoragePercent = Math.round((logStorage / storageTotal) * 100);
  
  const getStorageSeverity = (percentage) => {
    if (percentage < 0.5) return 'normal';
    if (percentage < 0.8) return 'medium';
    return 'high';
  };
  
  const getStorageColor = (type: string) => {
    switch (type) {
      case 'video':
        return safeColors.primary;
      case 'image':
        return safeColors.secondary;
      case 'log':
        return safeColors.tertiary;
      case 'total':
        return totalStoragePercent > 90 ? safeColors.error :
               totalStoragePercent > 75 ? safeColors.warning :
               safeColors.success;
      default:
        return safeColors.primary;
    }
  };

  // Get color based on system mode
  const getSystemModeColor = (mode: string) => {
    switch (mode) {
      case 'high':
        return safeColors.error;
      case 'medium':
        return safeColors.warning;
      case 'normal':
      default:
        return safeColors.primary;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: safeColors.background }]}>
      <Appbar.Header style={[styles.appbar, { backgroundColor: safeColors.primary }]} statusBarHeight={0}>
        <Appbar.Content title="Settings" color={safeColors.onPrimary} />
      </Appbar.Header>
      
      <ScrollView style={styles.content}>
        {/* Profile Card */}
        <Card style={[styles.profileCard, { backgroundColor: safeColors.surfaceVariant }]}>
          <View style={styles.profileHeader}>
            <Avatar.Icon size={60} icon="account" style={{ backgroundColor: safeColors.primary }} />
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: safeColors.onSurface }]}>{profileName}</Text>
              <Text style={[styles.profileEmail, { color: safeColors.onSurfaceVariant }]}>{profileEmail}</Text>
            </View>
          </View>
          <Card.Actions>
            <Button textColor={safeColors.primary}>Edit Profile</Button>
            <Button textColor={safeColors.primary}>Manage Account</Button>
          </Card.Actions>
        </Card>
        
        {/* System Mode Chip */}
        <View style={styles.chipContainer}>
          <Chip
            icon="alert-circle"
            onPress={() => setSystemModeDialogVisible(true)}
            style={{
              backgroundColor: `${getSystemModeColor(systemMode)}20`,
            }}
            textStyle={{ color: getSystemModeColor(systemMode) }}
          >
            {systemMode === 'high' ? 'High Security' : 
             systemMode === 'medium' ? 'Medium Security' : 'Normal Mode'}
          </Chip>
        </View>
        
        {/* Appearance Section */}
        <List.Section>
          <List.Subheader style={{ color: safeColors.primary }}>Appearance</List.Subheader>
          <List.Item
            title="Theme"
            description={theme.mode === 'dark' ? 'Dark' : theme.mode === 'light' ? 'Light' : 'System default'}
            left={props => <List.Icon {...props} icon="theme-light-dark" color={safeColors.primary} />}
            right={props => <IconButton {...props} icon="chevron-right" onPress={() => setThemeDialogVisible(true)} />}
            onPress={() => setThemeDialogVisible(true)}
          />
          <Divider />
        </List.Section>
        
        {/* Notifications Section */}
        <List.Section>
          <List.Subheader style={{ color: safeColors.primary }}>Notifications</List.Subheader>
          <List.Item
            title="Push Notifications"
            description="Receive notifications on your device"
            left={props => <List.Icon {...props} icon="bell" color={safeColors.primary} />}
            right={props => (
              <Switch
                value={pushNotificationsEnabled}
                onValueChange={setPushNotificationsEnabled}
                color={safeColors.primary}
              />
            )}
          />
          <Divider />
          
          {pushNotificationsEnabled && (
            <>
              <List.Item
                title="Security Alerts"
                description="Notifications about security events"
                left={props => <List.Icon {...props} icon="shield" color={safeColors.primary} />}
                right={props => (
                  <Switch
                    value={alertNotificationsEnabled}
                    onValueChange={setAlertNotificationsEnabled}
                    color={safeColors.primary}
                  />
                )}
              />
              <Divider />
              
              <List.Item
                title="System Notifications"
                description="Updates, maintenance, and system events"
                left={props => <List.Icon {...props} icon="cog" color={safeColors.primary} />}
                right={props => (
                  <Switch
                    value={systemNotificationsEnabled}
                    onValueChange={setSystemNotificationsEnabled}
                    color={safeColors.primary}
                  />
                )}
              />
              <Divider />
              
              <List.Item
                title="Device Status"
                description="Device online/offline notifications"
                left={props => <List.Icon {...props} icon="devices" color={safeColors.primary} />}
                right={props => (
                  <Switch
                    value={deviceNotificationsEnabled}
                    onValueChange={setDeviceNotificationsEnabled}
                    color={safeColors.primary}
                  />
                )}
              />
              <Divider />
            </>
          )}
        </List.Section>
        
        {/* Security & Privacy Section */}
        <List.Section>
          <List.Subheader style={{ color: safeColors.primary }}>Security & Privacy</List.Subheader>
          
          <List.Item
            title="Biometric Authentication"
            description="Use fingerprint or face ID to authenticate"
            left={props => <List.Icon {...props} icon="fingerprint" color={safeColors.primary} />}
            right={props => (
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                color={safeColors.primary}
              />
            )}
          />
          <Divider />
          
          <List.Item
            title="PIN Authentication"
            description="Use a PIN code to authenticate"
            left={props => <List.Icon {...props} icon="dialpad" color={safeColors.primary} />}
            right={props => (
              <Switch
                value={pinEnabled}
                onValueChange={setPinEnabled}
                color={safeColors.primary}
              />
            )}
          />
          <Divider />
          
          <List.Item
            title="Auto-Lock"
            description={autoLockEnabled ? `Lock after ${autoLockTimeout} minutes of inactivity` : "Disabled"}
            left={props => <List.Icon {...props} icon="lock-clock" color={safeColors.primary} />}
            right={props => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Switch
                  value={autoLockEnabled}
                  onValueChange={setAutoLockEnabled}
                  color={safeColors.primary}
                  style={{ marginRight: 8 }}
                />
                {autoLockEnabled && (
                  <IconButton
                    icon="chevron-right"
                    onPress={() => setAutoLockDialogVisible(true)}
                  />
                )}
              </View>
            )}
          />
          <Divider />
        </List.Section>
        
        {/* System Section */}
        <List.Section>
          <List.Subheader style={{ color: safeColors.primary }}>System</List.Subheader>
          
          <List.Item
            title="Automatic Updates"
            description="Keep your app up to date automatically"
            left={props => <List.Icon {...props} icon="update" color={safeColors.primary} />}
            right={props => (
              <Switch
                value={autoUpdateEnabled}
                onValueChange={setAutoUpdateEnabled}
                color={safeColors.primary}
              />
            )}
          />
          <Divider />
          
          <List.Item
            title="Send Diagnostics"
            description="Help improve the app by sending anonymous usage data"
            left={props => <List.Icon {...props} icon="chart-bar" color={safeColors.primary} />}
            right={props => (
              <Switch
                value={diagnosticsEnabled}
                onValueChange={setDiagnosticsEnabled}
                color={safeColors.primary}
              />
            )}
          />
          <Divider />
          
          <List.Item
            title="Data Backup"
            description={dataBackupEnabled ? "Automatic backup enabled" : "Backup disabled"}
            left={props => <List.Icon {...props} icon="backup-restore" color={safeColors.primary} />}
            right={props => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Switch
                  value={dataBackupEnabled}
                  onValueChange={setDataBackupEnabled}
                  color={safeColors.primary}
                  style={{ marginRight: 8 }}
                />
                {dataBackupEnabled && (
                  <IconButton
                    icon="chevron-right"
                    onPress={() => setDataBackupDialogVisible(true)}
                  />
                )}
              </View>
            )}
          />
          <Divider />
          
          <List.Item
            title="Storage"
            description={`${storageUsed} GB used of ${storageTotal} GB`}
            left={props => <List.Icon {...props} icon="database" color={safeColors.primary} />}
            right={props => <IconButton icon="chevron-right" onPress={() => setStorageDialogVisible(true)} />}
            onPress={() => setStorageDialogVisible(true)}
          />
          <Divider />
          
          <List.Item
            title="About"
            description="App version, legal information, and licenses"
            left={props => <List.Icon {...props} icon="information" color={safeColors.primary} />}
            right={props => <IconButton icon="chevron-right" />}
          />
          <Divider />
        </List.Section>
        
        {/* Danger Zone */}
        <List.Section>
          <List.Subheader style={{ color: safeColors.error }}>Danger Zone</List.Subheader>
          
          <List.Item
            title="Reset Settings"
            description="Reset all settings to default values"
            titleStyle={{ color: safeColors.error }}
            descriptionStyle={{ color: safeColors.onSurfaceVariant }}
            left={props => <List.Icon {...props} icon="refresh" color={safeColors.error} />}
          />
          <Divider />
          
          <List.Item
            title="Delete Account"
            description="Permanently delete your account and all data"
            titleStyle={{ color: safeColors.error }}
            descriptionStyle={{ color: safeColors.onSurfaceVariant }}
            left={props => <List.Icon {...props} icon="delete" color={safeColors.error} />}
          />
          <Divider />
        </List.Section>
      </ScrollView>
      
      {/* Theme Selection Dialog */}
      <Portal>
        <Dialog visible={themeDialogVisible} onDismiss={() => setThemeDialogVisible(false)}>
          <Dialog.Title style={{ color: safeColors.onSurface }}>Choose Theme</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={value => {
              toggleTheme(value as 'light' | 'dark' | 'system');
              setThemeDialogVisible(false);
            }} value={theme.mode}>
              <RadioButton.Item
                label="Light"
                value="light"
                color={safeColors.primary}
              />
              <RadioButton.Item
                label="Dark"
                value="dark"
                color={safeColors.primary}
              />
              <RadioButton.Item
                label="System default"
                value="system"
                color={safeColors.primary}
              />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setThemeDialogVisible(false)} textColor={safeColors.primary}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Auto-Lock Timeout Dialog */}
      <Portal>
        <Dialog visible={autoLockDialogVisible} onDismiss={() => setAutoLockDialogVisible(false)}>
          <Dialog.Title style={{ color: safeColors.onSurface }}>Auto-Lock Timeout</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={value => {
              setAutoLockTimeout(Number(value));
              setAutoLockDialogVisible(false);
            }} value={autoLockTimeout.toString()}>
              {[1, 5, 10, 15, 30].map(timeout => (
                <RadioButton.Item
                  key={timeout}
                  label={`${timeout} ${timeout === 1 ? 'minute' : 'minutes'}`}
                  value={timeout.toString()}
                  color={safeColors.primary}
                />
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAutoLockDialogVisible(false)} textColor={safeColors.primary}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* System Mode Dialog */}
      <Portal>
        <Dialog visible={systemModeDialogVisible} onDismiss={() => setSystemModeDialogVisible(false)}>
          <Dialog.Title style={{ color: safeColors.onSurface }}>System Mode</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={value => {
              setSystemMode(value as 'normal' | 'medium' | 'high');
              setSystemModeDialogVisible(false);
            }} value={systemMode}>
              <RadioButton.Item
                label="Normal"
                value="normal"
                color={safeColors.primary}
              />
              <RadioButton.Item
                label="Medium"
                value="medium"
                color={safeColors.primary}
              />
              <RadioButton.Item
                label="High"
                value="high"
                color={safeColors.primary}
              />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSystemModeDialogVisible(false)} textColor={safeColors.primary}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Data Backup Dialog */}
      <Portal>
        <Dialog visible={dataBackupDialogVisible} onDismiss={() => setDataBackupDialogVisible(false)}>
          <Dialog.Title style={{ color: safeColors.onSurface }}>Data Backup</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: safeColors.onSurface, marginBottom: 16 }}>
              Choose when to automatically backup your data
            </Text>
            <RadioButton.Group onValueChange={() => {}} value="daily">
              <RadioButton.Item 
                label="Daily" 
                value="daily" 
                color={safeColors.primary}
              />
              <RadioButton.Item 
                label="Weekly" 
                value="weekly" 
                color={safeColors.primary}
              />
              <RadioButton.Item 
                label="Monthly" 
                value="monthly" 
                color={safeColors.primary}
              />
            </RadioButton.Group>
            <Button 
              mode="contained"
              style={{ marginTop: 16, backgroundColor: safeColors.primary }}
              icon="backup-restore"
            >
              Backup Now
            </Button>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDataBackupDialogVisible(false)} textColor={safeColors.primary}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Storage Dialog */}
      <Portal>
        <Dialog visible={storageDialogVisible} onDismiss={() => setStorageDialogVisible(false)}>
          <Dialog.Title style={{ color: safeColors.onSurface }}>Storage Usage</Dialog.Title>
          <Dialog.Content>
            <View style={styles.storageItem}>
              <View style={styles.storageItemInfo}>
                <Avatar.Icon
                  size={40}
                  icon="video"
                  color={safeColors.onPrimary}
                  style={{ backgroundColor: `${safeColors.primary}20` }}
                />
                <View style={{ marginLeft: 16 }}>
                  <Text style={{ color: safeColors.onSurface }}>Video recordings</Text>
                  <Text style={{ color: safeColors.onSurfaceVariant }}>{videoStorage} GB</Text>
                </View>
              </View>
              <Text style={{ color: safeColors.onSurfaceVariant }}>{videoStoragePercent}%</Text>
            </View>
            <View style={styles.storageItemProgress}>
              <ProgressBar
                progress={videoStoragePercent / 100}
                color={getStorageColor('video')}
                style={{ height: 8, borderRadius: 4 }}
              />
            </View>

            <View style={styles.storageItem}>
              <View style={styles.storageItemInfo}>
                <Avatar.Icon
                  size={40}
                  icon="image"
                  color={safeColors.onSecondary}
                  style={{ backgroundColor: `${safeColors.secondary}20` }}
                />
                <View style={{ marginLeft: 16 }}>
                  <Text style={{ color: safeColors.onSurface }}>Image snapshots</Text>
                  <Text style={{ color: safeColors.onSurfaceVariant }}>{imageStorage} GB</Text>
                </View>
              </View>
              <Text style={{ color: safeColors.onSurfaceVariant }}>{imageStoragePercent}%</Text>
            </View>
            <View style={styles.storageItemProgress}>
              <ProgressBar
                progress={imageStoragePercent / 100}
                color={getStorageColor('image')}
                style={{ height: 8, borderRadius: 4 }}
              />
            </View>

            <View style={styles.storageItem}>
              <View style={styles.storageItemInfo}>
                <Avatar.Icon
                  size={40}
                  icon="text-box"
                  color={safeColors.onTertiary}
                  style={{ backgroundColor: `${safeColors.tertiary}20` }}
                />
                <View style={{ marginLeft: 16 }}>
                  <Text style={{ color: safeColors.onSurface }}>System logs</Text>
                  <Text style={{ color: safeColors.onSurfaceVariant }}>{logStorage} GB</Text>
                </View>
              </View>
              <Text style={{ color: safeColors.onSurfaceVariant }}>{logStoragePercent}%</Text>
            </View>
            <View style={styles.storageItemProgress}>
              <ProgressBar
                progress={logStoragePercent / 100}
                color={getStorageColor('log')}
                style={{ height: 8, borderRadius: 4 }}
              />
            </View>

            <View style={{ marginTop: 16 }}>
              <Text style={{ color: safeColors.onSurface, fontWeight: 'bold' }}>
                Total: {storageUsed} GB used of {storageTotal} GB
              </Text>
              <ProgressBar
                progress={totalStoragePercent / 100}
                color={getStorageColor('total')}
                style={{ height: 8, borderRadius: 4, marginTop: 8 }}
              />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setStorageDialogVisible(false)} textColor={safeColors.primary}>Close</Button>
            <Button onPress={() => {}} textColor={safeColors.primary}>Clear Cache</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Account Dialog */}
      <Portal>
        <Dialog visible={accountDialogVisible} onDismiss={() => setAccountDialogVisible(false)}>
          <Dialog.Title style={{ color: safeColors.onSurface }}>Account Settings</Dialog.Title>
          <Dialog.Content>
            <Avatar.Icon 
              icon="account-circle" 
              size={64} 
              style={{ 
                backgroundColor: safeColors.primary,
                alignSelf: 'center',
                marginBottom: 16
              }} 
            />
            
            <TextInput
              mode="outlined"
              label="Name"
              value={profileName}
              style={{ 
                backgroundColor: safeColors.surface,
                marginBottom: 16
              }}
              outlineColor={safeColors.outline}
              activeOutlineColor={safeColors.primary}
              textColor={safeColors.onSurface}
            />
            
            <TextInput
              mode="outlined"
              label="Email"
              value={profileEmail}
              style={{ 
                backgroundColor: safeColors.surface,
                marginBottom: 16
              }}
              outlineColor={safeColors.outline}
              activeOutlineColor={safeColors.primary}
              textColor={safeColors.onSurface}
            />
            
            <Button 
              mode="contained"
              style={{ marginTop: 8, backgroundColor: safeColors.primary }}
              icon="content-save"
            >
              Save Changes
            </Button>
            
            <Button 
              mode="outlined"
              style={{ 
                marginTop: 16, 
                borderColor: safeColors.primary
              }}
              textColor={safeColors.primary}
              icon="lock"
            >
              Change Password
            </Button>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAccountDialogVisible(false)} textColor={safeColors.primary}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Logout Button */}
      <Button 
        mode="outlined" 
        icon="logout" 
        onPress={handleSignOut}
        style={[styles.logoutButton, { borderColor: safeColors.error }]}
        textColor={safeColors.error}
        buttonColor={`${safeColors.error}10`}
        rippleColor={`${safeColors.error}20`}
      >
        Log Out
      </Button>
    </SafeAreaView>
  );
}

// Define styles outside of the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appbar: {
    backgroundColor: 'transparent', // Will be set dynamically
  },
  content: {
    padding: 16,
  },
  profileCard: {
    margin: 16,
    borderRadius: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  profileInfo: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileEmail: {
    // Color will be set dynamically
  },
  chipContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
  },
  storageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  storageItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storageItemProgress: {
    marginBottom: 16,
  },
  logoutButton: {
    margin: 16,
    marginTop: 24,
  },
}); 