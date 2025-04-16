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
  RadioButton
} from 'react-native-paper';
import { navigateBack, navigateToHome } from '../../utils/navigation';
import { useAppTheme } from '../../theme/ThemeProvider';

// Mock alert data
const MOCK_ALERTS = [
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

const getAlertIcon = (type) => {
  switch (type) {
    case 'motion': return 'motion-sensor';
    case 'door': return 'door';
    case 'window': return 'window-open';
    case 'smoke': return 'smoke-detector';
    case 'system': return 'cog';
    default: return 'alert-circle';
  }
};

const getSeverityColor = (severity, theme) => {
  switch (severity) {
    case 'critical': return theme.colors.error;
    case 'high': return theme.colors.error;
    case 'medium': return theme.colors.warning;
    case 'low': return theme.colors.success;
    case 'info': return theme.colors.info;
    default: return theme.colors.primary;
  }
};

const getSeverityLabel = (severity) => {
  switch (severity) {
    case 'critical': return 'Critical';
    case 'high': return 'High';
    case 'medium': return 'Medium';
    case 'low': return 'Low';
    case 'info': return 'Info';
    default: return 'Unknown';
  }
};

const AlertItem = ({ alert, onPress }) => {
  const { theme } = useAppTheme();
  
  // Ensure theme colors exist to avoid undefined errors
  const safeColors = {
    success: theme?.colors?.success || '#4CAF50',
    error: theme?.colors?.error || '#F44336',
    warning: theme?.colors?.warning || '#FF9800',
    primary: theme?.colors?.primary || '#2196F3',
    secondary: theme?.colors?.secondary || '#03DAC6',
    onSurface: theme?.colors?.onSurface || '#000000',
    onSurfaceVariant: theme?.colors?.onSurfaceVariant || '#666666',
    surface: theme?.colors?.surface || '#FFFFFF',
    background: theme?.colors?.background || '#F5F5F5',
    outline: theme?.colors?.outline || '#CCCCCC',
    surfaceVariant: theme?.colors?.surfaceVariant || '#EEEEEE',
    onPrimary: theme?.colors?.onPrimary || '#FFFFFF',
    onSecondary: theme?.colors?.onSecondary || '#FFFFFF',
    onError: theme?.colors?.onError || '#FFFFFF',
    onWarning: '#000000', // Black text on warning background
    info: theme?.colors?.info || '#2196F3',
  };
  
  // Get color based on severity for this component
  const getItemSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return safeColors.error;
      case 'high': return safeColors.error;
      case 'medium': return safeColors.warning;
      case 'low': return safeColors.success;
      case 'info': return safeColors.primary;
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
            style={{ backgroundColor: getItemSeverityColor(alert.severity) ? getItemSeverityColor(alert.severity) + '33' : '#00000033' }}
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filterDialogVisible, setFilterDialogVisible] = useState(false);
  const [tempSeverityFilter, setTempSeverityFilter] = useState(severityFilter);
  
  // Ensure theme colors exist to avoid undefined errors
  const safeColors = {
    success: theme?.colors?.success || '#4CAF50',
    error: theme?.colors?.error || '#F44336',
    warning: theme?.colors?.warning || '#FF9800',
    primary: theme?.colors?.primary || '#2196F3',
    secondary: theme?.colors?.secondary || '#03DAC6',
    onSurface: theme?.colors?.onSurface || '#000000',
    onSurfaceVariant: theme?.colors?.onSurfaceVariant || '#666666',
    surface: theme?.colors?.surface || '#FFFFFF',
    background: theme?.colors?.background || '#F5F5F5',
    outline: theme?.colors?.outline || '#CCCCCC',
    surfaceVariant: theme?.colors?.surfaceVariant || '#EEEEEE',
    onPrimary: theme?.colors?.onPrimary || '#FFFFFF',
    onSecondary: theme?.colors?.onSecondary || '#FFFFFF',
    onError: theme?.colors?.onError || '#FFFFFF',
    onWarning: '#000000', // Black text on warning background
    info: theme?.colors?.info || '#2196F3',
  };
  
  // Get color based on severity
  const getSeverityColor = (severity, themeObj) => {
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
  
  const handleAlertPress = (alert) => {
    setSelectedAlert(alert);
  };
  
  const closeAlertDetails = () => {
    setSelectedAlert(null);
  };
  
  const handleApplyFilters = () => {
    setSeverityFilter(tempSeverityFilter);
    setFilterDialogVisible(false);
  };
  
  // Count unhandled alerts
  const unhandledCount = MOCK_ALERTS.filter(alert => !alert.handled).length;
  
  return (
    <View style={{ ...styles.container, backgroundColor: theme.colors.background }}>
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction onPress={navigateBack} color={theme.colors.onPrimary} />
        <Appbar.Content title="Security Alerts" color={theme.colors.onPrimary} />
        {unhandledCount > 0 && (
          <Badge 
            style={{ 
              backgroundColor: theme.colors.error,
              color: theme.colors.onError,
              marginRight: 8
            }}
          >
            {unhandledCount}
          </Badge>
        )}
        <Appbar.Action 
          icon="filter-variant" 
          onPress={() => setFilterDialogVisible(true)} 
          color={theme.colors.onPrimary} 
        />
        <Appbar.Action 
          icon="home" 
          onPress={navigateToHome} 
          color={theme.colors.onPrimary} 
        />
      </Appbar.Header>
      
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search alerts..."
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
      
      {/* Filter chips */}
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
      
      {/* Alert list */}
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
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <IconButton 
              icon="check-circle"
              size={64}
              iconColor={theme.colors.surfaceVariant}
            />
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
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
              onValueChange={value => setTempSeverityFilter(value)} 
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
                color={theme.colors.warning}
              />
              <RadioButton.Item 
                label="Low" 
                value="low" 
                color={theme.colors.success}
              />
              <RadioButton.Item 
                label="Info" 
                value="info" 
                color={theme.colors.info}
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
                    style={{ backgroundColor: theme.colors.success }}
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
    padding: 16,
  },
  filtersScrollView: {
    marginVertical: 0, // Reduced from 4
    paddingLeft: 8,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 2, // Reduced from 4
    gap: 8,  // Consistent spacing between chips
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 2, // Reduced from 4
  },
  filterChip: {
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 90,  // Ensure consistent minimum width
    height: 36,    // Consistent height
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    elevation: 1,
  },
  alertsList: {
    flex: 1,
  },
  alertsListContent: {
    padding: 16,
    paddingTop: 8,
  },
  alertCard: {
    marginBottom: 12,
    borderRadius: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  alertDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertDetailLabel: {
    fontWeight: 'bold',
    width: 80,
  },
});