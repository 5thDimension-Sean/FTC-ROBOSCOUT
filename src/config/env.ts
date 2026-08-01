/**
 * App configuration.
 *
 * FTC API credentials are read from Expo public env vars (see .env.example).
 * They are bundled into the client — acceptable for this app since the PRD
 * calls for direct client-side HTTP Basic Auth against the FTC Events API.
 *
 * Set these in a local `.env` file (git-ignored):
 *   EXPO_PUBLIC_FTC_API_USERNAME=your-username
 *   EXPO_PUBLIC_FTC_API_KEY=your-api-key
 *   EXPO_PUBLIC_FTC_SEASON=2025            # optional, defaults below
 */

export const FTC_API_BASE = 'https://ftc-api.firstinspires.org/v2.0';

/**
 * FTC season year. A season labelled "2025" is the 2025–2026 game.
 * FTC seasons launch in September, so before then the prior year's season is
 * the most recent one with data.
 */
export const DEFAULT_SEASON = '2025';

export const config = {
  apiBase: FTC_API_BASE,
  username: process.env.EXPO_PUBLIC_FTC_API_USERNAME ?? '',
  apiKey: process.env.EXPO_PUBLIC_FTC_API_KEY ?? '',
  season: process.env.EXPO_PUBLIC_FTC_SEASON ?? DEFAULT_SEASON,
};

export const hasCredentials = (): boolean =>
  config.username.length > 0 && config.apiKey.length > 0;
