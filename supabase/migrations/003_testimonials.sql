-- Testimonials table
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  customer_name text not null,
  customer_email text,
  customer_avatar_url text,
  rating integer not null check (rating >= 1 and rating <= 5),
  text text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

-- Index
create index idx_testimonials_project_id on public.testimonials(project_id);

-- RLS
alter table public.testimonials enable row level security;

-- Anyone can submit a testimonial (anonymous insert)
create policy "Anyone can submit testimonials"
  on public.testimonials for insert
  with check (true);

-- Project owner can see all testimonials for their projects
create policy "Project owners can view all testimonials"
  on public.testimonials for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = testimonials.project_id
        and projects.user_id = auth.uid()
    )
  );

-- Anyone can view approved testimonials (for embed widget)
create policy "Anyone can view approved testimonials"
  on public.testimonials for select
  using (status = 'approved');

-- Only project owner can update testimonials
create policy "Project owners can update testimonials"
  on public.testimonials for update
  using (
    exists (
      select 1 from public.projects
      where projects.id = testimonials.project_id
        and projects.user_id = auth.uid()
    )
  );

-- Only project owner can delete testimonials
create policy "Project owners can delete testimonials"
  on public.testimonials for delete
  using (
    exists (
      select 1 from public.projects
      where projects.id = testimonials.project_id
        and projects.user_id = auth.uid()
    )
  );
