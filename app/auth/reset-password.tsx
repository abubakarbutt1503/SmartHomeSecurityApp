import { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Button, Text, TextInput, Surface, IconButton, HelperText } from 'react-native-paper';
import { useAppTheme } from '../../theme/ThemeProvider';
import { navigateBack } from '../../utils/navigation';

export default function ResetPasswordScreen() {
  const { theme } = useAppTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual password reset using your auth provider
      console.log('Password reset request for:', email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setEmailSent(true);
      Alert.alert(
        "Reset Email Sent",
        `We've sent password reset instructions to ${email}. Please check your inbox.`
      );
    } catch (error) {
      console.error('Password reset error:', error);
      Alert.alert(
        "Error",
        "There was a problem sending the reset email. Please try again."
      );
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