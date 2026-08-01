# FTC robotScout

A cross-platform (iOS & Android) app for FIRST Tech Challenge competitors, mentors, and fans to track teams, discover nearby events, view match schedules, and analyze performance.

Built with **Expo (React Native + TypeScript)**.

## Setup

1. **Install Node 20+** (this project was built with Node 20 via nvm).
2. Install dependencies:
   ```bash
   npm install
   ```
3. **Add FTC API credentials.** Request them at
   <https://ftc-events.firstinspires.org/services/API>, then:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in `EXPO_PUBLIC_FTC_API_USERNAME` and
   `EXPO_PUBLIC_FTC_API_KEY`. **`.env` is git-ignored — never commit it.**
4. Start the dev server:
   ```bash
   npm start          # then press 'a' for Android, 'w' for web
   npm run android    # or launch straight to Android
   ```

## Project structure

```
src/
  api/         FTC Events API client (Basic Auth, caching)
  components/  Reusable UI (Card, StarButton, Screen, StateView, OnboardingModal)
  config/      Env + season configuration
  context/     Global app state (primary team, favorites)
  hooks/       useAsync data-fetching hook
  navigation/  Root stack + 4-tab bottom navigator
  screens/     Favorites, TrueSkill, Lookup, Settings, TeamDetail, EventDetail
  services/    AsyncStorage persistence
  theme/       Design tokens + light/dark theme provider
  utils/       Distance / geolocation helpers
```

## Feature status

| Feature | Status |
| --- | --- |
| 4-tab navigation + light/dark/system theming | ✅ |
| First-launch onboarding (primary team + auto-favorite) | ✅ |
| Local storage (primary team, favorites, theme, cache) | ✅ |
| FTC API client (teams, events, matches, rankings, awards) | ✅ |
| Lookup → Teams search → Team Detail (live data) | ✅ |
| Lookup → Events (geolocation distance sort) → Event Detail | ✅ |
| Event Detail (attending teams + filterable match results) | ✅ |
| Favorites tab (primary banner, list, "Find an Event") | ✅ |
| Settings (theme, primary team, clear cache) | ✅ |
| TrueSkill ranking engine (μ/σ Bayesian) | 🚧 documented; engine is the next roadmap step |

## Notes

- API credentials are bundled client-side via `EXPO_PUBLIC_*` env vars, per the
  spec's direct client-side Basic Auth design.
- The default season is `2025` (the 2025–2026 game); override with
  `EXPO_PUBLIC_FTC_SEASON`.
