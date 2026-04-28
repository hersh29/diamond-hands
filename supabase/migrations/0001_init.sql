-- DiamondHands schema
-- Phase 0: assets, prices, portfolios, holdings, transactions, scenarios, strategies, watchlists

set search_path = public;

create extension if not exists pg_trgm;

-- ============================================================
-- Reference data
-- ============================================================

create type asset_type as enum ('stock', 'etf', 'crypto');

create table if not exists assets (
  id                bigserial primary key,
  symbol            text not null unique,
  name              text not null,
  type              asset_type not null,
  exchange          text,
  currency          text not null default 'USD',
  active            boolean not null default true,
  first_price_date  date,
  last_price_date   date,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index assets_symbol_trgm_idx on assets using gin (symbol gin_trgm_ops);
create index assets_name_trgm_idx   on assets using gin (name gin_trgm_ops);
create index assets_type_idx        on assets (type) where active;

create table if not exists asset_prices (
  asset_id   bigint not null references assets(id) on delete cascade,
  date       date not null,
  open       numeric(14, 4),
  high       numeric(14, 4),
  low        numeric(14, 4),
  close      numeric(14, 4) not null,
  adj_close  numeric(14, 4) not null,
  volume     bigint,
  primary key (asset_id, date)
);

create index asset_prices_date_idx on asset_prices (date);

-- ============================================================
-- User profile (extends auth.users)
-- ============================================================

create table if not exists profiles (
  id                          uuid primary key references auth.users(id) on delete cascade,
  display_name                text,
  avatar_url                  text,
  plan                        text not null default 'free',  -- 'free' | 'plus' | 'founder'
  disclaimer_accepted_at      timestamptz,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Portfolios + holdings + transactions (paper trading)
-- ============================================================

create type portfolio_type as enum ('backtest', 'paper');

create table if not exists portfolios (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  type        portfolio_type not null default 'backtest',
  is_public   boolean not null default false,
  share_slug  text unique,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index portfolios_user_idx on portfolios (user_id);
create index portfolios_share_idx on portfolios (share_slug) where share_slug is not null;

create table if not exists holdings (
  id            bigserial primary key,
  portfolio_id  uuid not null references portfolios(id) on delete cascade,
  asset_id      bigint not null references assets(id) on delete restrict,
  weight        numeric(8, 6),    -- 0..1, used for backtest portfolios
  shares        numeric(20, 8),   -- used for paper portfolios
  cost_basis    numeric(14, 4),
  opened_at     timestamptz not null default now(),
  unique (portfolio_id, asset_id)
);

create index holdings_portfolio_idx on holdings (portfolio_id);

create type transaction_type as enum ('buy', 'sell', 'deposit', 'withdraw', 'dividend');

create table if not exists transactions (
  id            uuid primary key default gen_random_uuid(),
  portfolio_id  uuid not null references portfolios(id) on delete cascade,
  asset_id      bigint references assets(id) on delete restrict,
  type          transaction_type not null,
  shares        numeric(20, 8),
  price         numeric(14, 4),
  cash_amount   numeric(14, 4),   -- for deposit/withdraw/dividend
  executed_at   timestamptz not null default now(),
  fees          numeric(14, 4) not null default 0,
  notes         text
);

create index transactions_portfolio_idx on transactions (portfolio_id, executed_at desc);

-- ============================================================
-- Scenarios (saved backtests)
-- ============================================================

create table if not exists scenarios (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade,  -- nullable for anonymous saves
  name          text not null,
  params        jsonb not null,        -- BacktestParams as documented in lib/backtest/types.ts
  results       jsonb,                  -- cached BacktestResult for fast share-page loads
  share_slug    text not null unique,
  is_public     boolean not null default true,
  view_count    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index scenarios_user_idx on scenarios (user_id);
create index scenarios_slug_idx on scenarios (share_slug);
create index scenarios_public_idx on scenarios (created_at desc) where is_public;

-- ============================================================
-- Strategies (Phase 3 — schema reserved)
-- ============================================================

create table if not exists strategies (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  portfolio_id  uuid references portfolios(id) on delete set null,
  name          text not null,
  rules         jsonb not null,
  active        boolean not null default true,
  last_run_at   timestamptz,
  created_at    timestamptz not null default now()
);

create index strategies_user_idx on strategies (user_id);

-- ============================================================
-- Watchlists (Phase 2/3)
-- ============================================================

create table if not exists watchlists (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now()
);

create table if not exists watchlist_assets (
  watchlist_id  uuid not null references watchlists(id) on delete cascade,
  asset_id      bigint not null references assets(id) on delete cascade,
  added_at      timestamptz not null default now(),
  primary key (watchlist_id, asset_id)
);

-- ============================================================
-- updated_at triggers
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger assets_updated_at      before update on assets      for each row execute function set_updated_at();
create trigger profiles_updated_at    before update on profiles    for each row execute function set_updated_at();
create trigger portfolios_updated_at  before update on portfolios  for each row execute function set_updated_at();
create trigger scenarios_updated_at   before update on scenarios   for each row execute function set_updated_at();
