-- ========================================================================
-- STUDIO PRO - SUPABASE DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- Siap dieksekusi di SQL Editor Dashboard Supabase (Web Supabase)
-- ========================================================================

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. User Profiles Table (Terhubung otomatis dengan Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  tier text default 'PRO' check (tier in ('FREE', 'PRO', 'CREATOR')),
  credit_balance integer default 500,
  gemini_api_key text, -- Opsional, jika pengguna membawa API key sendiri
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Aktifkan Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Policy Profiles: Pengguna hanya dapat membaca dan mengubah profil miliknya sendiri
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger otomatis membuat profile ketika ada pengguna baru mendaftar di auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, tier, credit_balance)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://ui-avatars.com/api/?name=' || urlencode(coalesce(new.raw_user_meta_data->>'full_name', new.email))),
    'PRO',
    500
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger binding
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Connected Accounts Table (Menyimpan sesi Flow, Midjourney, Canva dsb.)
create table if not exists public.connected_accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  account_name text not null,
  tier text default 'PRO',
  credits_remaining integer default 280,
  session_token text,
  is_active boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.connected_accounts enable row level security;

create policy "Users can manage own connected accounts"
  on public.connected_accounts for all
  using (auth.uid() = user_id);

-- 4. Storyboards Table (Penyimpanan Rangkaian Scene AI yang Dibuat)
create table if not exists public.storyboards (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  prompt text not null,
  content_type text default 'film_pendek',
  aspect_ratio text default '9:16',
  scenes jsonb not null, -- Menyimpan array Scene [{number, title, visual, camera, voiceover, prompt}]
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.storyboards enable row level security;

create policy "Users can view and manage own storyboards"
  on public.storyboards for all
  using (auth.uid() = user_id or user_id is null);

-- 5. Microtools Execution History (Audit Log Pemanfaatan AI)
create table if not exists public.microtools_log (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  tool_name text not null,
  input_data text not null,
  output_data text not null,
  model_used text default 'gemini-3.8-flash',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.microtools_log enable row level security;

create policy "Users can view own logs"
  on public.microtools_log for select
  using (auth.uid() = user_id);
