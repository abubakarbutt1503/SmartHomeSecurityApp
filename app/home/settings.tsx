import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
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
} from 'react-native-paper';
import { router } from 'expo-router';
import { useAppTheme, useThemeMode } from '../../theme/ThemeProvider';

export default function SettingsScreen() {
  const { theme } = useAppTheme();
  const { mode, setMode } = useThemeMode();
  
  // Notification settings
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [alertNotificationsEnabled, setAlertNotificationsEnabled] = useState(true);
  const [systemNotificationsEnabled, setSystemNotificationsEnabled] = useState(true);
  const [deviceNotificationsEnabled, setDeviceNotificationsEnabled] = useState(true);
  
  // Security settings
  const [biometricAuthEnabled, setBiometricAuthEnabled] = useState(true);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [autoLockEnabled, setAutoLockEnabled] = useState(true);
  const [autoLockTimeout, setAutoLockTimeout] = useState('5');
  
  // System settings
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  const [diagnosticsEnabled, setDiagnosticsEnabled] = useState(false);
  const [dataBackupEnabled, setDataBackupEnabled] = useState(true);
  
  // Dialogs
  const [themeDialogVisible, setThemeDialogVisible] = useState(false);
  const [autoLockDialogVisible, setAutoLockDialogVisible] = useState(false);
  const [dataBackupDialogVisible, setDataBackupDialogVisible] = useState(false);
  const [storageDialogVisible, setStorageDialogVisible] = useState(false);
  const [accountDialogVisible, setAccountDialogVisible] = useState(false);
  
  // Profile data (mock)
  const profileName = 'John Smith';
  const profileEmail = 'john.smith@example.com';
  
  // Storage data (mock)
  const storageTotal = 20; // GB
  const storageUsed = 8.7; // GB
  const storagePercentage = storageUsed / storageTotal;
  
  const getStorageSeverity = (percentage) => {
    if (percentage < 0.5) return 'normal';
    if (percentage < 0.8) return 'medium';
    return 'high';
  };
  
  const getStorageColor = (severity, theme) => {
    switch (severity) {
      case 'high': return theme.colors.error;
      case 'medium': return theme.colors.warning;
      case 'normal': return theme.colors.primary;
      default: return theme.colors.primary;
    }
  };

  return (
    <View style={{ ...styles.container, backgroundColor: theme.colors.background }}>
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction onPress={() => router.back()} color={theme.colors.onPrimary} />
        <Appbar.Content title="Settings" color={theme.colors.onPrimary} />
      </Appbar.Header>
      
      <ScrollView style={styles.scrollView}>
        {/* Account Section */}
        <Card style={{ ...styles.profileCard, backgroundColor: theme.colors.surfaceVariant }} onPress={() => setAccountDialogVisible(true)}>
          <Card.Title
            title={profileName}
            subtitle={profileEmail}
            left={(props) => <Avatar.Icon {...props} icon="account-circle" style={{ backgroundColor: theme.colors.primary }} />}
            right={(props) => <IconButton {...props} icon="chevron-right" iconColor={theme.colors.onSurfaceVariant} />}
          />
        </Card>
        
        {/* Appearance Section */}
        <List.Section>
          <List.Subheader style={{ color: theme.colors.primary }}>Appearance</List.Subheader>
          <List.Item
            title="Theme"
            description={mode === 'dark' ? 'Dark' : mode === 'light' ? 'Light' : 'System default'}
            left={props => <List.Icon {...props} icon="theme-light-dark" color={theme.colors.primary} />}
            right={props => <IconButton {...props} icon="chevron-right" onPress={() => setThemeDialogVisible(true)} />}
            onPress={() => setThemeDialogVisible(true)}
          />
          <Divider />
        </List.Section>
        
        {/* Notifications Section */}
        <List.Section>
          <List.Subheader style={{ color: theme.colors.primary }}>Notifications</List.Subheader>
          <List.Item
            title="Push Notifications"
            description="Receive notifications on your device"
            left={props => <List.Icon {...props} icon="bell" color={theme.colors.primary} />}
            right={props => (
              <Switch
                value={pushNotificationsEnabled}
                onValueChange={setPushNotificationsEnabled}
                color={theme.colors.primary}
              />
            )}
          />
          <Divider />
          
          {pushNotificationsEnabled && (
            <>
              <List.Item
                title="Security Alerts"
                description="Notifications about security events"
                left={props => <List.Icon {...props} icon="shield" color={theme.colors.primary} />}
                right={props => (
                  <Switch
                    value={alertNotificationsEnabled}
                    onValueChange={setAlertNotificationsEnabled}
                    color={theme.colors.primary}
                  />
                )}
              />
              <Divider />
              
              <List.Item
                title="System Notifications"
                description="Updates, maintenance, and system events"
                left={props => <List.Icon {...props} icon="cog" color={theme.colors.primary} />}
                right={props => (
                  <Switch
                    value={systemNotificationsEnabled}
                    onValueChange={setSystemNotificationsEnabled}
                    color={theme.colors.primary}
                  />
                )}
              />
              <Divider />
              
              <List.Item
                title="Device Status"
                description="Device online/offline notifications"
                left={props => <List.Icon {...props} icon="devices" color={theme.colors.primary} />}
                right={props => (
                  <Switch
                    value={deviceNotificationsEnabled}
                    onValueChange={setDeviceNotificationsEnabled}
                    color={theme.colors.primary}
                  />
                )}
              />
              <Divider />
            </>
          )}
        </List.Section>
        
        {/* Security & Privacy Section */}
        <List.Section>
          <List.Subheader style={{ color: theme.colors.primary }}>Security & Privacy</List.Subheader>
          
          <List.Item
            title="Biometric Authentication"
            description="Use fingerprint or face ID to authenticate"
            left={props => <List.Icon {...props} icon="fingerprint" color={theme.colors.primary} />}
            right={props => (
              <Switch
                value={biometricAuthEnabled}
                onValueChange={setBiometricAuthEnabled}
                color={theme.colors.primary}
              />
            )}
          />
          <Divider />
          
          <List.Item
            title="PIN Authentication"
            description="Use a PIN code to authenticate"
            left={props => <List.Icon {...props} icon="dialpad" color={theme.colors.primary} />}
            right={props => (
              <Switch
                value={pinEnabled}
                onValueChange={setPinEnabled}
                color={theme.colors.primary}
              />
            )}
          />
          <Divider />
          
          <List.Item
            title="Auto-Lock"
            description={autoLockEnabled ? `Lock after ${autoLockTimeout} minutes of inactivity` : "Disabled"}
            left={props => <List.Icon {...props} icon="lock-clock" color={theme.colors.primary} />}
            right={props => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Switch
                  value={autoLockEnabled}
                  onValueChange={setAutoLockEnabled}
                  color={theme.colors.primary}
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
          <List.Subheader style={{ color: theme.colors.primary }}>System</List.Subheader>
          
          <List.Item
            title="Automatic Updates"
            description="Keep your app up to date automatically"
            left={props => <List.Icon {...props} icon="update" color={theme.colors.primary} />}
            right={props => (
              <Switch
                value={autoUpdateEnabled}
                onValueChange={setAutoUpdateEnabled}
                color={theme.colors.primary}
              />
            )}
          />
          <Divider />
          
          <List.Item
            title="Send Diagnostics"
            description="Help improve the app by sending anonymous usage data"
            left={props => <List.Icon {...props} icon="chart-bar" color={theme.colors.primary} />}
            right={props => (
              <Switch
                value={diagnosticsEnabled}
                onValueChange={setDiagnosticsEnabled}
                color={theme.colors.primary}
              />
            )}
          />
          <Divider />
          
          <List.Item
            title="Data Backup"
            description={dataBackupEnabled ? "Automatic backup enabled" : "Backup disabled"}
            left={props => <List.Icon {...props} icon="backup-restore" color={theme.colors.primary} />}
            right={props => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Switch
                  value={dataBackupEnabled}
                  onValueChange={setDataBackupEnabled}
                  color={theme.colors.primary}
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
            left={props => <List.Icon {...props} icon="database" color={theme.colors.primary} />}
            right={props => <IconButton icon="chevron-right" onPress={() => setStorageDialogVisible(true)} />}
            onPress={() => setStorageDialogVisible(true)}
          />
          <Divider />
          
          <List.Item
            title="About"
            description="App version, legal information, and licenses"
            left={props => <List.Icon {...props} icon="information" color={theme.colors.primary} />}
            right={props => <IconButton icon="chevron-right" />}
          />
          <Divider />
        </List.Section>
        
        {/* Danger Zone */}
        <List.Section>
          <List.Subheader style={{ color: theme.colors.error }}>Danger Zone</List.Subheader>
          
          <List.Item
            title="Reset Settings"
            description="Reset all settings to default values"
            titleStyle={{ color: theme.colors.error }}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
            left={props => <List.Icon {...props} icon="refresh" color={theme.colors.error} />}
          />
          <Divider />
          
          <List.Item
            title="Delete Account"
            description="Permanently delete your account and all data"
            titleStyle={{ color: theme.colors.error }}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
            left={props => <List.Icon {...props} icon="delete" color={theme.colors.error} />}
          />
          <Divider />
        </List.Section>
      </ScrollView>
      
      {/* Theme Dialog */}
      <Portal>
        <Dialog
          visible={themeDialogVisible}
          onDismiss={() => setThemeDialogVisible(false)}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Dialog.Title>Theme</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={value => setMode(value)} value={mode}>
              <RadioButton.Item 
                label="Light" 
                value="light" 
                color={theme.colors.primary}
              />
              <RadioButton.Item 
                label="Dark" 
                value="dark" 
                color={theme.colors.primary}
              />
              <RadioButton.Item 
                label="System Default" 
                value="system" 
                color={theme.colors.primary}
              />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setThemeDialogVisible(false)}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Auto-Lock Dialog */}
      <Portal>
        <Dialog
          visible={autoLockDialogVisible}
          onDismiss={() => setAutoLockDialogVisible(false)}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Dialog.Title>Auto-Lock Timeout</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: theme.colors.onSurface, marginBottom: 16 }}>
              Set how long to wait before automatically locking the app
            </Text>
            <TextInput
              mode="outlined"
              label="Minutes"
              value={autoLockTimeout}
              onChangeText={text => setAutoLockTimeout(text.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              style={{ backgroundColor: theme.colors.surface }}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              textColor={theme.colors.onSurface}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAutoLockDialogVisible(false)}>Cancel</Button>
            <Button onPress={() => setAutoLockDialogVisible(false)}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Data Backup Dialog */}
      <Portal>
        <Dialog
          visible={dataBackupDialogVisible}
          onDismiss={() => setDataBackupDialogVisible(false)}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Dialog.Title>Data Backup</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: theme.colors.onSurface, marginBottom: 16 }}>
              Choose when to automatically backup your data
            </Text>
            <RadioButton.Group onValueChange={() => {}} value="daily">
              <RadioButton.Item 
                label="Daily" 
                value="daily" 
                color={theme.colors.primary}
              />
              <RadioButton.Item 
                label="Weekly" 
                value="weekly" 
                color={theme.colors.primary}
              />
              <RadioButton.Item 
                label="Monthly" 
                value="monthly" 
                color={theme.colors.primary}
              />
            </RadioButton.Group>
            <Button 
              mode="contained"
              style={{ marginTop: 16, backgroundColor: theme.colors.primary }}
              icon="backup-restore"
            >
              Backup Now
            </Button>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDataBackupDialogVisible(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Storage Dialog */}
      <Portal>
        <Dialog
          visible={storageDialogVisible}
          onDismiss={() => setStorageDialogVisible(false)}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Dialog.Title>Storage Usage</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: theme.colors.onSurface, marginBottom: 8 }}>
              {`${storageUsed} GB used of ${storageTotal} GB`}
            </Text>
            
            <ProgressBar 
              progress={storagePercentage} 
              color={getStorageColor(getStorageSeverity(storagePercentage), theme)} 
              style={{ height: 8, borderRadius: 4, marginBottom: 24 }}
            />
            
            <View style={styles.storageItem}>
              <View style={styles.storageItemLeft}>
                <Avatar.Icon 
                  size={40} 
                  icon="video" 
                  style={{ backgroundColor: `${theme.colors.primary}20` }} 
                  color={theme.colors.primary}
                />
                <View style={{ marginLeft: 16 }}>
                  <Text style={{ color: theme.colors.onSurface }}>Video Recordings</Text>
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>4.2 GB</Text>
                </View>
              </View>
              <View>
                <Text style={{ color: theme.colors.onSurface }}>48%</Text>
              </View>
            </View>
            
            <View style={styles.storageItem}>
              <View style={styles.storageItemLeft}>
                <Avatar.Icon 
                  size={40} 
                  icon="image" 
                  style={{ backgroundColor: `${theme.colors.secondary}20` }} 
                  color={theme.colors.secondary}
                />
                <View style={{ marginLeft: 16 }}>
                  <Text style={{ color: theme.colors.onSurface }}>Images</Text>
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>2.8 GB</Text>
                </View>
              </View>
              <View>
                <Text style={{ color: theme.colors.onSurface }}>32%</Text>
              </View>
            </View>
            
            <View style={styles.storageItem}>
              <View style={styles.storageItemLeft}>
                <Avatar.Icon 
                  size={40} 
                  icon="file" 
                  style={{ backgroundColor: `${theme.colors.tertiary}20` }} 
                  color={theme.colors.tertiary}
                />
                <View style={{ marginLeft: 16 }}>
                  <Text style={{ color: theme.colors.onSurface }}>Logs & Other</Text>
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>1.7 GB</Text>
                </View>
              </View>
              <View>
                <Text style={{ color: theme.colors.onSurface }}>20%</Text>
              </View>
            </View>
            
            <Button 
              mode="contained" 
              icon="broom"
              style={{ marginTop: 24, backgroundColor: theme.colors.primary }}
            >
              Clear Cache
            </Button>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setStorageDialogVisible(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Account Dialog */}
      <Portal>
        <Dialog
          visible={accountDialogVisible}
          onDismiss={() => setAccountDialogVisible(false)}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Dialog.Title>Account Settings</Dialog.Title>
          <Dialog.Content>
            <Avatar.Icon 
              icon="account-circle" 
              size={64} 
              style={{ 
                backgroundColor: theme.colors.primary,
                alignSelf: 'center',
                marginBottom: 16
              }} 
            />
            
            <TextInput
              mode="outlined"
              label="Name"
              value={profileName}
              style={{ 
                backgroundColor: theme.colors.surface,
                marginBottom: 16
              }}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              textColor={theme.colors.onSurface}
            />
            
            <TextInput
              mode="outlined"
              label="Email"
              value={profileEmail}
              style={{ 
                backgroundColor: theme.colors.surface,
                marginBottom: 16
              }}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              textColor={theme.colors.onSurface}
            />
            
            <Button 
              mode="contained"
              style={{ marginTop: 8, backgroundColor: theme.colors.primary }}
              icon="content-save"
            >
              Save Changes
            </Button>
            
            <Button 
              mode="outlined"
              style={{ 
                marginTop: 16, 
                borderColor: theme.colors.primary
              }}
              textColor={theme.colors.primary}
              icon="lock"
            >
              Change Password
            </Button>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAccountDialogVisible(false)}>Close</Button>
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
  scrollView: {
    flex: 1,
  },
  profileCard: {
    margin: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  storageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  storageItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 