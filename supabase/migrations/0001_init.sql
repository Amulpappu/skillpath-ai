-- SkillPath AI v2 — initial schema.
-- Every user-owned table has row-level security: a signed-in user can read and write only their own rows.
-- The shared question bank is read and written only by the server (service role), so answers stay secret.

create extension if not exists "pgcrypto";

-- ---------- profiles ----------
create table public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  full_name       text,
  avatar_url      text,
  country         text,                        -- ISO 3166-1 alpha-2, used for jobs and courses
  ui_language     text not null default 'en',  -- interface language code
  target_role     text,
  dream_companies text[] not null default '{}',
  interests       text[] not null default '{}',
  weekly_hours    int  not null default 8 check (weekly_hours between 1 and 80),
  learning_pace   numeric(4,2) not null default 1.00,  -- 1.0 = average; set by the Progress Tracker from real results
  leetcode_handle text,
  gfg_handle      text,
  codechef_handle text,
  hackerrank_handle text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- create a profile row automatically for every new account (Google, GitHub or Microsoft)
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id,
          coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
          new.raw_user_meta_data ->> 'avatar_url');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- skills the user has ----------
create table public.user_skills (
  user_id    uuid not null references auth.users (id) on delete cascade,
  skill      text not null,
  level      text not null check (level in ('beginner','intermediate','advanced')),
  mastery    numeric(5,2) not null default 0,   -- 0–100, from quiz results
  source     text not null default 'self' check (source in ('self','quiz','practice')),
  updated_at timestamptz not null default now(),
  primary key (user_id, skill)
);

-- ---------- roadmap ----------
create table public.roadmap_steps (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  position   int  not null,
  week       int  not null,
  skill      text not null,
  goal       text not null,
  kind       text not null default 'learn' check (kind in ('learn','revision','practice','company-prep')),
  status     text not null default 'todo' check (status in ('todo','doing','done','skipped')),
  resources  jsonb not null default '[]',
  created_by text not null,                    -- which agent added it
  created_at timestamptz not null default now(),
  done_at    timestamptz
);
create index on public.roadmap_steps (user_id, position);

-- ---------- shared question bank (filled by the Question Smith agent) ----------
create table public.questions (
  id            uuid primary key default gen_random_uuid(),
  skill         text not null,
  level         text not null check (level in ('beginner','intermediate','advanced')),
  category      text not null default 'skill' check (category in ('skill','aptitude','english','problem-understanding')),
  company       text,                           -- set for company-pattern questions
  prompt        text not null,
  options       jsonb not null,                 -- array of 4 strings
  answer_index  int  not null check (answer_index between 0 and 3),
  explanation   text not null,
  fingerprint   text not null unique,           -- normalised prompt hash, blocks duplicates
  status        text not null default 'live' check (status in ('live','flagged','retired')),
  created_by    text not null default 'question-smith',
  created_at    timestamptz not null default now()
);
create index on public.questions (skill, level, status);
create index on public.questions (category, company);

-- ---------- quiz attempts ----------
create table public.quiz_attempts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  skill       text not null,
  level       text not null,
  category    text not null default 'skill',
  company     text,
  question_ids uuid[] not null,
  answers     int[] not null,
  score       numeric(5,2) not null,
  seconds     int,
  created_at  timestamptz not null default now()
);
create index on public.quiz_attempts (user_id, created_at desc);

-- ---------- coding practice ladder progress ----------
create table public.practice_progress (
  user_id    uuid not null references auth.users (id) on delete cascade,
  problem_id text not null,                     -- id from the practice catalogue in code
  status     text not null check (status in ('todo','attempted','solved','skipped')),
  updated_at timestamptz not null default now(),
  primary key (user_id, problem_id)
);

-- ---------- agent activity (the professional timeline) ----------
create table public.agent_runs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  agent      text not null,
  action     text not null,
  detail     text not null,
  source     text not null default 'gemini' check (source in ('gemini','rule-engine')),
  ms         int,
  created_at timestamptz not null default now()
);
create index on public.agent_runs (user_id, created_at desc);

-- ---------- saved jobs ----------
create table public.saved_jobs (
  user_id    uuid not null references auth.users (id) on delete cascade,
  job_id     text not null,
  payload    jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, job_id)
);

-- ---------- row-level security ----------
alter table public.profiles          enable row level security;
alter table public.user_skills       enable row level security;
alter table public.roadmap_steps     enable row level security;
alter table public.questions         enable row level security;
alter table public.quiz_attempts     enable row level security;
alter table public.practice_progress enable row level security;
alter table public.agent_runs        enable row level security;
alter table public.saved_jobs        enable row level security;

create policy "own profile" on public.profiles for all
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "own rows" on public.user_skills       for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own rows" on public.roadmap_steps     for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own rows" on public.quiz_attempts     for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own rows" on public.practice_progress for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own rows" on public.saved_jobs        for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "read own activity" on public.agent_runs for select using ((select auth.uid()) = user_id);

-- questions: no policy on purpose. Only the server (service role) reads them, so answer keys never reach the browser.
