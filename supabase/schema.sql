-- Optional profile details captured at sign-up. Only the auth.users email is mandatory;
-- every column below is nullable so registration never requires more than an email + password.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  mobile text,
  address text,
  pincode text,
  state text,
  country text,
  trial_remaining int not null default 5,
  daily_analysis_date date,
  daily_analysis_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row (with the free 5-analysis registered trial) whenever a new
-- auth user is created, pulling any optional details passed as sign-up metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, mobile, address, pincode, state, country)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'mobile',
    new.raw_user_meta_data ->> 'address',
    new.raw_user_meta_data ->> 'pincode',
    new.raw_user_meta_data ->> 'state',
    new.raw_user_meta_data ->> 'country'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

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
