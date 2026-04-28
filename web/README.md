# DiamondHands — Web

Next.js 15 + Tailwind + Supabase. The user-facing app.

## Setup

```bash
cp .env.example .env.local
# fill in your Supabase keys
npm install
npm run dev
```

## Routes

- `/`                 — landing
- `/backtest`         — portfolio builder + run + save
- `/explore`          — browse public scenarios
- `/s/[slug]`         — public shared scenario (SSR + OG image)
- `/dashboard`        — saved scenarios for signed-in user
- `/login`, `/signup` — auth (email + Google OAuth)
- `/legal/{disclaimer,terms,privacy}`

## Architecture cheat sheet

- **Auth**: `@supabase/ssr` with cookie-based sessions. Middleware refreshes the session.
- **Backtest engine**: `lib/backtest/engine.ts` — pure TS, runs in the browser.
- **Data fetching**: `lib/backtest/fetch-prices.ts` pulls aligned price matrix from Supabase.
- **Sharing**: scenarios get an 8-char nanoid slug. Public route SSRs with cached results from the DB.
- **OG images**: `app/s/[slug]/opengraph-image.tsx` via `@vercel/og`.

## Required env vars (Vercel + local)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL          # e.g. https://diamondhands.space
SUPABASE_SERVICE_ROLE_KEY     # server-only; never sent to browser
```

## Vercel deployment

- Project root: `web/`
- Framework: Next.js (auto-detected)
- Set the env vars above in Project Settings
- Add `https://diamondhands.space/auth/callback` to Supabase Auth → URL Configuration → Redirect URLs
- Enable Google OAuth in Supabase Auth → Providers
