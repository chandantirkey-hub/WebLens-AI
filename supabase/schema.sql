create table if not exists public.scraped_pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  url text not null,
  title text not null,
  description text,
  content text,
  headings jsonb not null default '[]'::jsonb,
  links jsonb not null default '[]'::jsonb,
  summary text,
  key_points jsonb not null default '[]'::jsonb,
  key_topics jsonb not null default '[]'::jsonb,
  target_audience text,
  products_services jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.scraped_pages enable row level security;

create policy "Users can view their own research"
  on public.scraped_pages for select
  using (auth.uid() = user_id);

create policy "Users can save their own research"
  on public.scraped_pages for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own research"
  on public.scraped_pages for delete
  using (auth.uid() = user_id);
