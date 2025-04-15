import { useState, useEffect } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Button, Text, TextInput, Surface, IconButton, HelperText } from 'react-native-paper';
import { useAppTheme } from '../../theme/ThemeProvider';
import { useSupabase } from '../../context/SupabaseProvider';
import { navigateToLogin } from '../../utils/navigation';
import { useLocalSearchParams } from 'expo-router';

export default function ResetPasswordConfirmScreen() {
  const { theme } = useAppTheme();
  const { updateUserPassword } = useSupabase();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Get the token and other auth params from the URL
  const params = useLocalSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  
  useEffect(() => {
    // Extract token and type from URL parameters
    console.log('URL params received:', params);
    
    if (params.token) {
      setToken(params.token as string);
      console.log('Token found in URL params');
    }
    
    if (params.type) {
      setType(params.type as string);
      console.log('Auth type found:', params.type);
    }
  }, [params]);

  // Password validation
  const validatePassword = () => {
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleResetPassword = async () => {
    if (!validatePassword()) {
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      if (!token) {
        setError('Reset token is missing. Please use the link from your email.');
        setLoading(false);
        return;
      }
      
      console.log('Attempting to reset password with token present');
      
      // Update the user's password using the token
      const { error: resetError } = await updateUserPassword(newPassword, token);
      
      if (resetError) {
        console.error('Password reset error:', resetError);
        setError(resetError.message);
        Alert.alert("Error", resetError.message);
      } else {
        console.log('Password reset successful');
        setSuccess(true);
        Alert.alert(
          "Password Updated",
          "Your password has been successfully updated. You can now log in with your new password.",
          [{ text: "OK", onPress: navigateToLogin }]
        );
      }
    } catch (error: any) {
      console.error('Exception during password reset:', error);
      const errorMessage = error.message || 'An error occurred while resetting your password';
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ ...styles.container, backgroundColor: theme.colors.background }}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Text 
            variant="displaySmall" 
            style={{ color: theme.colors.primary, fontWeight: 'bold', textAlign: 'center' }}
          >
            Reset Password
          </Text>
          <Text 
            variant="titleMedium" 
            style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 10 }}
          >
            {success 
              ? "Your password has been reset successfully" 
              : "Enter your new password"}
          </Text>
        </View>
        
        {!success && (
          <Surface style={{ ...styles.formContainer, backgroundColor: theme.colors.surface }}>
            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              style={styles.input}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              left={<TextInput.Icon icon="lock" color={theme.colors.primary} />}
              right={
                <TextInput.Icon 
                  icon={showPassword ? "eye-off" : "eye"} 
                  onPress={() => setShowPassword(!showPassword)}
                  color={theme.colors.onSurfaceVariant}
                />
              }
            />
            
            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              secureTextEntry={!showConfirmPassword}
              style={styles.input}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              left={<TextInput.Icon icon="lock-check" color={theme.colors.primary} />}
              right={
                <TextInput.Icon 
                  icon={showConfirmPassword ? "eye-off" : "eye"} 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  color={theme.colors.onSurfaceVariant}
                />
              }
            />
            
            {error && (
              <HelperText type="error" visible={!!error}>
                {error}
              </HelperText>
            )}
            
            <Button
              mode="contained"
              onPress={handleResetPassword}
              loading={loading}
              style={styles.button}
              buttonColor={theme.colors.primary}
              contentStyle={styles.buttonContent}
              disabled={!newPassword || !confirmPassword || loading}
            >
              Reset Password
            </Button>
            
            <Button
              mode="text"
              onPress={navigateToLogin}
              style={styles.loginButton}
              textColor={theme.colors.primary}
            >
              Back to Login
            </Button>
          </Surface>
        )}
        
        {success && (
          <Surface style={{ ...styles.formContainer, backgroundColor: theme.colors.surface }}>
            <Button
              mode="contained"
              onPress={navigateToLogin}
              style={styles.button}
              buttonColor={theme.colors.primary}
              contentStyle={styles.buttonContent}
            >
              Go to Login
            </Button>
          </Surface>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    marginBottom: 40,
  },
  formContainer: {
    padding: 20,
    borderRadius: 12,
    elevation: 4,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 10,
    borderRadius: 8,
  },
  buttonContent: {
    height: 50,
  },
  loginButton: {
    alignSelf: 'center',
    marginTop: 16,
  },
});