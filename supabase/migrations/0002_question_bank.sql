-- Question bank support: a per-skill syllabus the Question Smith works through, and fast counts.
-- Server-only (service role): RLS on, no policies.

create table public.bank_topics (
  skill      text not null,
  level      text not null check (level in ('beginner','intermediate','advanced')),
  category   text not null default 'skill',
  topic      text not null,
  generated  int  not null default 0,          -- how many accepted questions came from this topic
  created_at timestamptz not null default now(),
  primary key (skill, level, category, topic)
);
alter table public.bank_topics enable row level security;

alter table public.questions add column topic text;
alter table public.questions add column verified boolean not null default false;  -- passed the blind second-answer check

create function public.bank_counts()
returns table (skill text, level text, category text, n bigint)
language sql stable set search_path = '' as $$
  select q.skill, q.level, q.category, count(*)::bigint
  from public.questions q where q.status = 'live'
  group by q.skill, q.level, q.category
$$;
revoke execute on function public.bank_counts() from public, anon, authenticated;
grant execute on function public.bank_counts() to service_role;
