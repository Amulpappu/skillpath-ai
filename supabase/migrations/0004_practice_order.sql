-- Learner's own order of practice topics (Practice Coach).
alter table public.profiles add column practice_order text[] not null default '{}';
