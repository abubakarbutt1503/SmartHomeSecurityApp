import { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, Text, TextInput, Surface, IconButton, HelperText } from 'react-native-paper';
import { Link } from 'expo-router';
import { useAppTheme } from '../../theme/ThemeProvider';
import { useSupabase } from '../../context/SupabaseProvider';
import { navigateToLogin, navigateToHome, navigateBack } from '../../utils/navigation';

export default function SignupScreen() {
  const { theme } = useAppTheme();
  const { signUp } = useSupabase();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [error, setError] = useState('');

  const validateEmail = () => {
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@(gmail\.com|yahoo\.com)$/i;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid @gmail.com or @yahoo.com email address');
      return false;
    }
    
    setEmailError('');
    return true;
  };

  const validatePasswords = () => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    if (!hasUpperCase || !hasNumber || !hasSpecialChar) {
      setPasswordError(
        'Password must include at least one uppercase letter, one number, and one special character'
      );
      return false;
    }
    
    if (!confirmPassword) {
      setPasswordError('Please confirm your password');
      return false;
    }
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    
    setPasswordError('');
    return true;
  };

  const handleSignup = async () => {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePasswords();
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { data, error: signUpError } = await signUp(email, password, { full_name: name });
      if (signUpError) {
        setError(signUpError.message);
      } else {
        // Show success message and navigate to login
        alert('Please check your email to confirm your account');
        navigateToLogin();
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during signup');
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
            onChangeText={(text) => {
              setEmail(text);
              // Clear error while typing
              if (emailError) setEmailError('');
            }}
            onBlur={validateEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            outlineColor={emailError ? theme.colors.error : theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
            left={<TextInput.Icon icon="email" color={theme.colors.primary} />}
          />
          
          {emailError ? (
            <HelperText type="error" visible={!!emailError}>
              {emailError}
            </HelperText>
          ) : null}
          
          <TextInput
            label="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              // Clear error while typing
              if (passwordError) setPasswordError('');
            }}
            onBlur={validatePasswords}
            mode="outlined"
            secureTextEntry={!showPassword}
            style={styles.input}
            outlineColor={passwordError ? theme.colors.error : theme.colors.outline}
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
              // Clear error while typing
              if (passwordError) setPasswordError('');
            }}
            onBlur={validatePasswords}
            mode="outlined"
            secureTextEntry={!showPassword}
            style={styles.input}
            outlineColor={passwordError ? theme.colors.error : theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
            left={<TextInput.Icon icon="lock-check" color={theme.colors.primary} />}
          />
          
          {passwordError ? (
            <HelperText type="error" visible={!!passwordError}>
              {passwordError}
            </HelperText>
          ) : null}
          
          {error && (
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={handleSignup}
            loading={loading}
            style={styles.button}
            buttonColor={theme.colors.primary}
            contentStyle={styles.buttonContent}
            disabled={!name || !email || !password || !confirmPassword || !!passwordError || !!emailError || loading}
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