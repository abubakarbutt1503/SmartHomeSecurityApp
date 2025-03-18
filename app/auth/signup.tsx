import { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, Text, TextInput, Surface, IconButton, HelperText } from 'react-native-paper';
import { Link } from 'expo-router';
import { useAppTheme } from '../../theme/ThemeProvider';
import { navigateToLogin, navigateToHome, navigateBack } from '../../utils/navigation';

export default function SignupScreen() {
  const { theme } = useAppTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const validatePasswords = () => {
    if (password && confirmPassword && password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    
    if (password.length > 0 && password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    
    setPasswordError('');
    return true;
  };

  const handleSignup = async () => {
    if (!validatePasswords()) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement Supabase authentication
      console.log('Signup attempt with:', { name, email });
      navigateToHome();
    } catch (error) {
      console.error('Signup error:', error);
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
            Create Account
          </Text>
          <Text 
            variant="titleMedium" 
            style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 10 }}
          >
            Join the Home Safety community
          </Text>
        </View>
        
        <Surface style={{ ...styles.formContainer, backgroundColor: theme.colors.surface }}>
          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
            left={<TextInput.Icon icon="account" color={theme.colors.primary} />}
          />
        
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
            left={<TextInput.Icon icon="email" color={theme.colors.primary} />}
          />
          
          <TextInput
            label="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (confirmPassword) validatePasswords();
            }}
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
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (password) validatePasswords();
            }}
            mode="outlined"
            secureTextEntry={!showPassword}
            style={styles.input}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
            left={<TextInput.Icon icon="lock-check" color={theme.colors.primary} />}
          />
          
          {passwordError ? (
            <HelperText type="error" visible={!!passwordError}>
              {passwordError}
            </HelperText>
          ) : null}
          
          <Button
            mode="contained"
            onPress={handleSignup}
            loading={loading}
            style={styles.button}
            buttonColor={theme.colors.primary}
            contentStyle={styles.buttonContent}
            disabled={!name || !email || !password || !confirmPassword}
          >
            Sign Up
          </Button>
          
          <Text
            style={{ 
              fontSize: 12, 
              textAlign: 'center', 
              marginTop: 20, 
              color: theme.colors.onSurfaceVariant
            }}
          >
            By signing up, you agree to our Terms of Service and Privacy Policy
          </Text>
        </Surface>
        
        <View style={styles.footer}>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>Already have an account? </Text>
          <Button 
            mode="text" 
            compact 
            textColor={theme.colors.primary}
            onPress={navigateToLogin}
          >
            Log In
          </Button>
        </View>
        
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={navigateBack}
          style={styles.backButton}
          iconColor={theme.colors.primary}
        />
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
}); 