/**
 * Local persistence layer backed by AsyncStorage.
 *
 * Stores the user's primary team and their list of favorited team numbers.
 * All values are namespaced under `@robotscout/`.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  primaryTeam: '@robotscout/primaryTeam',
  favorites: '@robotscout/favorites',
  themePref: '@robotscout/themePref',
} as const;

export type ThemePref = 'light' | 'dark' | 'system';

// ---- Primary team ----

export async function getPrimaryTeam(): Promise<number | null> {
  const raw = await AsyncStorage.getItem(KEYS.primaryTeam);
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export async function savePrimaryTeam(teamNumber: number): Promise<void> {
  await AsyncStorage.setItem(KEYS.primaryTeam, String(teamNumber));
  // The primary team is always a favorite.
  await addFavorite(teamNumber);
}

// ---- Favorites ----

export async function getFavorites(): Promise<number[]> {
  const raw = await AsyncStorage.getItem(KEYS.favorites);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'number') : [];
  } catch {
    return [];
  }
}

async function writeFavorites(list: number[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.favorites, JSON.stringify(list));
}

export async function addFavorite(teamNumber: number): Promise<number[]> {
  const current = await getFavorites();
  if (current.includes(teamNumber)) return current;
  const next = [...current, teamNumber];
  await writeFavorites(next);
  return next;
}

export async function removeFavorite(teamNumber: number): Promise<number[]> {
  const current = await getFavorites();
  const next = current.filter((n) => n !== teamNumber);
  await writeFavorites(next);
  return next;
}

export async function toggleFavorite(teamNumber: number): Promise<number[]> {
  const current = await getFavorites();
  return current.includes(teamNumber)
    ? removeFavorite(teamNumber)
    : addFavorite(teamNumber);
}

export async function isFavorite(teamNumber: number): Promise<boolean> {
  const current = await getFavorites();
  return current.includes(teamNumber);
}

// ---- Theme preference ----

export async function getThemePref(): Promise<ThemePref> {
  const raw = (await AsyncStorage.getItem(KEYS.themePref)) as ThemePref | null;
  return raw === 'light' || raw === 'dark' || raw === 'system' ? raw : 'system';
}

export async function saveThemePref(pref: ThemePref): Promise<void> {
  await AsyncStorage.setItem(KEYS.themePref, pref);
}

// ---- Cache clear (Settings → "Clear Cache") ----

/**
 * Clears cached API responses but preserves user preferences
 * (primary team, favorites, theme).
 */
export async function clearApiCache(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const cacheKeys = keys.filter((k) => k.startsWith('@robotscout/cache/'));
  if (cacheKeys.length) await AsyncStorage.multiRemove(cacheKeys);
}
