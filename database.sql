-- PostgreSQL Database Schema for Academy OS Ω (Supabase Ready)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Define Enums
create type user_role as enum ('student', 'teacher', 'parent', 'admin', 'school');
create type school_type as enum ('sma', 'smk');

-- 1. Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null unique,
  avatar_url text,
  role user_role default 'student'::user_role not null,
  school_type school_type default 'sma'::school_type not null,
  grade integer default 10 not null, -- 10, 11, 12
  selected_pathway text default 'Umum' not null, -- e.g. 'IPA', 'IPS', 'RPL', 'TKJ', 'DKV'
  xp integer default 0 not null,
  level integer default 1 not null,
  streak integer default 0 not null,
  daily_goal_minutes integer default 45 not null,
  goals text[] default '{}'::text[] not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;

create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- 2. Curriculum Versions Table
create table public.curriculum_versions (
  id uuid default gen_random_uuid() primary key,
  version text not null unique,
  effective_date date not null,
  status text default 'active' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Subjects Table
create table public.subjects (
  id text primary key,
  title text not null,
  phase text not null, -- 'E' or 'F'
  school_type school_type not null,
  grade integer not null,
  cp_statement text not null,
  is_digital_skill boolean default false not null
);

-- 4. Modules Table
create table public.modules (
  id uuid default gen_random_uuid() primary key,
  subject_id text references public.subjects(id) on delete cascade not null,
  title text not null,
  sort_order integer default 0 not null
);

-- 5. Lessons Table
create table public.lessons (
  id uuid default gen_random_uuid() primary key,
  module_id uuid references public.modules(id) on delete cascade not null,
  title text not null,
  explanation text not null, -- Markdown
  visual_example text not null, -- Tables/Code blocks
  summary text not null,
  hots_questions jsonb not null, -- array of {question, options, correctIndex, explanation}
  practice_bank jsonb not null, -- array of {question, answer}
  sort_order integer default 0 not null
);

-- 6. Quizzes Table
create table public.quizzes (
  id uuid default gen_random_uuid() primary key,
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  question text not null,
  options text[] not null,
  correct_option_index integer not null,
  explanation text not null
);

-- 7. Flashcards Table
create table public.flashcards (
  id uuid default gen_random_uuid() primary key,
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  front text not null,
  back text not null
);

-- 8. Progress Table (Competency Evidence Tracking)
create table public.progress (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  completed boolean default false not null,
  score_percentage integer,
  completed_at timestamp with time zone,
  unique(profile_id, lesson_id)
);

alter table public.progress enable row level security;

create policy "Users can manage own progress" on public.progress
  for all using (auth.uid() = profile_id);

-- 9. PKL Internships Table (SMK)
create table public.internships (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  company_name text not null,
  mentor_name text not null,
  start_date date not null,
  end_date date,
  status text default 'ongoing' not null
);

alter table public.internships enable row level security;

create policy "Users can manage own internship" on public.internships
  for all using (auth.uid() = profile_id);

-- 10. Portfolio Projects Table (SMK)
create table public.portfolio_projects (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  project_url text,
  repository_url text,
  skills_used text[] default '{}'::text[] not null,
  grade_score integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.portfolio_projects enable row level security;

create policy "Users can manage own portfolio" on public.portfolio_projects
  for all using (auth.uid() = profile_id);
