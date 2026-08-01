/**
 * First-launch modal. Shown when no primary team is stored. Captures a team
 * number, saves it as primary, and auto-favorites it (handled in storage).
 */
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, typography } from '../theme/theme';
import { useApp } from '../context/AppContext';

export function OnboardingModal() {
  const { palette } = useTheme();
  const { ready, primaryTeam, setPrimaryTeam } = useApp();
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visible = ready && primaryTeam == null;

  const onSubmit = async () => {
    const n = parseInt(value.trim(), 10);
    if (!Number.isFinite(n) || n <= 0) {
      setError('Enter a valid team number.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await setPrimaryTeam(n);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.55)' }]}
      >
        <View style={[styles.sheet, { backgroundColor: palette.surface }]}>
          <Text style={[styles.title, { color: palette.text }]}>
            Welcome to FTC robotScout
          </Text>
          <Text style={[styles.subtitle, { color: palette.textMuted }]}>
            Enter your team number to get started. We'll make it your primary
            team and add it to your favorites.
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: palette.surfaceAlt,
                borderColor: error ? palette.danger : palette.border,
                color: palette.text,
              },
            ]}
            placeholder="Team number"
            placeholderTextColor={palette.textMuted}
            keyboardType="number-pad"
            value={value}
            onChangeText={setValue}
            onSubmitEditing={onSubmit}
            returnKeyType="done"
            autoFocus
            maxLength={6}
          />
          {error ? (
            <Text style={[styles.error, { color: palette.danger }]}>{error}</Text>
          ) : null}

          <Pressable
            onPress={onSubmit}
            disabled={saving}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: palette.primary, opacity: pressed || saving ? 0.8 : 1 },
            ]}
          >
            {saving ? (
              <ActivityIndicator color={palette.primaryText} />
            ) : (
              <Text style={[styles.buttonText, { color: palette.primaryText }]}>
                Save & Continue
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  title: { ...typography.h1, marginBottom: spacing.sm },
  subtitle: { ...typography.body, marginBottom: spacing.xl, lineHeight: 21 },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 18,
  },
  error: { ...typography.caption, marginTop: spacing.sm },
  button: {
    marginTop: spacing.xl,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  buttonText: { ...typography.h3 },
});
