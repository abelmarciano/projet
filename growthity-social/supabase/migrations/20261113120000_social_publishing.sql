-- Réseaux sociaux (Zernio) : profil Zernio par marque, comptes connectés, publications planifiées.
-- Cloisonnement : un membre du workspace voit et modifie les données des marques de son workspace.

create table if not exists public.social_profiles (
  brand_id uuid primary key references public.brands(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  zernio_profile_id text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  zernio_account_id text not null unique,
  platform text not null,               -- instagram, facebook, tiktok, linkedin, youtube, pinterest…
  username text,
  display_name text,
  avatar_url text,
  status text not null default 'connected' check (status in ('connected', 'disconnected')),
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists social_accounts_brand_idx on public.social_accounts(brand_id);

create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  ad_id uuid references public.ads(id) on delete set null,   -- création Growthity d'origine (facultatif)
  media_url text,                                              -- fichier publié (vidéo ou image)
  media_kind text check (media_kind in ('video', 'image')),
  thumb_url text,
  caption text not null default '',
  account_ids text[] not null default '{}',                   -- zernio_account_id ciblés
  scheduled_at timestamptz,
  timezone text not null default 'Europe/Paris',
  status text not null default 'draft'
    check (status in ('idea', 'draft', 'scheduled', 'publishing', 'published', 'partial', 'failed')),
  zernio_post_id text,
  results jsonb not null default '[]'::jsonb,                 -- [{platform, status, url, error}]
  error text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists social_posts_brand_date_idx on public.social_posts(brand_id, scheduled_at);

alter table public.social_profiles enable row level security;
alter table public.social_accounts enable row level security;
alter table public.social_posts enable row level security;

-- Membre du workspace = accès complet aux données sociales des marques du workspace.
do $$
declare t text;
begin
  foreach t in array array['social_profiles', 'social_accounts', 'social_posts'] loop
    execute format('drop policy if exists %I on public.%I', t || '_members', t);
    execute format($p$
      create policy %I on public.%I for all to authenticated
      using (exists (select 1 from public.workspace_members m where m.workspace_id = %I.workspace_id and m.user_id = auth.uid()))
      with check (exists (select 1 from public.workspace_members m where m.workspace_id = %I.workspace_id and m.user_id = auth.uid()))
    $p$, t || '_members', t, t, t);
  end loop;
end $$;
