# Decisions Log

Append-only. Newest decisions at the top. Each entry: what we decided, why, what we considered, what would make us reverse it.

---

## 2026-04-28 — Tailwind v3 over v4

**Decision:** Tailwind v3.4 for the web app.

**Why:** Stable, maximum docs/example coverage, shadcn-style primitives well-tested. v4 is fine but the migration cost is non-zero and we're optimizing for "ship fast, fewer surprises."

**Reverse if:** Tailwind v3 stops getting security patches, or we need a v4-only feature.

---

## 2026-04-28 — Backtest math runs in the browser, not server

**Decision:** All backtest math is pure TypeScript executed client-side. The server (Supabase) only stores prices and user data.

**Why:**
- Math is simple enough (multiplication, compounding) that browsers handle 10y × 50 tickers in <100ms
- Zero compute cost to us at any scale
- Lets us hit free-tier ceilings on Supabase Edge Functions never
- Easier to debug locally; user can see exactly what's computed

**Reverse if:** Monte Carlo with 10k+ simulations becomes a default, OR we need to gate the engine behind a paywall (server-side enforcement).

---

## 2026-04-28 — yfinance over Twelve Data as primary data source

**Decision:** yfinance via GitHub Actions cron is the primary EOD price source. Twelve Data is a coded fallback.

**Why:**
- yfinance is free and unmetered (vs Twelve Data's 800 req/day)
- Broad ticker coverage (5000+ vs Twelve Data's free tier ~currency-pair-only)
- Daily ingest is forgiving — we can retry on failures

**Reverse if:** Yahoo enforces rate limits or breaks the unofficial API. Twelve Data Basic plan is $29/mo with redistribution rights when revenue justifies.

**Risk:** Licensing gray area. yfinance ToS is "personal use." For a small SaaS this is a known gray zone the community operates in. We will upgrade to EODHD ($20/mo with redistribution rights) once we hit ~$100/mo MRR.

---

## 2026-04-28 — Drop Hetzner; use GitHub Actions for ingestion

**Decision:** Daily price ingestion runs as a GitHub Actions cron job, not on a Hetzner VPS.

**Why:**
- Public repo gets unlimited Actions minutes
- One less server to maintain, monitor, and patch
- Removes the only recurring cost in the stack

**Reverse if:** Ingest needs >6 hours per run (Actions max), or we need a long-running service for real-time features.

---

## 2026-04-28 — Monorepo, public, single repo

**Decision:** Single public repo containing `web/`, `ingest/`, `supabase/`, `legacy/`, `plan/`.

**Why:**
- Free GitHub Actions minutes (public repos)
- One source of truth for the project
- Simpler deploys (Vercel reads `web/`, Actions read `ingest/`)
- Public-by-default = light social proof when applying or sharing

**Reverse if:** We add proprietary algorithms or paid-tier server-side code that shouldn't leak.

---

## 2026-04-28 — Keep "DiamondHands" name; rebrand visuals

**Decision:** Keep the name and domain. Replace `💎👐` emoji logo with a custom geometric mark (two triangular facets forming a diamond/rhombus). Dark theme primary, accent color `#5EEAD4` (ice mint).

**Why:**
- Domain owned, name has crypto-meme equity, "diamond hands" gesture is a real cultural reference
- Mint accent differentiates from generic fintech green/blue
- Custom mark scales from favicon to wordmark cleanly

**Reverse if:** User testing shows the name pushes serious investors away (likely false, but worth measuring).

---

## 2026-04-28 — US-only at launch

**Decision:** US tickers + ETFs + USD-denominated crypto only. International / multi-currency comes in Phase 5.

**Why:** Constrains the asset universe (~600 tickers vs 50,000+), simplifies FX handling (none needed), keeps yfinance scope manageable.

**Reverse if:** Demand from non-US users is concrete and high-volume.

---

## 2026-04-28 — Auth: email + Google only

**Decision:** Supabase Auth with email/password and Google OAuth. No GitHub, no Apple, no magic links.

**Why:** Covers >95% of US retail users. Apple Sign-In requires Apple Developer ($99/yr) — over budget.

**Reverse if:** iOS PWA usage takes off and Apple Sign-In friction becomes obvious.

---

## 2026-04-28 — Supabase + Vercel + GitHub Actions stack

**Decision:** Supabase = DB + Auth + Storage. Vercel = frontend + API. GitHub Actions = cron worker.

**Why:**
- Three free tiers cover us until ~10k MAU
- All three have clear paid upgrade paths
- User already familiar with Supabase + Vercel
- Total recurring cost at zero users: $0

**Reverse if:** DB exceeds 500MB AND we don't have revenue (move to Hetzner Postgres).

---

## 2026-04-28 — Free at launch, paywall designed but disabled

**Decision:** No paywall on day one. Build feature gates into the schema (`scenarios.is_public`, plan column on `users`) but don't enforce limits in code yet.

**Why:**
- Need users before we know what to charge for
- Friction kills early signups
- Stripe adds 2 weeks to launch we don't have

**Reverse when:** ~500 active users OR Supabase costs cross $20/mo.
