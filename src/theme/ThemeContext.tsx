/**
 * Theme provider: resolves the user's preference (light/dark/system) against
 * the OS color scheme and exposes the active palette via `useTheme()`.
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { useColorScheme } from 'react-native';
import { darkPalette, lightPalette, Palette } from './theme';
import { getThemePref, saveThemePref, ThemePref } from '../services/storage';

interface ThemeContextValue {
  palette: Palette;
  isDark: boolean;
  pref: ThemePref;
  setPref: (pref: ThemePref) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [pref, setPrefState] = useState<ThemePref>('system');

  useEffect(() => {
    getThemePref().then(setPrefState);
  }, []);

  const setPref = useCallback((next: ThemePref) => {
    setPrefState(next);
    saveThemePref(next);
  }, []);

  const isDark = pref === 'system' ? system === 'dark' : pref === 'dark';

  const value = useMemo<ThemeContextValue>(
    () => ({
      palette: isDark ? darkPalette : lightPalette,
      isDark,
      pref,
      setPref,
    }),
    [isDark, pref, setPref],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
