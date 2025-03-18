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
import { router } from 'expo-router';
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
        borderLeftColor: getSeverityColor(alert.severity, theme),
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
            style={{ backgroundColor: getSeverityColor(alert.severity, theme) ? getSeverityColor(alert.severity, theme) + '33' : '#00000033' }}
            color={getSeverityColor(alert.severity, theme)}
            size={40}
          />
        )}
        right={(props) => (
          alert.handled ? (
            <Chip 
              mode="outlined" 
              style={{ 
                backgroundColor: `${theme.colors.success}20`,
                borderColor: theme.colors.success,
                marginRight: 16,
              }}
              textStyle={{ color: theme.colors.success }}
            >
              Handled
            </Chip>
          ) : (
            <Chip 
              mode="outlined" 
              style={{ 
                backgroundColor: `${theme.colors.warning}20`,
                borderColor: theme.colors.warning,
                marginRight: 16,
              }}
              textStyle={{ color: theme.colors.warning }}
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
        <Appbar.BackAction onPress={() => router.back()} color={theme.colors.onPrimary} />
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
      >
        <Chip 
          selected={severityFilter === 'all'}
          onPress={() => setSeverityFilter('all')}
          style={{ 
            backgroundColor: severityFilter === 'all' 
              ? `${theme.colors.primary}20` 
              : theme.colors.surfaceVariant 
          }}
        >
          All Severities
        </Chip>
        <Chip 
          selected={severityFilter === 'critical'}
          onPress={() => setSeverityFilter('critical')}
          style={{ 
            backgroundColor: severityFilter === 'critical' 
              ? `${theme.colors.error}20` 
              : theme.colors.surfaceVariant 
          }}
        >
          Critical
        </Chip>
        <Chip 
          selected={severityFilter === 'high'}
          onPress={() => setSeverityFilter('high')}
          style={{ 
            backgroundColor: severityFilter === 'high' 
              ? `${theme.colors.error}10` 
              : theme.colors.surfaceVariant 
          }}
        >
          High
        </Chip>
        <Chip 
          selected={severityFilter === 'medium'}
          onPress={() => setSeverityFilter('medium')}
          style={{ 
            backgroundColor: severityFilter === 'medium' 
              ? `${theme.colors.warning}20` 
              : theme.colors.surfaceVariant 
          }}
        >
          Medium
        </Chip>
        <Chip 
          selected={typeFilter === 'motion'}
          onPress={() => setTypeFilter(typeFilter === 'motion' ? 'all' : 'motion')}
          style={{ 
            backgroundColor: typeFilter === 'motion' 
              ? `${theme.colors.secondary}20` 
              : theme.colors.surfaceVariant 
          }}
          icon="motion-sensor"
        >
          Motion
        </Chip>
        <Chip 
          selected={typeFilter === 'door'}
          onPress={() => setTypeFilter(typeFilter === 'door' ? 'all' : 'door')}
          style={{ 
            backgroundColor: typeFilter === 'door' 
              ? `${theme.colors.secondary}20` 
              : theme.colors.surfaceVariant 
          }}
          icon="door"
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
                        ? `${theme.colors.success}20` 
                        : `${theme.colors.warning}20`,
                      borderColor: selectedAlert.handled 
                        ? theme.colors.success 
                        : theme.colors.warning,
                    }}
                    textStyle={{ 
                      color: selectedAlert.handled 
                        ? theme.colors.success 
                        : theme.colors.warning
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
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
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