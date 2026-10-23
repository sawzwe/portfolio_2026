-- =============================================================
-- Portfolio CMS schema
-- Run this in the Supabase dashboard → SQL Editor (or via the CLI).
-- =============================================================

-- ---------- SITE (single-row settings) ----------
create table if not exists public.site (
  id            int primary key default 1,
  name          text not null default '',
  role          text not null default '',
  location      text not null default '',
  availability  text not null default '',
  education     text not null default '',
  intro         text not null default '',
  focus         text not null default '',
  email         text not null default '',
  linkedin      text not null default '',
  cv            text not null default '',
  updated_at    timestamptz not null default now(),
  -- enforce exactly one row
  constraint site_singleton check (id = 1)
);

-- ---------- PROJECTS ----------
create table if not exists public.projects (
  id          text primary key,               -- url slug, e.g. "easydeal"
  title       text not null,
  year        text not null default '',
  cats        text[] not null default '{}',
  "group"     text not null default 'dev',    -- 'dev' | 'data' | 'seo'
  role        text not null default '',
  stack       text not null default '',
  tint        text not null default '#f0f0ec',
  ph          text not null default '',        -- placeholder caption
  w           int  not null default 360,
  h           int  not null default 320,
  off         int  not null default 0,
  descr       text not null default '',        -- 'desc' is reserved-ish; use descr
  points      text[] not null default '{}',
  hero_image  text,                            -- storage public URL
  detail_images text[] not null default '{}',
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists projects_sort_idx on public.projects (sort_order, year desc);

-- ---------- TIMELINE ----------
create table if not exists public.timeline (
  id          uuid primary key default gen_random_uuid(),
  year        text not null default '',
  title       text not null default '',
  text        text not null default '',
  dot         text not null default '#111',
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists timeline_sort_idx on public.timeline (sort_order);

-- ---------- updated_at trigger ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_site_updated on public.site;
create trigger trg_site_updated before update on public.site
  for each row execute function public.set_updated_at();

drop trigger if exists trg_projects_updated on public.projects;
create trigger trg_projects_updated before update on public.projects
  for each row execute function public.set_updated_at();

-- =============================================================
-- Row Level Security
--   Public (anon) can READ everything.
--   Only authenticated users (you) can WRITE.
-- =============================================================
alter table public.site     enable row level security;
alter table public.projects enable row level security;
alter table public.timeline enable row level security;

-- SITE
drop policy if exists "site read"  on public.site;
drop policy if exists "site write" on public.site;
create policy "site read"  on public.site for select using (true);
create policy "site write" on public.site for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- PROJECTS
drop policy if exists "projects read"  on public.projects;
drop policy if exists "projects write" on public.projects;
create policy "projects read"  on public.projects for select using (true);
create policy "projects write" on public.projects for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- TIMELINE
drop policy if exists "timeline read"  on public.timeline;
drop policy if exists "timeline write" on public.timeline;
create policy "timeline read"  on public.timeline for select using (true);
create policy "timeline write" on public.timeline for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- =============================================================
-- Storage bucket for project images (public read, auth write)
-- =============================================================
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

drop policy if exists "project-images read"   on storage.objects;
drop policy if exists "project-images write"  on storage.objects;
drop policy if exists "project-images update" on storage.objects;
drop policy if exists "project-images delete" on storage.objects;

create policy "project-images read" on storage.objects
  for select using (bucket_id = 'project-images');

create policy "project-images write" on storage.objects
  for insert with check (
    bucket_id = 'project-images' and auth.role() = 'authenticated'
  );

create policy "project-images update" on storage.objects
  for update using (
    bucket_id = 'project-images' and auth.role() = 'authenticated'
  );

create policy "project-images delete" on storage.objects
  for delete using (
    bucket_id = 'project-images' and auth.role() = 'authenticated'
  );
