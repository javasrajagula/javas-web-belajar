-- PostgreSQL Database Initialization Script
-- Target Target: Supabase / standard PostgreSQL database engine.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null unique,
  avatar_url text,
  xp integer default 0 not null,
  level integer default 1 not null,
  streak integer default 0 not null,
  daily_goal_minutes integer default 45 not null,
  last_active timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- 2. Materials table
create table public.materials (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  file_name text not null,
  file_type text not null,
  file_size text not null,
  content text not null,
  summary text not null,
  uploaded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.materials enable row level security;

create policy "Users can manage own materials" on public.materials
  for all using (auth.uid() = profile_id);

-- 3. Quizzes table
create table public.quizzes (
  id uuid default gen_random_uuid() primary key,
  material_id uuid references public.materials(id) on delete cascade not null,
  question text not null,
  options text[] not null,
  correct_option_index integer not null,
  explanation text not null
);

alter table public.quizzes enable row level security;

create policy "Users can read own quizzes" on public.quizzes
  for select using (
    exists (
      select 1 from public.materials m
      where m.id = quizzes.material_id and m.profile_id = auth.uid()
    )
  );

-- 4. Flashcards table
create table public.flashcards (
  id uuid default gen_random_uuid() primary key,
  material_id uuid references public.materials(id) on delete cascade not null,
  front text not null,
  back text not null,
  mastered boolean default false not null
);

alter table public.flashcards enable row level security;

create policy "Users can manage own flashcards" on public.flashcards
  for all using (
    exists (
      select 1 from public.materials m
      where m.id = flashcards.material_id and m.profile_id = auth.uid()
    )
  );

-- 5. Timeline Events table
create table public.timeline_events (
  id uuid default gen_random_uuid() primary key,
  material_id uuid references public.materials(id) on delete cascade not null,
  event_date text not null,
  title text not null,
  description text not null
);

alter table public.timeline_events enable row level security;

create policy "Users can read own timeline events" on public.timeline_events
  for select using (
    exists (
      select 1 from public.materials m
      where m.id = timeline_events.material_id and m.profile_id = auth.uid()
    )
  );

-- 6. Tasks table
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  task_date date not null,
  duration_minutes integer not null,
  completed boolean default false not null,
  category text not null,
  topic text not null
);

alter table public.tasks enable row level security;

create policy "Users can manage own tasks" on public.tasks
  for all using (auth.uid() = profile_id);

-- 7. Exam Sessions table
create table public.exam_sessions (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  topics text[] not null,
  total_questions integer not null,
  score integer not null,
  duration_seconds integer not null,
  accuracy integer not null,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

alter table public.exam_sessions enable row level security;

create policy "Users can manage own exam sessions" on public.exam_sessions
  for all using (auth.uid() = profile_id);
