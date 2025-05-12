import React from 'react';
import { 
  TextInput, 
  View, 
  Text, 
  StyleSheet, 
  TextInputProps,
  ViewStyle,
  TextStyle
} from 'react-native';
import Colors from '@/constants/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: ViewStyle;
  multiline?: boolean;
}

export default function Input({
  label,
  error,
  containerStyle,
  labelStyle,
  inputStyle,
  multiline = false,
  ...props
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          error && styles.inputError,
          inputStyle,
        ]}
        placeholderTextColor={Colors.gray[500]}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: Colors.dark,
    textAlign: 'right',
  },
  input: {
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.dark,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    textAlign: 'right',
  },
  multilineInput: {
    minHeight: 100,
    paddingTop: 12,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
});