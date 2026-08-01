# FTC robotScout — CORS proxy

The FTC Events API has no CORS support, so the hosted web app can't call it from
a browser. This Cloudflare Worker proxies the API, injecting HTTP Basic Auth
(kept as Worker secrets — never in the client bundle) and adding CORS headers.

## Deploy (free Cloudflare account)

```bash
npm install -g wrangler
cd proxy
wrangler login
wrangler secret put FTC_API_USERNAME   # paste your FTC API username
wrangler secret put FTC_API_KEY        # paste your FTC API key
wrangler deploy
```

`wrangler deploy` prints a URL like `https://ftc-robotscout-proxy.<you>.workers.dev`.

## Wire the app to it

- **Local web dev:** put it in `.env` → `EXPO_PUBLIC_FTC_PROXY_URL=https://…workers.dev`
- **GitHub Pages build:** add it as a repo **variable** named `EXPO_PUBLIC_FTC_PROXY_URL`
  (Settings → Secrets and variables → Actions → Variables). The deploy workflow
  passes it into the build.

With the proxy URL set, the app calls the Worker and **no API key ships in the
web bundle**. Without it (native / local dev), the app calls the FTC API
directly using the credentials in `.env`.

## Lock it down

`ALLOWED_ORIGINS` in `src/index.js` restricts which sites' browsers may use the
proxy. Keep your Pages origin there and remove localhost entries for production.
