import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { StarButton } from '../components/StarButton';
import { Loading, ErrorView, EmptyView } from '../components/StateView';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, typography } from '../theme/theme';
import { ftcApi } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import {
  sortEventsByDistance,
  formatDistance,
  type Coords,
} from '../utils/distance';
import type { LookupSubTab, RootStackParamList, TabParamList } from '../navigation/types';
import type { Team } from '../types/ftc';

type Props = BottomTabScreenProps<TabParamList, 'Lookup'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function LookupScreen({ route }: Props) {
  const { palette } = useTheme();
  const [subTab, setSubTab] = useState<LookupSubTab>(
    route.params?.initialSubTab ?? 'teams',
  );

  // Respond to "Find an Event" deep-switch from the Favorites tab.
  useEffect(() => {
    if (route.params?.initialSubTab) setSubTab(route.params.initialSubTab);
  }, [route.params?.initialSubTab]);

  return (
    <Screen padded={false}>
      <View style={styles.toggleWrap}>
        <Toggle
          label="Teams"
          active={subTab === 'teams'}
          onPress={() => setSubTab('teams')}
        />
        <Toggle
          label="Events"
          active={subTab === 'events'}
          onPress={() => setSubTab('events')}
        />
      </View>
      {subTab === 'teams' ? <TeamsTab /> : <EventsTab />}
    </Screen>
  );
}

function Toggle({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { palette } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.toggle,
        {
          backgroundColor: active ? palette.primary : palette.surfaceAlt,
          borderColor: palette.border,
        },
      ]}
    >
      <Text
        style={{
          ...typography.label,
          color: active ? palette.primaryText : palette.textMuted,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// ---- Teams sub-tab ----

function TeamsTab() {
  const { palette } = useTheme();
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState<number | null>(null);

  const result = useAsync(async () => {
    if (submitted == null) return null;
    const res = await ftcApi.getTeam(submitted);
    return res.teams[0] ?? null;
  }, [submitted]);

  const onSearch = () => {
    const n = parseInt(query.trim(), 10);
    setSubmitted(Number.isFinite(n) && n > 0 ? n : -1);
  };

  return (
    <View style={styles.tabBody}>
      <View style={[styles.searchBar, { backgroundColor: palette.surfaceAlt, borderColor: palette.border }]}>
        <Ionicons name="search" size={18} color={palette.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: palette.text }]}
          placeholder="Search by team number"
          placeholderTextColor={palette.textMuted}
          keyboardType="number-pad"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={onSearch}
          returnKeyType="search"
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={palette.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {submitted == null ? (
        <EmptyView icon="people-outline" message="Search for a team by its number." />
      ) : submitted === -1 ? (
        <EmptyView icon="alert-circle-outline" message="Enter a valid team number." />
      ) : result.loading ? (
        <Loading />
      ) : result.error ? (
        <ErrorView message={result.error} onRetry={result.reload} />
      ) : !result.data ? (
        <EmptyView icon="search-outline" message={`No team #${submitted} this season.`} />
      ) : (
        <TeamResultCard
          team={result.data}
          onPress={() =>
            navigation.navigate('TeamDetail', { teamNumber: result.data!.teamNumber })
          }
        />
      )}
    </View>
  );
}

function TeamResultCard({ team, onPress }: { team: Team; onPress: () => void }) {
  const { palette } = useTheme();
  return (
    <Card onPress={onPress} style={styles.resultCard}>
      <View style={{ flex: 1 }}>
        <Text style={{ ...typography.h3, color: palette.primary }}>
          #{team.teamNumber}
        </Text>
        <Text style={{ ...typography.label, color: palette.text }}>{team.nameShort}</Text>
        <Text style={{ ...typography.caption, color: palette.textMuted }}>
          {[team.city, team.stateProv, team.country].filter(Boolean).join(', ')}
        </Text>
      </View>
      <StarButton teamNumber={team.teamNumber} />
    </Card>
  );
}

// ---- Events sub-tab ----

function EventsTab() {
  const { palette } = useTheme();
  const navigation = useNavigation<Nav>();
  const [origin, setOrigin] = useState<Coords | null>(null);
  const [locStatus, setLocStatus] = useState<'idle' | 'denied' | 'done'>('idle');

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocStatus('denied');
        return;
      }
      try {
        const pos = await Location.getCurrentPositionAsync({});
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      } catch {
        // Keep origin null; list falls back to date sorting.
      } finally {
        setLocStatus('done');
      }
    })();
  }, []);

  const events = useAsync(() => ftcApi.getEvents().then((r) => r.events), []);

  if (events.loading || locStatus === 'idle') return <Loading label="Finding events…" />;
  if (events.error) return <ErrorView message={events.error} onRetry={events.reload} />;

  const sorted = sortEventsByDistance(events.data ?? [], origin);

  return (
    <FlatList
      data={sorted}
      keyExtractor={(item) => item.event.code}
      contentContainerStyle={styles.tabBody}
      ListHeaderComponent={
        locStatus === 'denied' || !origin ? (
          <Text style={[styles.notice, { color: palette.textMuted, borderColor: palette.border }]}>
            {locStatus === 'denied'
              ? 'Location off — showing events by date. Enable location to sort by distance.'
              : 'Sorted by date (no coordinates available for these events).'}
          </Text>
        ) : null
      }
      ListEmptyComponent={<EmptyView icon="calendar-outline" message="No events this season." />}
      renderItem={({ item }) => (
        <Card
          onPress={() =>
            navigation.navigate('EventDetail', {
              eventCode: item.event.code,
              eventName: item.event.name,
            })
          }
          style={styles.resultCard}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ ...typography.label, color: palette.text }} numberOfLines={1}>
              {item.event.name}
            </Text>
            <Text style={{ ...typography.caption, color: palette.textMuted }}>
              {[item.event.city, item.event.stateprov].filter(Boolean).join(', ')}
            </Text>
          </View>
          {item.distanceKm != null ? (
            <Text style={{ ...typography.caption, color: palette.primary }}>
              {formatDistance(item.distanceKm)}
            </Text>
          ) : null}
          <Ionicons name="chevron-forward" size={18} color={palette.textMuted} />
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  toggleWrap: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  toggle: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tabBody: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  searchInput: { flex: 1, paddingVertical: spacing.md, fontSize: 16 },
  resultCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  notice: {
    ...typography.caption,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
});
