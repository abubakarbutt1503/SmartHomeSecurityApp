import { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Button, Text, TextInput, Surface, IconButton, HelperText } from 'react-native-paper';
import { useAppTheme } from '../../theme/ThemeProvider';
import { useSupabase } from '../../context/SupabaseProvider';
import { navigateBack } from '../../utils/navigation';

export default function ResetPasswordScreen() {
  const { theme } = useAppTheme();
  const { resetPassword } = useSupabase();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleResetPassword = async () => {
    if (!email) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { data, error: resetError } = await resetPassword(email);
      if (resetError) {
        setError(resetError.message);
        Alert.alert("Error", resetError.message);
      } else {
        setEmailSent(true);
        Alert.alert(
          "Reset Email Sent",
          `We've sent password reset instructions to ${email}. Please check your inbox.`
        );
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred while sending reset instructions';
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
            {emailSent 
              ? "Check your email for reset instructions" 
              : "Enter your email to receive reset instructions"}
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
            disabled={emailSent}
            style={styles.input}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
            left={<TextInput.Icon icon="email" color={theme.colors.primary} />}
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
            disabled={!email || emailSent}
          >
            {emailSent ? "Email Sent" : "Send Reset Instructions"}
          </Button>
          
          {emailSent && (
            <Button
              mode="outlined"
              onPress={() => setEmailSent(false)}
              style={[styles.button, { marginTop: 12 }]}
              contentStyle={styles.buttonContent}
            >
              Try Another Email
            </Button>
          )}
        </Surface>
        
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
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
});