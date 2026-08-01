import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { useTheme } from '../theme/ThemeContext';
import { spacing, typography } from '../theme/theme';

/**
 * TrueSkill leaderboard. The Bayesian ranking engine (μ / σ tracking, updated
 * from match results) is a later roadmap step; this screen documents the model
 * and will render the ranked leaderboard once the engine is wired in.
 */
export function TrueSkillScreen() {
  const { palette } = useTheme();
  return (
    <Screen>
      <View style={styles.content}>
        <Card>
          <View style={styles.header}>
            <Ionicons name="podium-outline" size={28} color={palette.primary} />
            <Text style={{ ...typography.h2, color: palette.text }}>TrueSkill</Text>
          </View>
          <Text style={{ ...typography.body, color: palette.textMuted, lineHeight: 21 }}>
            Global Bayesian team rankings. Each team holds a skill distribution
            N(μ, σ²); the conservative score is μ − 3σ. The ranking engine that
            updates μ and σ from match results is coming in a later build.
          </Text>
        </Card>

        <Card>
          <Text style={{ ...typography.label, color: palette.text, marginBottom: spacing.sm }}>
            Planned leaderboard columns
          </Text>
          {['Rank', 'Team #', 'Name', 'TrueSkill (μ − 3σ)', 'W–L–T'].map((c) => (
            <View key={c} style={styles.bullet}>
              <View style={[styles.dot, { backgroundColor: palette.primary }]} />
              <Text style={{ ...typography.body, color: palette.textMuted }}>{c}</Text>
            </View>
          ))}
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: spacing.lg, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  bullet: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
