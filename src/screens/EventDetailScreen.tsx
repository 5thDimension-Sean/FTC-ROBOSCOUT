import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, typography } from '../theme/theme';
import { ftcApi } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import { Card } from '../components/Card';
import { Loading, ErrorView, EmptyView } from '../components/StateView';
import type { FtcMatch } from '../types/ftc';

type Props = NativeStackScreenProps<RootStackParamList, 'EventDetail'>;
type Section = 'teams' | 'matches';
type MatchFilter = 'all' | 'qual' | 'playoff';

export function EventDetailScreen({ route, navigation }: Props) {
  const { eventCode } = route.params;
  const { palette } = useTheme();
  const [section, setSection] = useState<Section>('teams');

  const teams = useAsync(
    () => ftcApi.getTeams({ eventCode }).then((r) => r.teams),
    [eventCode],
  );
  const matches = useAsync(
    () => ftcApi.getMatches(eventCode).then((r) => r.matches),
    [eventCode],
  );

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <View style={styles.segment}>
        <Seg label="Teams" active={section === 'teams'} onPress={() => setSection('teams')} />
        <Seg label="Matches" active={section === 'matches'} onPress={() => setSection('matches')} />
      </View>

      {section === 'teams' ? (
        teams.loading ? (
          <Loading />
        ) : teams.error ? (
          <ErrorView message={teams.error} onRetry={teams.reload} />
        ) : (teams.data ?? []).length === 0 ? (
          <EmptyView icon="people-outline" message="No teams registered yet." />
        ) : (
          <ScrollView contentContainerStyle={styles.body}>
            {(teams.data ?? []).map((t) => (
              <Card
                key={t.teamNumber}
                onPress={() => navigation.navigate('TeamDetail', { teamNumber: t.teamNumber })}
                style={styles.teamRow}
              >
                <Text style={{ ...typography.label, color: palette.primary, width: 64 }}>
                  #{t.teamNumber}
                </Text>
                <Text style={{ ...typography.body, color: palette.text, flex: 1 }} numberOfLines={1}>
                  {t.nameShort}
                </Text>
              </Card>
            ))}
          </ScrollView>
        )
      ) : (
        <MatchesSection
          matches={matches.data ?? []}
          loading={matches.loading}
          error={matches.error}
          onRetry={matches.reload}
        />
      )}
    </View>
  );
}

function MatchesSection({
  matches,
  loading,
  error,
  onRetry,
}: {
  matches: FtcMatch[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  const { palette } = useTheme();
  const [filter, setFilter] = useState<MatchFilter>('all');

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={onRetry} />;

  const filtered = matches.filter((m) => {
    const level = m.tournamentLevel?.toUpperCase() ?? '';
    if (filter === 'qual') return level.includes('QUAL');
    if (filter === 'playoff') return level.includes('PLAYOFF') || level.includes('ELIM');
    return true;
  });

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <View style={styles.filterRow}>
        {(['all', 'qual', 'playoff'] as MatchFilter[]).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.chip,
              {
                backgroundColor: filter === f ? palette.primary : palette.surfaceAlt,
                borderColor: palette.border,
              },
            ]}
          >
            <Text
              style={{
                ...typography.caption,
                color: filter === f ? palette.primaryText : palette.textMuted,
                textTransform: 'capitalize',
              }}
            >
              {f}
            </Text>
          </Pressable>
        ))}
      </View>

      {filtered.length === 0 ? (
        <EmptyView icon="grid-outline" message="No matches in this category yet." />
      ) : (
        filtered.map((m) => <MatchRow key={`${m.tournamentLevel}-${m.matchNumber}`} match={m} />)
      )}
    </ScrollView>
  );
}

function MatchRow({ match }: { match: FtcMatch }) {
  const { palette } = useTheme();
  const played = match.scoreRedFinal != null && match.scoreBlueFinal != null;
  const redWon = played && (match.scoreRedFinal ?? 0) > (match.scoreBlueFinal ?? 0);
  const blueWon = played && (match.scoreBlueFinal ?? 0) > (match.scoreRedFinal ?? 0);

  const red = match.teams.filter((t) => t.station?.startsWith('Red')).map((t) => t.teamNumber);
  const blue = match.teams.filter((t) => t.station?.startsWith('Blue')).map((t) => t.teamNumber);

  return (
    <Card style={styles.matchCard}>
      <Text style={{ ...typography.caption, color: palette.textMuted, marginBottom: spacing.xs }}>
        {match.description || `Match ${match.matchNumber}`}
      </Text>
      <AllianceRow
        color={palette.red}
        teams={red}
        score={match.scoreRedFinal}
        won={redWon}
        played={played}
      />
      <AllianceRow
        color={palette.blue}
        teams={blue}
        score={match.scoreBlueFinal}
        won={blueWon}
        played={played}
      />
    </Card>
  );
}

function AllianceRow({
  color,
  teams,
  score,
  won,
  played,
}: {
  color: string;
  teams: number[];
  score: number | null;
  won: boolean;
  played: boolean;
}) {
  const { palette } = useTheme();
  return (
    <View style={styles.allianceRow}>
      <View style={[styles.allianceDot, { backgroundColor: color }]} />
      <Text style={{ ...typography.body, color: palette.text, flex: 1 }}>
        {teams.join('  ·  ') || '—'}
      </Text>
      <Text
        style={{
          ...typography.h3,
          color: played ? (won ? palette.text : palette.textMuted) : palette.textMuted,
          fontWeight: won ? '800' : '600',
        }}
      >
        {played ? score : '–'}
      </Text>
    </View>
  );
}

function Seg({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { palette } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.seg,
        { borderBottomColor: active ? palette.primary : 'transparent' },
      ]}
    >
      <Text style={{ ...typography.label, color: active ? palette.primary : palette.textMuted }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  segment: { flexDirection: 'row', paddingHorizontal: spacing.lg },
  seg: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
  },
  body: { padding: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1 },
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  filterRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  matchCard: {},
  allianceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  allianceDot: { width: 10, height: 10, borderRadius: 5 },
});
