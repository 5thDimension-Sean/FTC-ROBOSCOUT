/**
 * Global app state: the user's primary team and favorited team numbers,
 * hydrated from AsyncStorage on mount and kept in sync on changes.
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import * as storage from '../services/storage';

interface AppContextValue {
  ready: boolean;
  primaryTeam: number | null;
  favorites: number[];
  setPrimaryTeam: (teamNumber: number) => Promise<void>;
  toggleFavorite: (teamNumber: number) => Promise<void>;
  isFavorite: (teamNumber: number) => boolean;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [primaryTeam, setPrimaryTeamState] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    (async () => {
      const [pt, favs] = await Promise.all([
        storage.getPrimaryTeam(),
        storage.getFavorites(),
      ]);
      setPrimaryTeamState(pt);
      setFavorites(favs);
      setReady(true);
    })();
  }, []);

  const setPrimaryTeam = useCallback(async (teamNumber: number) => {
    await storage.savePrimaryTeam(teamNumber);
    setPrimaryTeamState(teamNumber);
    setFavorites(await storage.getFavorites());
  }, []);

  const toggleFavorite = useCallback(async (teamNumber: number) => {
    const next = await storage.toggleFavorite(teamNumber);
    setFavorites(next);
  }, []);

  const isFavorite = useCallback(
    (teamNumber: number) => favorites.includes(teamNumber),
    [favorites],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      primaryTeam,
      favorites,
      setPrimaryTeam,
      toggleFavorite,
      isFavorite,
    }),
    [ready, primaryTeam, favorites, setPrimaryTeam, toggleFavorite, isFavorite],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
