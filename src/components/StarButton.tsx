import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';

/**
 * Star toggle that favorites/unfavorites a team number. Reads and writes
 * through the global AppContext so every screen stays in sync.
 */
export function StarButton({ teamNumber, size = 24 }: { teamNumber: number; size?: number }) {
  const { palette } = useTheme();
  const { isFavorite, toggleFavorite } = useApp();
  const active = isFavorite(teamNumber);
  return (
    <Pressable
      hitSlop={10}
      onPress={() => toggleFavorite(teamNumber)}
      style={styles.btn}
      accessibilityRole="button"
      accessibilityLabel={active ? 'Unfavorite team' : 'Favorite team'}
    >
      <Ionicons
        name={active ? 'star' : 'star-outline'}
        size={size}
        color={active ? palette.star : palette.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { padding: 4 },
});
