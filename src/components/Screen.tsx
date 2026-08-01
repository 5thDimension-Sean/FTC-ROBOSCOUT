import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

/**
 * Full-screen container that applies the themed background and top safe-area
 * padding. Set `edges={false}` for screens hosted inside a navigator header.
 */
export function Screen({
  children,
  style,
  padded = true,
  topInset = true,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
  topInset?: boolean;
}) {
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.root,
        { backgroundColor: palette.background },
        topInset && { paddingTop: insets.top },
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  padded: { paddingHorizontal: 16 },
});
