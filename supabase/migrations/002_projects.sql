-- Projects table
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  public_id text not null unique,
  logo_url text,
  primary_color text not null default '#6366f1',
  widget_style text not null default 'carousel'
    check (widget_style in ('carousel', 'grid', 'wall', 'minimal')),
  thank_you_message text not null default 'Thank you for your feedback!',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index idx_projects_user_id on public.projects(user_id);
create unique index idx_projects_public_id on public.projects(public_id);

-- RLS
alter table public.projects enable row level security;

create policy "Users can view own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can create own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);
