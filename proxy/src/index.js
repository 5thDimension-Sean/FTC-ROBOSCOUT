/**
 * FTC robotScout — CORS proxy (Cloudflare Worker).
 *
 * The FTC Events API has no CORS support and requires HTTP Basic Auth, so a
 * browser can't call it directly. This Worker sits in front of it: it injects
 * the credentials (kept as Worker secrets, never in the client bundle) and
 * adds CORS headers so the hosted web app can call it.
 *
 * Deploy:
 *   npm i -g wrangler
 *   wrangler secret put FTC_API_USERNAME
 *   wrangler secret put FTC_API_KEY
 *   wrangler deploy
 *
 * Then point the web app at the Worker URL via EXPO_PUBLIC_FTC_PROXY_URL.
 */

const TARGET = 'https://ftc-api.firstinspires.org/v2.0';

// Only these origins may use the proxy from a browser. Add your Pages origin.
const ALLOWED_ORIGINS = [
  'https://5thdimension-sean.github.io',
  'http://localhost:8081',
  'http://localhost:8082',
];

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Accept, Content-Type',
    'Vary': 'Origin',
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders(origin) });
    }

    const url = new URL(request.url);
    const target = TARGET + url.pathname + url.search;
    const auth = 'Basic ' + btoa(`${env.FTC_API_USERNAME}:${env.FTC_API_KEY}`);

    const upstream = await fetch(target, {
      headers: { Authorization: auth, Accept: 'application/json' },
    });

    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        ...corsHeaders(origin),
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
    });
  },
};
