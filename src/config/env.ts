/**
 * App configuration.
 *
 * The FTC client runs in one of two modes:
 *
 *  - DIRECT (native / local dev): calls the FTC API directly using HTTP Basic
 *    Auth with credentials from `.env`. The FTC API has no CORS support, so
 *    this mode does NOT work in a browser.
 *
 *  - PROXY (web / public deploy): calls a Cloudflare Worker proxy (see
 *    proxy/) that injects the credentials server-side and adds CORS headers.
 *    Set EXPO_PUBLIC_FTC_PROXY_URL and no key ships in the client bundle.
 *
 * Set these in a local `.env` file (git-ignored):
 *   EXPO_PUBLIC_FTC_API_USERNAME=your-username     # direct mode
 *   EXPO_PUBLIC_FTC_API_KEY=your-api-key           # direct mode
 *   EXPO_PUBLIC_FTC_PROXY_URL=https://…workers.dev # proxy mode (web)
 *   EXPO_PUBLIC_FTC_SEASON=2025                     # optional
 */
import { Platform } from 'react-native';

export const FTC_API_BASE = 'https://ftc-api.firstinspires.org/v2.0';

/**
 * Deployed CORS proxy (Cloudflare Worker). This URL is public and non-secret —
 * the FTC credentials live inside the Worker, never in this bundle. The web
 * build defaults to it so the hosted site works with no CI config; native/local
 * dev defaults to direct mode. Override either with EXPO_PUBLIC_FTC_PROXY_URL.
 */
const DEFAULT_PROXY_URL =
  Platform.OS === 'web'
    ? 'https://ftc-robotscout-proxy.5thdimension-sean.workers.dev'
    : '';

/**
 * FTC season year. A season labelled "2025" is the 2025–2026 game.
 * FTC seasons launch in September, so before then the prior year's season is
 * the most recent one with data.
 */
export const DEFAULT_SEASON = '2025';

export const config = {
  apiBase: FTC_API_BASE,
  proxyUrl: process.env.EXPO_PUBLIC_FTC_PROXY_URL || DEFAULT_PROXY_URL,
  username: process.env.EXPO_PUBLIC_FTC_API_USERNAME ?? '',
  apiKey: process.env.EXPO_PUBLIC_FTC_API_KEY ?? '',
  season: process.env.EXPO_PUBLIC_FTC_SEASON ?? DEFAULT_SEASON,
};

/** True when the app should route through the CORS proxy (web deploy). */
export const useProxy = (): boolean => config.proxyUrl.length > 0;

export const hasCredentials = (): boolean =>
  useProxy() || (config.username.length > 0 && config.apiKey.length > 0);
