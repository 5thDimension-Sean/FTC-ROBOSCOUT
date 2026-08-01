import React from 'react';
import { View, Text, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, typography } from '../theme/theme';

export function Loading({ label }: { label?: string }) {
  const { palette } = useTheme();
  return (
    <View style={styles.center}>
      <ActivityIndicator color={palette.primary} size="large" />
      {label ? (
        <Text style={[styles.text, { color: palette.textMuted }]}>{label}</Text>
      ) : null}
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { palette } = useTheme();
  return (
    <View style={styles.center}>
      <Ionicons name="alert-circle-outline" size={40} color={palette.danger} />
      <Text style={[styles.text, { color: palette.text }]}>{message}</Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          style={[styles.retry, { borderColor: palette.border }]}
        >
          <Text style={{ color: palette.primary, ...typography.label }}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function EmptyView({ icon = 'file-tray-outline', message }: {
  icon?: keyof typeof Ionicons.glyphMap;
  message: string;
}) {
  const { palette } = useTheme();
  return (
    <View style={styles.center}>
      <Ionicons name={icon} size={40} color={palette.textMuted} />
      <Text style={[styles.text, { color: palette.textMuted }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  text: { ...typography.body, textAlign: 'center' },
  retry: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
});
