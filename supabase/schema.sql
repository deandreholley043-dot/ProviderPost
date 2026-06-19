-- ProviderPost Complete Database Schema
-- Run this in your Supabase SQL editor before deploying
-- ============================================================

-- ── Users ──────────────────────────────────────────────────
create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  username      text unique not null,
  email         text unique not null,
  password_hash text not null,
  account_type  text not null default 'hobbyist', -- 'hobbyist' | 'provider' | 'admin'
  verified      boolean not null default false,
  banned        boolean not null default false,
  ban_reason    text,
  shadow_banned boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  last_login_at timestamptz
);
alter table public.users enable row level security;
create policy "Users can read own row" on public.users for select using (auth.uid() = id);
create policy "Service role full access" on public.users using (true) with check (true);

-- ── Sessions ───────────────────────────────────────────────
create table if not exists public.sessions (
  id         text primary key,
  user_id    uuid references public.users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- ── Providers / Ads ────────────────────────────────────────
create table if not exists public.providers (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references public.users(id) on delete cascade,
  name             text not null,
  age              text,
  gender           text,
  height           text,
  weight           text,
  ethnicity        text,
  sees             text,
  quick_visit      text,
  half_hour        text,
  hour             text,
  overnight        text,
  category         text not null default 'incall', -- 'incall' | 'both'
  phone            text,
  whatsapp         text,
  wechat           text,
  messaging_apps   text,
  city             text,
  state            text,
  zip              text,
  description      text,
  short_description text,
  photo_count      int not null default 0,
  video_count      int not null default 0,
  verified         boolean not null default false,
  available_now    boolean not null default false,
  status           text not null default 'pending', -- 'pending'|'approved'|'rejected'|'expired'|'hidden'|'banned'
  posted_at        text not null default to_char(now(), 'FMHH12:MI AM'),
  expires_at       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
alter table public.providers enable row level security;
create policy "Public can read approved providers" on public.providers for select using (status = 'approved');
create policy "Owners can manage their providers" on public.providers using (auth.uid() = user_id);

-- ── Provider Images ────────────────────────────────────────
create table if not exists public.provider_images (
  id          uuid primary key default gen_random_uuid(),
  provider_id uuid references public.providers(id) on delete cascade,
  user_id     uuid references public.users(id) on delete cascade,
  url         text not null,
  filename    text,
  size_bytes  int,
  order_idx   int not null default 0,
  created_at  timestamptz not null default now()
);
alter table public.provider_images enable row level security;
create policy "Public can view images" on public.provider_images for select using (true);
create policy "Owners can manage images" on public.provider_images using (auth.uid() = user_id);

-- ── Reviews ────────────────────────────────────────────────
create table if not exists public.reviews (
  id             uuid primary key default gen_random_uuid(),
  provider_id    uuid references public.providers(id) on delete cascade,
  author_user_id uuid references public.users(id) on delete cascade,
  author_username text not null,
  rating         int not null check (rating between 1 and 5),
  text           text not null,
  read_by_admin  boolean not null default false,
  created_at     timestamptz not null default now()
);
alter table public.reviews enable row level security;
create policy "Anyone can read reviews" on public.reviews for select using (true);
create policy "Hobbyists can insert reviews" on public.reviews for insert with check (auth.uid() = author_user_id);

-- ── Favorites ──────────────────────────────────────────────
create table if not exists public.favorites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.users(id) on delete cascade,
  provider_id uuid references public.providers(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique(user_id, provider_id)
);
alter table public.favorites enable row level security;
create policy "Users manage own favorites" on public.favorites using (auth.uid() = user_id);

-- ── Bans ───────────────────────────────────────────────────
create table if not exists public.bans (
  id          uuid primary key default gen_random_uuid(),
  type        text not null, -- 'ip' | 'email' | 'username'
  value       text not null,
  reason      text not null,
  banned_by   text not null default 'admin',
  permanent   boolean not null default true,
  expires_at  timestamptz,
  notes       text,
  created_at  timestamptz not null default now()
);

-- ── Promo Codes ────────────────────────────────────────────
create table if not exists public.promo_codes (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,
  type        text not null, -- 'days_free'|'weeks_free'|'months_free'|'years_free'|'percent_discount'
  value       int not null,
  description text,
  created_by  text not null default 'admin',
  expires_at  timestamptz,
  max_uses    int,
  used_count  int not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.promo_redemptions (
  id          uuid primary key default gen_random_uuid(),
  code        text not null,
  user_id     uuid references public.users(id) on delete cascade,
  username    text not null,
  redeemed_at timestamptz not null default now(),
  expires_at  timestamptz,
  type        text not null,
  value       int not null
);

-- ── Subscriptions / Payments ────────────────────────────────
create table if not exists public.subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.users(id) on delete cascade,
  provider_id  uuid references public.providers(id) on delete set null,
  plan         text not null,
  amount_usd   numeric(10,2) not null,
  coin         text,
  payment_id   text unique,
  status       text not null default 'pending', -- 'pending'|'confirmed'|'failed'|'expired'
  starts_at    timestamptz,
  expires_at   timestamptz,
  created_at   timestamptz not null default now(),
  paid_at      timestamptz
);

-- ── IPN Logs (payment webhooks) ─────────────────────────────
create table if not exists public.ipn_logs (
  id          uuid primary key default gen_random_uuid(),
  payment_id  text,
  status      text,
  raw_body    jsonb,
  verified    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ── Analytics Events ───────────────────────────────────────
create table if not exists public.analytics_events (
  id           bigserial primary key,
  type         text not null,
  page         text,
  session_id   text,
  visitor_id   text,
  user_id      uuid,
  provider_id  uuid,
  device       text,
  referrer     text,
  meta         jsonb,
  created_at   timestamptz not null default now()
);
create index if not exists analytics_events_type_idx on public.analytics_events(type);
create index if not exists analytics_events_created_idx on public.analytics_events(created_at);

-- ── Money Maker Daily Stats ─────────────────────────────────
create table if not exists public.mm_daily_stats (
  date                     date primary key,
  revenue_usd              numeric(10,2) not null default 0,
  new_users                int not null default 0,
  new_paid_users           int not null default 0,
  new_listings             int not null default 0,
  listings_bumped          int not null default 0,
  featured_ads_purchased   int not null default 0,
  sponsored_ads_purchased  int not null default 0,
  credits_addons_purchased int not null default 0,
  admin_note               text,
  updated_at               timestamptz not null default now()
);

create table if not exists public.mm_revenue_logs (
  id          uuid primary key default gen_random_uuid(),
  month       text not null,
  date        date not null,
  category    text not null,
  amount_usd  numeric(10,2) not null,
  description text,
  user_id     uuid,
  provider_id uuid,
  payment_id  text,
  added_by    text not null default 'system',
  note        text,
  created_at  timestamptz not null default now()
);

create table if not exists public.mm_settings (
  id           int primary key default 1 check (id = 1), -- singleton row
  monthly_goal numeric(10,2) not null default 6000,
  plan_prices  jsonb not null default '{}',
  updated_at   timestamptz not null default now()
);
insert into public.mm_settings (id) values (1) on conflict do nothing;

-- ── Moderation Logs ────────────────────────────────────────
create table if not exists public.moderation_logs (
  id             uuid primary key default gen_random_uuid(),
  admin_name     text not null,
  action         text not null,
  target_type    text not null,
  target_id      text not null,
  reason         text,
  previous_value text,
  new_value      text,
  notes          text,
  created_at     timestamptz not null default now()
);

-- ── Admin Audit Logs ───────────────────────────────────────
create table if not exists public.admin_audit_logs (
  id             uuid primary key default gen_random_uuid(),
  admin_name     text not null,
  action         text not null,
  resource       text not null,
  resource_id    text,
  previous_value text,
  new_value      text,
  ip_address     text,
  created_at     timestamptz not null default now()
);

-- ── Helper function: update updated_at ─────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create or replace trigger users_updated_at    before update on public.users    for each row execute procedure update_updated_at();
create or replace trigger providers_updated_at before update on public.providers for each row execute procedure update_updated_at();
