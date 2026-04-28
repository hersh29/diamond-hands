-- Row Level Security policies
-- Reference data (assets, asset_prices) is publicly readable.
-- User-owned data is private; public scenarios opt-in via is_public.

-- ============================================================
-- Reference data: public read, service-role write
-- ============================================================

alter table assets        enable row level security;
alter table asset_prices  enable row level security;

create policy "assets readable by everyone"
  on assets for select
  to anon, authenticated
  using (true);

create policy "asset_prices readable by everyone"
  on asset_prices for select
  to anon, authenticated
  using (true);

-- writes happen via service role which bypasses RLS

-- ============================================================
-- Profiles
-- ============================================================

alter table profiles enable row level security;

create policy "profiles read own"
  on profiles for select
  to authenticated
  using (id = auth.uid());

create policy "profiles update own"
  on profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- profile insert handled by trigger (security definer)

-- ============================================================
-- Portfolios
-- ============================================================

alter table portfolios enable row level security;

create policy "portfolios read own or public"
  on portfolios for select
  to anon, authenticated
  using (
    is_public
    or (auth.uid() is not null and user_id = auth.uid())
  );

create policy "portfolios insert own"
  on portfolios for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "portfolios update own"
  on portfolios for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "portfolios delete own"
  on portfolios for delete
  to authenticated
  using (user_id = auth.uid());

-- ============================================================
-- Holdings (inherit access from parent portfolio)
-- ============================================================

alter table holdings enable row level security;

create policy "holdings read via portfolio"
  on holdings for select
  to anon, authenticated
  using (
    exists (
      select 1 from portfolios p
      where p.id = holdings.portfolio_id
        and (p.is_public or (auth.uid() is not null and p.user_id = auth.uid()))
    )
  );

create policy "holdings write via owned portfolio"
  on holdings for all
  to authenticated
  using (
    exists (
      select 1 from portfolios p
      where p.id = holdings.portfolio_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from portfolios p
      where p.id = holdings.portfolio_id and p.user_id = auth.uid()
    )
  );

-- ============================================================
-- Transactions
-- ============================================================

alter table transactions enable row level security;

create policy "transactions read via portfolio"
  on transactions for select
  to anon, authenticated
  using (
    exists (
      select 1 from portfolios p
      where p.id = transactions.portfolio_id
        and (p.is_public or (auth.uid() is not null and p.user_id = auth.uid()))
    )
  );

create policy "transactions write via owned portfolio"
  on transactions for all
  to authenticated
  using (
    exists (
      select 1 from portfolios p
      where p.id = transactions.portfolio_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from portfolios p
      where p.id = transactions.portfolio_id and p.user_id = auth.uid()
    )
  );

-- ============================================================
-- Scenarios — anonymous saves allowed (user_id null), public reads opt-in
-- ============================================================

alter table scenarios enable row level security;

create policy "scenarios read public or own"
  on scenarios for select
  to anon, authenticated
  using (
    is_public
    or (auth.uid() is not null and user_id = auth.uid())
  );

create policy "scenarios insert"
  on scenarios for insert
  to anon, authenticated
  with check (
    -- anon may insert with null user_id; auth users insert with their own uid
    (auth.uid() is null and user_id is null)
    or (auth.uid() is not null and user_id = auth.uid())
  );

create policy "scenarios update own"
  on scenarios for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "scenarios delete own"
  on scenarios for delete
  to authenticated
  using (user_id = auth.uid());

-- ============================================================
-- Strategies + watchlists
-- ============================================================

alter table strategies enable row level security;

create policy "strategies own all"
  on strategies for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

alter table watchlists enable row level security;

create policy "watchlists own all"
  on watchlists for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

alter table watchlist_assets enable row level security;

create policy "watchlist_assets via watchlist"
  on watchlist_assets for all
  to authenticated
  using (
    exists (
      select 1 from watchlists w
      where w.id = watchlist_assets.watchlist_id and w.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from watchlists w
      where w.id = watchlist_assets.watchlist_id and w.user_id = auth.uid()
    )
  );

-- ============================================================
-- Increment view_count helper (callable from anon)
-- ============================================================

create or replace function public.increment_scenario_view(slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update scenarios set view_count = view_count + 1 where share_slug = slug and is_public;
$$;

grant execute on function public.increment_scenario_view(text) to anon, authenticated;
