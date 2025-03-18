import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Appbar, Surface } from 'react-native-paper';
import { navigateBack } from '../../utils/navigation';
import { useAppTheme } from '../../theme/ThemeProvider';

export default function AddBoundaryScreen() {
  const { theme } = useAppTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    // TODO: Save boundary to database
    console.log('Saving boundary:', { name, description });
    navigateBack();
  };

  return (
    <View style={{ ...styles.container, backgroundColor: theme.colors.background }}>
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.BackAction onPress={navigateBack} color={theme.colors.onPrimary} />
        <Appbar.Content title="Add Security Boundary" color={theme.colors.onPrimary} />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        <Surface style={{ ...styles.form, backgroundColor: theme.colors.surface }}>
          <TextInput
            label="Boundary Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
          />

          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
          />

          <View style={{ ...styles.instructions, backgroundColor: theme.colors.primaryContainer }}>
            <Text 
              variant="titleMedium" 
              style={{ ...styles.instructionsTitle, color: theme.colors.primary }}
            >
              How to Set Boundary
            </Text>
            <Text 
              variant="bodyMedium" 
              style={{ ...styles.instructionsText, color: theme.colors.onSurfaceVariant }}
            >
              1. Select the camera view where you want to set the boundary{'\n'}
              2. Tap on the screen to mark the corners of your boundary{'\n'}
              3. Connect the points to form a complete boundary{'\n'}
              4. Save the boundary to start monitoring
            </Text>
          </View>

          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.button}
            buttonColor={theme.colors.secondary}
            disabled={!name.trim()}
          >
            Save Boundary
          </Button>
        </Surface>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  form: {
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  input: {
    marginBottom: 16,
  },
  instructions: {
    marginVertical: 16,
    padding: 16,
    borderRadius: 8,
  },
  instructionsTitle: {
    marginBottom: 8,
  },
  instructionsText: {
    lineHeight: 24,
  },
  button: {
    marginTop: 8,
  },
}); 