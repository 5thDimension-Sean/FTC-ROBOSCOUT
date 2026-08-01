/**
 * FTC Events API client.
 *
 * Wraps the v2.0 REST API with HTTP Basic Auth, typed responses, friendly
 * errors, and a simple time-based AsyncStorage cache so the app stays usable
 * offline / between refreshes.
 */
import axios, { AxiosError, AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config, hasCredentials } from '../config/env';
import type {
  TeamListing,
  EventListing,
  MatchListing,
  RankingListing,
  AwardListing,
} from '../types/ftc';

const CACHE_PREFIX = '@robotscout/cache/';
const DEFAULT_TTL_MS = 1000 * 60 * 60; // 1 hour

export class FtcApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'FtcApiError';
    this.status = status;
  }
}

let instance: AxiosInstance | null = null;

function client(): AxiosInstance {
  if (!hasCredentials()) {
    throw new FtcApiError(
      'FTC API credentials are not set. Add EXPO_PUBLIC_FTC_API_USERNAME and ' +
        'EXPO_PUBLIC_FTC_API_KEY to your .env file.',
    );
  }
  if (!instance) {
    instance = axios.create({
      baseURL: config.apiBase,
      auth: { username: config.username, password: config.apiKey },
      headers: { Accept: 'application/json' },
      timeout: 15000,
    });
  }
  return instance;
}

interface CacheEntry<T> {
  ts: number;
  data: T;
}

async function readCache<T>(key: string, ttl: number): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() - entry.ts > ttl) return null;
    return entry.data;
  } catch {
    return null;
  }
}

async function writeCache<T>(key: string, data: T): Promise<void> {
  try {
    const entry: CacheEntry<T> = { ts: Date.now(), data };
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // Cache writes are best-effort.
  }
}

/**
 * GET a season-scoped path, using cache first (unless `forceFresh`) and
 * falling back to any stale cache if the network request fails.
 */
async function get<T>(
  path: string,
  opts: { ttl?: number; forceFresh?: boolean } = {},
): Promise<T> {
  const { ttl = DEFAULT_TTL_MS, forceFresh = false } = opts;
  const cacheKey = `${config.season}/${path}`;

  if (!forceFresh) {
    const cached = await readCache<T>(cacheKey, ttl);
    if (cached) return cached;
  }

  try {
    const res = await client().get<T>(`/${config.season}/${path}`);
    await writeCache(cacheKey, res.data);
    return res.data;
  } catch (err) {
    // On failure, serve stale cache if we have any.
    const stale = await readCache<T>(cacheKey, Number.POSITIVE_INFINITY);
    if (stale) return stale;

    const ax = err as AxiosError;
    if (ax.response) {
      const status = ax.response.status;
      const msg =
        status === 401
          ? 'Authentication failed — check your FTC API username/key.'
          : status === 404
            ? 'Not found.'
            : `Request failed (${status}).`;
      throw new FtcApiError(msg, status);
    }
    throw new FtcApiError(ax.message || 'Network error.');
  }
}

// ---- Public API ----

export const ftcApi = {
  /** Look up a single team by number. */
  async getTeam(teamNumber: number, forceFresh = false): Promise<TeamListing> {
    return get<TeamListing>(`teams?teamNumber=${teamNumber}`, { forceFresh });
  },

  /** Paged team list, optionally filtered by event. */
  async getTeams(
    params: { eventCode?: string; page?: number } = {},
    forceFresh = false,
  ): Promise<TeamListing> {
    const q = new URLSearchParams();
    if (params.eventCode) q.set('eventCode', params.eventCode);
    if (params.page) q.set('page', String(params.page));
    const qs = q.toString();
    return get<TeamListing>(`teams${qs ? `?${qs}` : ''}`, { forceFresh });
  },

  /** All events for the season, or filtered by event code / team number. */
  async getEvents(
    params: { eventCode?: string; teamNumber?: number } = {},
    forceFresh = false,
  ): Promise<EventListing> {
    const q = new URLSearchParams();
    if (params.eventCode) q.set('eventCode', params.eventCode);
    if (params.teamNumber) q.set('teamNumber', String(params.teamNumber));
    const qs = q.toString();
    return get<EventListing>(`events${qs ? `?${qs}` : ''}`, { forceFresh });
  },

  async getMatches(eventCode: string, forceFresh = false): Promise<MatchListing> {
    return get<MatchListing>(`matches/${eventCode}`, { forceFresh });
  },

  async getRankings(eventCode: string, forceFresh = false): Promise<RankingListing> {
    return get<RankingListing>(`rankings/${eventCode}`, { forceFresh });
  },

  async getAwards(eventCode: string, forceFresh = false): Promise<AwardListing> {
    return get<AwardListing>(`awards/${eventCode}`, { forceFresh });
  },
};
