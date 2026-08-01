import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { StarButton } from '../components/StarButton';
import { EmptyView } from '../components/StateView';
import { useTheme } from '../theme/ThemeContext';
import { spacing, typography, radius } from '../theme/theme';
import { useApp } from '../context/AppContext';
import { useAsync } from '../hooks/useAsync';
import { ftcApi } from '../api/client';
import type { RootStackParamList, TabParamList } from '../navigation/types';

type Props = BottomTabScreenProps<TabParamList, 'Favorites'>;
type RootNav = NativeStackNavigationProp<RootStackParamList>;

export function FavoritesScreen({ navigation }: Props) {
  const { palette } = useTheme();
  const rootNav = useNavigation<RootNav>();
  const { primaryTeam, favorites } = useApp();

  const others = favorites.filter((n) => n !== primaryTeam);

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        {primaryTeam != null ? (
          <>
            <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>
              PRIMARY TEAM
            </Text>
            <TeamCard
              teamNumber={primaryTeam}
              highlight
              onPress={() => rootNav.navigate('TeamDetail', { teamNumber: primaryTeam })}
            />
          </>
        ) : null}

        <Pressable
          onPress={() => navigation.navigate('Lookup', { initialSubTab: 'events' })}
          style={({ pressed }) => [
            styles.findBtn,
            { backgroundColor: palette.primary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Ionicons name="navigate" size={18} color={palette.primaryText} />
          <Text style={{ ...typography.label, color: palette.primaryText }}>
            Find an Event
          </Text>
        </Pressable>

        <Text style={[styles.sectionLabel, { color: palette.textMuted, marginTop: spacing.lg }]}>
          FAVORITES ({others.length})
        </Text>
        {others.length === 0 ? (
          <EmptyView
            icon="star-outline"
            message="Star teams from Lookup to track them here."
          />
        ) : (
          others.map((n) => (
            <TeamCard
              key={n}
              teamNumber={n}
              onPress={() => rootNav.navigate('TeamDetail', { teamNumber: n })}
            />
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

function TeamCard({
  teamNumber,
  onPress,
  highlight,
}: {
  teamNumber: number;
  onPress: () => void;
  highlight?: boolean;
}) {
  const { palette } = useTheme();
  const team = useAsync(
    () => ftcApi.getTeam(teamNumber).then((r) => r.teams[0] ?? null),
    [teamNumber],
  );

  const t = team.data;
  return (
    <Card
      onPress={onPress}
      style={[
        styles.teamCard,
        highlight ? { borderColor: palette.primary, borderWidth: 1.5 } : null,
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ ...typography.h3, color: palette.primary }}>#{teamNumber}</Text>
        <Text style={{ ...typography.label, color: palette.text }}>
          {t ? t.nameShort : team.loading ? 'Loading…' : 'Unknown team'}
        </Text>
        {t ? (
          <Text style={{ ...typography.caption, color: palette.textMuted }}>
            {[t.city, t.stateProv, t.country].filter(Boolean).join(', ')}
          </Text>
        ) : null}
      </View>
      <StarButton teamNumber={teamNumber} />
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionLabel: { ...typography.caption, letterSpacing: 1, marginBottom: spacing.sm },
  teamCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  findBtn: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
});
