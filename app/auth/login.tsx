import { useState } from 'react';
import { StyleSheet, View, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, Text, TextInput, Surface, IconButton, HelperText } from 'react-native-paper';
import { useAppTheme } from '../../theme/ThemeProvider';
import { useSupabase } from '../../context/SupabaseProvider';
import { navigateToSignup, navigateToHome, navigateBack, navigateToResetPassword } from '../../utils/navigation';

export default function LoginScreen() {
  const { theme } = useAppTheme();
  const { signIn } = useSupabase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(signInError.message);
      } else {
        navigateToHome();
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during login');
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
            Welcome Back
          </Text>
          <Text 
            variant="titleMedium" 
            style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 10 }}
          >
            Log in to your Home Safety account
          </Text>
        </View>
        
        <Surface style={{ ...styles.formContainer, backgroundColor: theme.colors.surface }}>
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
            onChangeText={setPassword}
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
          
          {error && (
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            style={styles.button}
            buttonColor={theme.colors.primary}
            contentStyle={styles.buttonContent}
            disabled={!email || !password || loading}
          >
            Log In
          </Button>
          
          <Button
            mode="text"
            onPress={navigateToResetPassword}
            style={styles.forgotPassword}
            textColor={theme.colors.primary}
          >
            Forgot Password?
          </Button>
        </Surface>
        
        <View style={styles.footer}>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>Don't have an account? </Text>
          <Button 
            mode="text" 
            compact 
            textColor={theme.colors.primary}
            onPress={navigateToSignup}
          >
            Sign Up
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
  forgotPassword: {
    alignSelf: 'center',
    marginTop: 16,
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