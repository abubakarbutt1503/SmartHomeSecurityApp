import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { 
  Appbar, 
  Text, 
  TextInput, 
  Button, 
  useTheme,
  Avatar,
  Snackbar,
  ActivityIndicator
} from 'react-native-paper';
import { router } from 'expo-router';
import { useSupabase } from '../../context/SupabaseProvider';

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const { user, updateUserProfile, updateUserEmail } = useSupabase();
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      // Set name from user metadata
      setName(user.user_metadata?.name || '');
      // Set email from user data
      setEmail(user.email || '');
    }
  }, [user]);
  
  // Handle name update
  const handleNameUpdate = async () => {
    if (!name.trim()) {
      setSnackbarMessage('Name cannot be empty');
      setSnackbarVisible(true);
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await updateUserProfile({ name: name.trim() });
      
      if (error) {
        setSnackbarMessage(error.message || 'Failed to update name');
      } else {
        setSnackbarMessage('Name updated successfully');
      }
    } catch (error: any) {
      setSnackbarMessage(error.message || 'An error occurred');
    } finally {
      setLoading(false);
      setSnackbarVisible(true);
    }
  };
  
  // Handle email update
  const handleEmailUpdate = async () => {
    if (!email.trim()) {
      setSnackbarMessage('Email cannot be empty');
      setSnackbarVisible(true);
      return;
    }
    
    // Don't update if email hasn't changed
    if (email === user?.email) {
      setSnackbarMessage('Email is unchanged');
      setSnackbarVisible(true);
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await updateUserEmail(email.trim());
      
      if (error) {
        setSnackbarMessage(error.message || 'Failed to update email');
      } else {
        setSnackbarMessage('Verification email sent. Please check your inbox.');
      }
    } catch (error: any) {
      setSnackbarMessage(error.message || 'An error occurred');
    } finally {
      setLoading(false);
      setSnackbarVisible(true);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Edit Profile" />
      </Appbar.Header>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.avatarContainer}>
            <Avatar.Icon size={80} icon="account" style={{ backgroundColor: colors.primary }} />
          </View>
          
          <View style={styles.formSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Profile Information</Text>
            
            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              disabled={loading}
            />
            <Button 
              mode="contained" 
              onPress={handleNameUpdate} 
              style={styles.button}
              disabled={loading}
            >
              Update Name
            </Button>
            
            <View style={styles.divider} />
            
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              disabled={loading}
            />
            <Text style={styles.helperText}>
              Changing your email requires verification. A link will be sent to the new email address.
            </Text>
            <Button 
              mode="contained" 
              onPress={handleEmailUpdate} 
              style={styles.button}
              disabled={loading}
            >
              Update Email
            </Button>
          </View>
          
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
});