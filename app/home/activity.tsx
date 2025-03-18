import React, { useState } from 'react';
import { StyleSheet, View, FlatList, Image } from 'react-native';
import { 
  Appbar, 
  Text, 
  Card, 
  Chip, 
  Searchbar, 
  Divider,
  Button,
  SegmentedButtons,
  IconButton
} from 'react-native-paper';
import { router } from 'expo-router';
import { useAppTheme } from '../../theme/ThemeProvider';

// Mock data for demonstration
const MOCK_ACTIVITIES = [
  { 
    id: '1', 
    type: 'motion', 
    area: 'Front Door', 
    timestamp: new Date(2023, 8, 10, 14, 33), 
    thumbnailUrl: null, 
    isImportant: true 
  },
  { 
    id: '2', 
    type: 'boundary_cross', 
    area: 'Back Yard', 
    timestamp: new Date(2023, 8, 10, 12, 15), 
    thumbnailUrl: null,
    isImportant: false 
  },
  { 
    id: '3', 
    type: 'person', 
    area: 'Living Room', 
    timestamp: new Date(2023, 8, 9, 22, 45), 
    thumbnailUrl: null,
    isImportant: true 
  },
  { 
    id: '4', 
    type: 'motion', 
    area: 'Garage', 
    timestamp: new Date(2023, 8, 9, 18, 12), 
    thumbnailUrl: null,
    isImportant: false 
  },
  { 
    id: '5', 
    type: 'boundary_cross', 
    area: 'Front Door', 
    timestamp: new Date(2023, 8, 8, 16, 23), 
    thumbnailUrl: null,
    isImportant: false 
  },
];

// Helper function to format date/time
const formatDateTime = (date) => {
  return date.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: 'numeric', 
    hour12: true 
  });
};

// Activity type to icon mapping
const getActivityIcon = (type) => {
  switch (type) {
    case 'motion': return 'motion-sensor';
    case 'boundary_cross': return 'map-marker-alert';
    case 'person': return 'account-alert';
    default: return 'alert-circle';
  }
};

// Activity type to human-readable text
const getActivityText = (type) => {
  switch (type) {
    case 'motion': return 'Motion Detected';
    case 'boundary_cross': return 'Boundary Crossed';
    case 'person': return 'Person Detected';
    default: return 'Unknown Activity';
  }
};

const ActivityItem = ({ item }) => {
  const { theme } = useAppTheme();
  
  return (
    <Card 
      style={{ 
        ...styles.activityCard, 
        backgroundColor: theme.colors.surface,
        borderLeftWidth: 4,
        borderLeftColor: item.isImportant ? theme.colors.error : theme.colors.primary
      }}
      onPress={() => console.log('View activity details', item.id)}
    >
      <Card.Content style={styles.activityContent}>
        <View style={styles.activityIconContainer}>
          <IconButton 
            icon={getActivityIcon(item.type)} 
            size={28} 
            iconColor={item.isImportant ? theme.colors.error : theme.colors.primary}
          />
        </View>
        
        <View style={styles.activityDetails}>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
            {getActivityText(item.type)}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {item.area} • {formatDateTime(item.timestamp)}
          </Text>
          
          {item.isImportant && (
            <Chip 
              style={{ 
                ...styles.importantChip,
                backgroundColor: `${theme.colors.error}20` 
              }}
              textStyle={{ color: theme.colors.error }}
              icon="alert"
            >
              Important
            </Chip>
          )}
        </View>
        
        <IconButton 
          icon="chevron-right" 
          size={24} 
          iconColor={theme.colors.onSurfaceVariant}
        />
      </Card.Content>
    </Card>
  );
};

export default function ActivityScreen() {
  const { theme } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  
  const filteredActivities = MOCK_ACTIVITIES.filter(activity => {
    // Apply search query filter
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      return (
        activity.area.toLowerCase().includes(lowercaseQuery) ||
        getActivityText(activity.type).toLowerCase().includes(lowercaseQuery)
      );
    }
    
    // Apply activity type filter
    if (filter === 'important') {
      return activity.isImportant;
    } else if (filter !== 'all') {
      return activity.type === filter;
    }
    
    return true;
  });
  
  return (
    <View style={{ ...styles.container, backgroundColor: theme.colors.background }}>
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction onPress={() => router.back()} color={theme.colors.onPrimary} />
        <Appbar.Content title="Activity Log" color={theme.colors.onPrimary} />
        <Appbar.Action icon="filter" onPress={() => console.log('Filter')} color={theme.colors.onPrimary} />
      </Appbar.Header>
      
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search activities"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{ ...styles.searchbar, backgroundColor: theme.colors.surfaceVariant }}
          iconColor={theme.colors.primary}
          inputStyle={{ color: theme.colors.onSurface }}
        />
      </View>
      
      <SegmentedButtons
        value={filter}
        onValueChange={setFilter}
        buttons={[
          { value: 'all', label: 'All' },
          { value: 'important', label: 'Important' },
          { value: 'person', label: 'Person' },
          { value: 'motion', label: 'Motion' },
        ]}
        style={styles.filterButtons}
      />
      
      {filteredActivities.length > 0 ? (
        <FlatList
          data={filteredActivities}
          renderItem={({ item }) => <ActivityItem item={item} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <IconButton 
            icon="alert-circle-outline" 
            size={64} 
            iconColor={theme.colors.onSurfaceVariant}
          />
          <Text 
            variant="titleMedium" 
            style={{ 
              color: theme.colors.onSurfaceVariant,
              textAlign: 'center',
              marginTop: 16 
            }}
          >
            No activities found
          </Text>
          <Text 
            variant="bodyMedium" 
            style={{ 
              color: theme.colors.onSurfaceVariant,
              textAlign: 'center',
              marginTop: 8 
            }}
          >
            Try adjusting your filters
          </Text>
        </View>
      )}
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
  searchbar: {
    elevation: 2,
    borderRadius: 8,
  },
  filterButtons: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  listContent: {
    padding: 16,
  },
  activityCard: {
    borderRadius: 8,
    elevation: 2,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIconContainer: {
    marginRight: 8,
  },
  activityDetails: {
    flex: 1,
  },
  importantChip: {
    height: 24,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
}); 