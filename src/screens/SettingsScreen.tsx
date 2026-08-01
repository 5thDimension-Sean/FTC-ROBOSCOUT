import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, typography } from '../theme/theme';
import { useApp } from '../context/AppContext';
import { clearApiCache, type ThemePref } from '../services/storage';
import { config } from '../config/env';

export function SettingsScreen() {
  const { palette, pref, setPref } = useTheme();
  const { primaryTeam, setPrimaryTeam } = useApp();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');

  const themeOptions: { key: ThemePref; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'light', label: 'Light', icon: 'sunny-outline' },
    { key: 'dark', label: 'Dark', icon: 'moon-outline' },
    { key: 'system', label: 'System', icon: 'phone-portrait-outline' },
  ];

  const savePrimary = async () => {
    const n = parseInt(value.trim(), 10);
    if (!Number.isFinite(n) || n <= 0) {
      Alert.alert('Invalid', 'Enter a valid team number.');
      return;
    }
    await setPrimaryTeam(n);
    setEditing(false);
    setValue('');
  };

  const onClearCache = () => {
    Alert.alert('Clear cache?', 'Cached API data will be re-fetched on next load.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearApiCache();
          Alert.alert('Done', 'Cache cleared.');
        },
      },
    ]);
  };

  return (
    <Screen padded={false}>
      <View style={styles.content}>
        <SectionLabel>APPEARANCE</SectionLabel>
        <Card>
          <View style={styles.themeRow}>
            {themeOptions.map((opt) => {
              const active = pref === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => setPref(opt.key)}
                  style={[
                    styles.themeOpt,
                    {
                      backgroundColor: active ? palette.primary : palette.surfaceAlt,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={opt.icon}
                    size={22}
                    color={active ? palette.primaryText : palette.textMuted}
                  />
                  <Text
                    style={{
                      ...typography.caption,
                      color: active ? palette.primaryText : palette.textMuted,
                    }}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <SectionLabel>PRIMARY TEAM</SectionLabel>
        <Card>
          {editing ? (
            <View style={styles.editRow}>
              <TextInput
                style={[
                  styles.input,
                  { color: palette.text, borderColor: palette.border, backgroundColor: palette.surfaceAlt },
                ]}
                keyboardType="number-pad"
                placeholder="Team number"
                placeholderTextColor={palette.textMuted}
                value={value}
                onChangeText={setValue}
                autoFocus
              />
              <Pressable onPress={savePrimary} style={[styles.saveBtn, { backgroundColor: palette.primary }]}>
                <Text style={{ color: palette.primaryText, ...typography.label }}>Save</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.settingRow} onPress={() => setEditing(true)}>
              <Text style={{ ...typography.body, color: palette.text }}>
                {primaryTeam != null ? `Team #${primaryTeam}` : 'Not set'}
              </Text>
              <Text style={{ ...typography.label, color: palette.primary }}>Change</Text>
            </Pressable>
          )}
        </Card>

        <SectionLabel>DATA</SectionLabel>
        <Card onPress={onClearCache}>
          <View style={styles.settingRow}>
            <Text style={{ ...typography.body, color: palette.text }}>Clear cache</Text>
            <Ionicons name="refresh" size={20} color={palette.textMuted} />
          </View>
        </Card>

        <Text style={[styles.footer, { color: palette.textMuted }]}>
          FTC robotScout · Season {config.season}
        </Text>
      </View>
    </Screen>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  const { palette } = useTheme();
  return (
    <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>{children}</Text>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
  sectionLabel: {
    ...typography.caption,
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  themeRow: { flexDirection: 'row', gap: spacing.sm },
  themeOpt: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
  },
  saveBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
  },
  footer: { ...typography.caption, textAlign: 'center', marginTop: spacing.xxl },
});
