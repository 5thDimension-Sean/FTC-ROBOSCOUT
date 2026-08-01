import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeContext';
import { spacing, typography } from '../theme/theme';
import { ftcApi } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import { Card } from '../components/Card';
import { StarButton } from '../components/StarButton';
import { Loading, ErrorView } from '../components/StateView';
import type { FtcEvent } from '../types/ftc';

type Props = NativeStackScreenProps<RootStackParamList, 'TeamDetail'>;

export function TeamDetailScreen({ route, navigation }: Props) {
  const { teamNumber } = route.params;
  const { palette } = useTheme();

  const team = useAsync(async () => {
    const res = await ftcApi.getTeam(teamNumber);
    return res.teams[0] ?? null;
  }, [teamNumber]);

  const events = useAsync(
    () => ftcApi.getEvents({ teamNumber }).then((r) => r.events),
    [teamNumber],
  );

  if (team.loading) return <Loading label={`Loading team ${teamNumber}…`} />;
  if (team.error) return <ErrorView message={team.error} onRetry={team.reload} />;
  if (!team.data)
    return <ErrorView message={`Team ${teamNumber} not found this season.`} />;

  const t = team.data;
  const now = Date.now();
  const eventList = events.data ?? [];
  const upcoming = eventList.filter((e) => new Date(e.dateEnd).getTime() >= now);
  const past = eventList.filter((e) => new Date(e.dateEnd).getTime() < now);

  return (
    <ScrollView
      style={{ backgroundColor: palette.background }}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <Card>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.number, { color: palette.primary }]}>
              #{t.teamNumber}
            </Text>
            <Text style={[styles.name, { color: palette.text }]}>{t.nameShort}</Text>
          </View>
          <StarButton teamNumber={t.teamNumber} size={28} />
        </View>
        <InfoRow icon="school-outline" label="Organization" value={t.nameFull} />
        <InfoRow
          icon="location-outline"
          label="Location"
          value={[t.city, t.stateProv, t.country].filter(Boolean).join(', ')}
        />
        {t.rookieYear ? (
          <InfoRow
            icon="calendar-outline"
            label="Rookie year"
            value={String(t.rookieYear)}
          />
        ) : null}
      </Card>

      {/* TrueSkill — computed live on the TrueSkill tab */}
      <SectionTitle>TrueSkill</SectionTitle>
      <Card>
        <Text style={{ color: palette.textMuted, ...typography.body }}>
          This team's Bayesian rating (μ − 3σ) is computed from real match
          results on the TrueSkill tab, ranked against the teams it competes
          with.
        </Text>
      </Card>

      {/* Upcoming events */}
      <SectionTitle>Upcoming Events ({upcoming.length})</SectionTitle>
      {events.loading ? (
        <Card>
          <Text style={{ color: palette.textMuted }}>Loading events…</Text>
        </Card>
      ) : upcoming.length === 0 ? (
        <Card>
          <Text style={{ color: palette.textMuted }}>No upcoming events.</Text>
        </Card>
      ) : (
        upcoming.map((e) => (
          <EventRow
            key={e.code}
            event={e}
            onPress={() =>
              navigation.navigate('EventDetail', {
                eventCode: e.code,
                eventName: e.name,
              })
            }
          />
        ))
      )}

      {/* Past events */}
      <SectionTitle>Past Events ({past.length})</SectionTitle>
      {past.length === 0 ? (
        <Card>
          <Text style={{ color: palette.textMuted }}>No past events.</Text>
        </Card>
      ) : (
        past.map((e) => (
          <EventRow
            key={e.code}
            event={e}
            onPress={() =>
              navigation.navigate('EventDetail', {
                eventCode: e.code,
                eventName: e.name,
              })
            }
          />
        ))
      )}
    </ScrollView>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  const { palette } = useTheme();
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={palette.textMuted} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.infoLabel, { color: palette.textMuted }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: palette.text }]}>{value}</Text>
      </View>
    </View>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  const { palette } = useTheme();
  return (
    <Text style={[styles.sectionTitle, { color: palette.text }]}>{children}</Text>
  );
}

function EventRow({ event, onPress }: { event: FtcEvent; onPress: () => void }) {
  const { palette } = useTheme();
  return (
    <Card onPress={onPress} style={styles.eventRow}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.eventName, { color: palette.text }]} numberOfLines={1}>
          {event.name}
        </Text>
        <Text style={{ color: palette.textMuted, ...typography.caption }}>
          {[event.city, event.stateprov].filter(Boolean).join(', ')} ·{' '}
          {formatDate(event.dateStart)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={palette.textMuted} />
    </Card>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  number: { ...typography.h2 },
  name: { ...typography.h3, marginTop: 2 },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  infoLabel: { ...typography.caption },
  infoValue: { ...typography.body },
  sectionTitle: {
    ...typography.h3,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  eventName: { ...typography.label },
});
