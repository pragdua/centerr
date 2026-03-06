-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Habits template table
create table public.habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  emoji text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  frequency_type text not null default 'daily' check (frequency_type in ('daily', 'alternate', 'specific_days')),
  frequency_days integer[],
  frequency_start_date date,
  created_at timestamptz not null default now()
);

-- Daily completions table
create table public.completions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  date date not null default current_date,
  completed_at timestamptz not null default now()
);

-- One completion per habit per day per user
alter table public.completions
  add constraint completions_unique_per_day unique (user_id, habit_id, date);

-- Row Level Security
alter table public.habits enable row level security;
alter table public.completions enable row level security;

-- Habits policies
create policy "Users can view own habits"
  on public.habits for select using (auth.uid() = user_id);
create policy "Users can insert own habits"
  on public.habits for insert with check (auth.uid() = user_id);
create policy "Users can update own habits"
  on public.habits for update using (auth.uid() = user_id);
create policy "Users can delete own habits"
  on public.habits for delete using (auth.uid() = user_id);

-- Completions policies
create policy "Users can view own completions"
  on public.completions for select using (auth.uid() = user_id);
create policy "Users can insert own completions"
  on public.completions for insert with check (auth.uid() = user_id);
create policy "Users can delete own completions"
  on public.completions for delete using (auth.uid() = user_id);

-- Indexes
create index idx_habits_user_id on public.habits(user_id);
create index idx_completions_user_date on public.completions(user_id, date);
create index idx_completions_habit_date on public.completions(habit_id, date);
