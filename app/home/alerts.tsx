import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, FlatList } from 'react-native';
import { 
  Appbar, 
  Text, 
  Card, 
  Chip, 
  Searchbar, 
  Badge, 
  Menu, 
  IconButton,
  Avatar,
  Divider,
  Button,
  Dialog,
  Portal,
  RadioButton,
  MD3Theme
} from 'react-native-paper';
import { navigateBack, navigateToHome } from '../../utils/navigation';
import { useAppTheme } from '../../theme/ThemeProvider';

// Define extended color theme interface with custom properties
interface ExtendedColors {
  success: string;
  warning: string;
  info: string;
  onWarning: string;
}

// Extend the MD3Theme to include our custom colors
interface ExtendedTheme extends MD3Theme {
  colors: MD3Theme['colors'] & ExtendedColors;
}

// Define Alert type
interface Alert {
  id: string;
  type: 'motion' | 'door' | 'window' | 'smoke' | 'system';
  location: string;
  timestamp: Date;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  handled: boolean;
  image: string | null;
}

// Mock alert data
const MOCK_ALERTS: Alert[] = [
  { 
    id: '1', 
    type: 'motion',
    location: 'Front Door',
    timestamp: new Date(2023, 6, 12, 22, 45),
    message: 'Motion detected at Front Door',
    severity: 'high',
    handled: false,
    image: null
  },
  { 
    id: '2', 
    type: 'window',
    location: 'Living Room',
    timestamp: new Date(2023, 6, 12, 18, 30),
    message: 'Window opened while system armed',
    severity: 'critical',
    handled: true,
    image: null
  },
  { 
    id: '3', 
    type: 'smoke',
    location: 'Kitchen',
    timestamp: new Date(2023, 6, 11, 14, 15),
    message: 'Smoke detector activated',
    severity: 'critical',
    handled: true,
    image: null
  },
  { 
    id: '4', 
    type: 'door',
    location: 'Back Door',
    timestamp: new Date(2023, 6, 10, 23, 10),
    message: 'Door opened while system armed',
    severity: 'high', 
    handled: true,
    image: null
  },
  { 
    id: '5', 
    type: 'system',
    location: 'System',
    timestamp: new Date(2023, 6, 10, 16, 45),
    message: 'Power outage detected, switched to backup power',
    severity: 'medium',
    handled: true,
    image: null
  },
  { 
    id: '6', 
    type: 'motion',
    location: 'Garage',
    timestamp: new Date(2023, 6, 9, 12, 30),
    message: 'Motion detected in garage',
    severity: 'low',
    handled: true,
    image: null
  },
  { 
    id: '7', 
    type: 'system',
    location: 'System',
    timestamp: new Date(2023, 6, 8, 9, 15),
    message: 'System update completed successfully',
    severity: 'info',
    handled: true,
    image: null
  },
];

const getAlertIcon = (type: Alert['type']): string => {
  switch (type) {
    case 'motion': return 'motion-sensor';
    case 'door': return 'door';
    case 'window': return 'window-open';
    case 'smoke': return 'smoke-detector';
    case 'system': return 'cog';
    default: return 'alert-circle';
  }
};

const getSeverityColor = (severity: Alert['severity'], theme: ExtendedTheme['colors']): string => {
  switch (severity) {
    case 'critical': return theme.error;
    case 'high': return theme.error;
    case 'medium': return theme.warning;
    case 'low': return theme.success;
    case 'info': return theme.info;
    default: return theme.primary;
  }
};

const getSeverityLabel = (severity: Alert['severity']): string => {
  switch (severity) {
    case 'critical': return 'Critical';
    case 'high': return 'High';
    case 'medium': return 'Medium';
    case 'low': return 'Low';
    case 'info': return 'Info';
    default: return 'Unknown';
  }
};

interface AlertItemProps {
  alert: Alert;
  onPress: (alert: Alert) => void;
}

const AlertItem = ({ alert, onPress }: AlertItemProps) => {
  const { theme } = useAppTheme();
  const themeWithCustomColors = theme as ExtendedTheme;
  
  // Ensure theme colors exist to avoid undefined errors
  const safeColors = {
    success: themeWithCustomColors.colors?.success || '#4CAF50',
    error: theme.colors.error || '#F44336',
    warning: themeWithCustomColors.colors?.warning || '#FF9800',
    primary: theme.colors.primary || '#2196F3',
    secondary: theme.colors.secondary || '#03DAC6',
    onSurface: theme.colors.onSurface || '#000000',
    onSurfaceVariant: theme.colors.onSurfaceVariant || '#666666',
    surface: theme.colors.surface || '#FFFFFF',
    background: theme.colors.background || '#F5F5F5',
    outline: theme.colors.outline || '#CCCCCC',
    surfaceVariant: theme.colors.surfaceVariant || '#EEEEEE',
    onPrimary: theme.colors.onPrimary || '#FFFFFF',
    onSecondary: theme.colors.onSecondary || '#FFFFFF',
    onError: theme.colors.onError || '#FFFFFF',
    onWarning: '#000000', // Black text on warning background
    info: themeWithCustomColors.colors?.info || '#2196F3',
  };
  
  // Get color based on severity for this component
  const getItemSeverityColor = (severity: Alert['severity']): string => {
    switch (severity) {
      case 'critical': return safeColors.error;
      case 'high': return safeColors.error;
      case 'medium': return safeColors.warning;
      case 'low': return safeColors.success;
      case 'info': return safeColors.info;
      default: return safeColors.primary;
    }
  };
  
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(alert.timestamp);
  
  return (
    <Card 
      style={{ 
        ...styles.alertCard, 
        backgroundColor: theme.colors.surface,
        borderLeftWidth: 4,
        borderLeftColor: getItemSeverityColor(alert.severity),
        marginVertical: 4,
      }}
      onPress={() => onPress(alert)}
    >
      <Card.Title
        title={alert.message}
        subtitle={`${alert.location} • ${formattedDate}`}
        left={(props) => (
          <Avatar.Icon 
            {...props} 
            icon={getAlertIcon(alert.type)} 
            style={{ backgroundColor: getItemSeverityColor(alert.severity) + '33' }}
            color={getItemSeverityColor(alert.severity)}
            size={40}
          />
        )}
        right={(props) => (
          alert.handled ? (
            <Chip 
              mode="outlined" 
              style={{ 
                backgroundColor: `${safeColors.success}20`,
                borderColor: safeColors.success,
                marginRight: 16,
              }}
              textStyle={{ color: safeColors.success }}
            >
              Handled
            </Chip>
          ) : (
            <Chip 
              mode="outlined" 
              style={{ 
                backgroundColor: `${safeColors.warning}20`,
                borderColor: safeColors.warning,
                marginRight: 16,
              }}
              textStyle={{ color: safeColors.warning }}
            >
              Pending
            </Chip>
          )
        )}
        titleStyle={{ fontWeight: '600' }}
      />
    </Card>
  );
};

export default function AlertsScreen() {
  const { theme } = useAppTheme();
  const themeWithCustomColors = theme as ExtendedTheme;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<'all' | Alert['severity']>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | Alert['type']>('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [filterDialogVisible, setFilterDialogVisible] = useState(false);
  const [tempSeverityFilter, setTempSeverityFilter] = useState<'all' | Alert['severity']>(severityFilter);
  
  // Ensure theme colors exist to avoid undefined errors
  const safeColors = {
    success: themeWithCustomColors.colors?.success || '#4CAF50',
    error: theme.colors.error || '#F44336',
    warning: themeWithCustomColors.colors?.warning || '#FF9800',
    primary: theme.colors.primary || '#2196F3',
    secondary: theme.colors.secondary || '#03DAC6',
    onSurface: theme.colors.onSurface || '#000000',
    onSurfaceVariant: theme.colors.onSurfaceVariant || '#666666',
    surface: theme.colors.surface || '#FFFFFF',
    background: theme.colors.background || '#F5F5F5',
    outline: theme.colors.outline || '#CCCCCC',
    surfaceVariant: theme.colors.surfaceVariant || '#EEEEEE',
    onPrimary: theme.colors.onPrimary || '#FFFFFF',
    onSecondary: theme.colors.onSecondary || '#FFFFFF',
    onError: theme.colors.onError || '#FFFFFF',
    onWarning: '#000000', // Black text on warning background
    info: themeWithCustomColors.colors?.info || '#2196F3',
  };
  
  // Get color based on severity
  const getSeverityColor = (severity: Alert['severity'], themeObj: any): string => {
    switch (severity) {
      case 'critical': return safeColors.error;
      case 'high': return safeColors.error;
      case 'medium': return safeColors.warning;
      case 'low': return safeColors.success;
      case 'info': return safeColors.info;
      default: return safeColors.primary;
    }
  };
  
  // Filter alerts based on search query and filters
  const filteredAlerts = MOCK_ALERTS.filter(alert => {
    // Search query filter
    const matchesSearch = searchQuery === '' || 
      alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Severity filter
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    
    // Type filter
    const matchesType = typeFilter === 'all' || alert.type === typeFilter;
    
    return matchesSearch && matchesSeverity && matchesType;
  });
  
  const handleAlertPress = (alert: Alert): void => {
    setSelectedAlert(alert);
  };
  
  const closeAlertDetails = (): void => {
    setSelectedAlert(null);
  };
  
  const handleApplyFilters = (): void => {
    setSeverityFilter(tempSeverityFilter);
    setFilterDialogVisible(false);
  };
  
  // Count unhandled alerts
  const unhandledCount = MOCK_ALERTS.filter(alert => !alert.handled).length;
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ 
        backgroundColor: theme.colors.primary,
        height: 48, // Reduced header height
      }}>
        <Appbar.BackAction onPress={navigateBack} color={theme.colors.onPrimary} />
        <Appbar.Content 
          title="Security Alerts" 
          color={theme.colors.onPrimary} 
          titleStyle={{ fontSize: 16 }} // Smaller title
        />
        {unhandledCount > 0 && (
          <Badge 
            style={{ 
              backgroundColor: theme.colors.error,
              color: theme.colors.onError,
              marginRight: 4
            }}
          >
            {unhandledCount}
          </Badge>
        )}
        <Appbar.Action 
          icon="filter-variant" 
          onPress={() => setFilterDialogVisible(true)} 
          color={theme.colors.onPrimary}
          size={20} // Smaller icon
        />
        <Appbar.Action 
          icon="home" 
          onPress={navigateToHome} 
          color={theme.colors.onPrimary}
          size={20} // Smaller icon
        />
      </Appbar.Header>
      
      <View style={[styles.searchContainer]}>
        <Searchbar
          placeholder="Search alerts..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{ 
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 8,
            height: 36, // Reduced height
            margin: 0,
          }}
          iconColor={theme.colors.primary}
          inputStyle={{ color: theme.colors.onSurface, fontSize: 13 }} // Smaller text
        />
      </View>
      
      <View style={styles.filtersWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
          style={styles.filtersScrollView}
        >
          <Chip 
            selected={severityFilter === 'all'}
            onPress={() => setSeverityFilter('all')}
            style={[styles.filterChip, { 
              backgroundColor: severityFilter === 'all' 
                ? `${safeColors.primary}20` 
                : safeColors.surfaceVariant,
              borderColor: severityFilter === 'all' ? safeColors.primary : 'transparent',
              borderWidth: 1
            }]}
            selectedColor={safeColors.primary}
          >
            All Severities
          </Chip>
          <Chip 
            selected={severityFilter === 'critical'}
            onPress={() => setSeverityFilter('critical')}
            style={[styles.filterChip, { 
              backgroundColor: severityFilter === 'critical' 
                ? `${safeColors.error}20` 
                : safeColors.surfaceVariant,
              borderColor: severityFilter === 'critical' ? safeColors.error : 'transparent',
              borderWidth: 1
            }]}
            selectedColor={safeColors.error}
          >
            Critical
          </Chip>
          <Chip 
            selected={severityFilter === 'high'}
            onPress={() => setSeverityFilter('high')}
            style={[styles.filterChip, { 
              backgroundColor: severityFilter === 'high' 
                ? `${safeColors.error}30` 
                : safeColors.surfaceVariant 
            }]}
            elevation={2}
            selectedColor={safeColors.onSurface}
          >
            High
          </Chip>
          <Chip 
            selected={severityFilter === 'medium'}
            onPress={() => setSeverityFilter('medium')}
            style={[styles.filterChip, { 
              backgroundColor: severityFilter === 'medium' 
                ? `${safeColors.warning}30` 
                : safeColors.surfaceVariant 
            }]}
            elevation={2}
            selectedColor={safeColors.onSurface}
          >
            Medium
          </Chip>
          <Chip 
            selected={typeFilter === 'motion'}
            onPress={() => setTypeFilter(typeFilter === 'motion' ? 'all' : 'motion')}
            style={[styles.filterChip, { 
              backgroundColor: typeFilter === 'motion' 
                ? `${safeColors.secondary}30` 
                : safeColors.surfaceVariant 
            }]}
            icon="motion-sensor"
            elevation={2}
            selectedColor={safeColors.onSurface}
          >
            Motion
          </Chip>
          <Chip 
            selected={typeFilter === 'door'}
            onPress={() => setTypeFilter(typeFilter === 'door' ? 'all' : 'door')}
            style={[styles.filterChip, { 
              backgroundColor: typeFilter === 'door' 
                ? `${safeColors.secondary}30` 
                : safeColors.surfaceVariant 
            }]}
            icon="door"
            elevation={2}
            selectedColor={safeColors.onSurface}
          >
            Door
          </Chip>
        </ScrollView>
      </View>
      
      <FlatList
        data={filteredAlerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AlertItem 
            alert={item} 
            onPress={handleAlertPress}
          />
        )}
        contentContainerStyle={styles.alertsListContent}
        style={styles.alertsList}
        ItemSeparatorComponent={() => <View style={{ height: 2 }} />} // Tiny separator
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <IconButton 
              icon="check-circle"
              size={48} // Smaller icon
              iconColor={theme.colors.surfaceVariant}
            />
            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 14 }}>
              No alerts match your filters
            </Text>
          </View>
        )}
      />
      
      {/* Filter dialog */}
      <Portal>
        <Dialog
          visible={filterDialogVisible}
          onDismiss={() => setFilterDialogVisible(false)}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Dialog.Title>Filter Alerts</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: theme.colors.onSurface, marginBottom: 8 }}>Severity</Text>
            <RadioButton.Group 
              onValueChange={value => setTempSeverityFilter(value as 'all' | Alert['severity'])} 
              value={tempSeverityFilter}
            >
              <RadioButton.Item 
                label="All" 
                value="all" 
                color={theme.colors.primary}
              />
              <RadioButton.Item 
                label="Critical" 
                value="critical" 
                color={theme.colors.error}
              />
              <RadioButton.Item 
                label="High" 
                value="high" 
                color={theme.colors.error}
              />
              <RadioButton.Item 
                label="Medium" 
                value="medium" 
                color={safeColors.warning}
              />
              <RadioButton.Item 
                label="Low" 
                value="low" 
                color={safeColors.success}
              />
              <RadioButton.Item 
                label="Info" 
                value="info" 
                color={safeColors.info}
              />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setFilterDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleApplyFilters}>Apply</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Alert details dialog */}
      <Portal>
        <Dialog
          visible={selectedAlert !== null}
          onDismiss={closeAlertDetails}
          style={{ backgroundColor: theme.colors.surface }}
        >
          {selectedAlert && (
            <>
              <Dialog.Title>{selectedAlert.message}</Dialog.Title>
              <Dialog.Content>
                <View style={styles.alertDetailItem}>
                  <Text style={styles.alertDetailLabel}>Location:</Text>
                  <Text style={{ color: theme.colors.onSurface }}>{selectedAlert.location}</Text>
                </View>
                <View style={styles.alertDetailItem}>
                  <Text style={styles.alertDetailLabel}>Time:</Text>
                  <Text style={{ color: theme.colors.onSurface }}>
                    {new Intl.DateTimeFormat('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    }).format(selectedAlert.timestamp)}
                  </Text>
                </View>
                <View style={styles.alertDetailItem}>
                  <Text style={styles.alertDetailLabel}>Severity:</Text>
                  <Chip 
                    style={{ 
                      backgroundColor: `${getSeverityColor(selectedAlert.severity, theme)}20`,
                    }}
                    textStyle={{ color: getSeverityColor(selectedAlert.severity, theme) }}
                  >
                    {getSeverityLabel(selectedAlert.severity)}
                  </Chip>
                </View>
                <View style={styles.alertDetailItem}>
                  <Text style={styles.alertDetailLabel}>Status:</Text>
                  <Chip 
                    style={{ 
                      backgroundColor: selectedAlert.handled 
                        ? `${safeColors.success}20` 
                        : `${safeColors.warning}20`,
                      borderColor: selectedAlert.handled 
                        ? safeColors.success 
                        : safeColors.warning,
                    }}
                    textStyle={{ 
                      color: selectedAlert.handled 
                        ? safeColors.success 
                        : safeColors.warning
                    }}
                    mode="outlined"
                  >
                    {selectedAlert.handled ? 'Handled' : 'Pending'}
                  </Chip>
                </View>
              </Dialog.Content>
              <Dialog.Actions>
                {!selectedAlert.handled && (
                  <Button 
                    mode="contained"
                    style={{ backgroundColor: safeColors.success }}
                    onPress={closeAlertDetails}
                  >
                    Mark as Handled
                  </Button>
                )}
                <Button onPress={closeAlertDetails}>Close</Button>
              </Dialog.Actions>
            </>
          )}
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 0,
  },
  filtersWrapper: {
    paddingVertical: 0,
    marginVertical: 0,
    height: 30,
    zIndex: 1,
  },
  filtersScrollView: {
    paddingLeft: 8,
    height: 30,
    marginVertical: 0,
  },
  filtersContainer: {
    paddingHorizontal: 8,
    paddingVertical: 0,
    gap: 4,
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    marginBottom: 0,
  },
  filterChip: {
    borderRadius: 14,
    paddingVertical: 0,
    paddingHorizontal: 6,
    minWidth: 70,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
    elevation: 0,
    marginVertical: 0,
  },
  alertsList: {
    flex: 1,
    marginTop: -6, // Pull up the list
  },
  alertsListContent: {
    paddingHorizontal: 8,
    paddingTop: 0,
    paddingBottom: 8,
  },
  alertCard: {
    marginVertical: 2,
    borderRadius: 8,
    elevation: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  alertDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertDetailLabel: {
    fontWeight: 'bold',
    width: 70,
    fontSize: 13,
  },
});