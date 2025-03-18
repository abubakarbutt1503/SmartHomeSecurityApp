import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { Link } from 'expo-router';
import { useAppTheme } from '../theme/ThemeProvider';
import { navigateToSignup, navigateToLogin } from '../utils/navigation';

export default function WelcomeScreen() {
  const { theme } = useAppTheme();

  return (
    <View style={{ ...styles.container, backgroundColor: theme.colors.background }}>
      <View style={styles.logoContainer}>
        <Text 
          variant="displayLarge" 
          style={{ ...styles.logo, color: theme.colors.primary }}
        >
          🏠
        </Text>
        <Text 
          variant="headlineMedium" 
          style={{ ...styles.logoText, color: theme.colors.primary }}
        >
          Home Safety
        </Text>
      </View>
      
      <View style={styles.contentContainer}>
        <Text 
          variant="headlineLarge" 
          style={{ ...styles.title, color: theme.colors.onSurface }}
        >
          Home Safety & Surveillance
        </Text>
        <Text 
          variant="bodyLarge" 
          style={{ ...styles.subtitle, color: theme.colors.onSurfaceVariant }}
        >
          Monitor your home with advanced AI-powered surveillance
        </Text>
        
        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            style={styles.button}
            buttonColor={theme.colors.primary}
            onPress={navigateToSignup}
          >
            Sign Up
          </Button>
          
          <Button 
            mode="outlined" 
            style={styles.button}
            textColor={theme.colors.primary}
            onPress={navigateToLogin}
          >
            Log In
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: 10,
  },
  logoText: {
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
  },
  button: {
    width: '100%',
    marginVertical: 5,
  },
}); 