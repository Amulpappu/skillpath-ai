-- Onboarding: basic info, a short tour and private experience points (XP).
alter table public.profiles
  add column if not exists onboarded_at timestamptz,
  add column if not exists xp int not null default 0 check (xp >= 0),
  add column if not exists learner_status text check (learner_status in ('student','fresher','working','switching')),
  add column if not exists institution text check (char_length(institution) <= 120),
  add column if not exists grad_year int check (grad_year between 1980 and 2040);

-- Learners may edit their own profile, but XP and onboarding state only change through the functions below.
create or replace function public.protect_profile_progress() returns trigger
language plpgsql set search_path = '' as $$
begin
  if current_user in ('authenticated', 'anon') then
    new.xp := old.xp;
    new.onboarded_at := old.onboarded_at;
  end if;
  return new;
end $$;
drop trigger if exists protect_profile_progress on public.profiles;
create trigger protect_profile_progress before update on public.profiles
  for each row execute function public.protect_profile_progress();

-- Finishes onboarding once: saves the basics and awards 100 XP.
create or replace function public.complete_onboarding(
  p_full_name text, p_status text, p_institution text, p_grad_year int, p_country text,
  p_target_role text, p_weekly_hours int, p_interests text[], p_dream_companies text[]
) returns int
language plpgsql security definer set search_path = '' as $$
declare v_xp int;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  update public.profiles set
    full_name = left(nullif(trim(p_full_name), ''), 80),
    learner_status = p_status,
    institution = left(nullif(trim(p_institution), ''), 120),
    grad_year = p_grad_year,
    country = nullif(p_country, ''),
    target_role = nullif(p_target_role, ''),
    weekly_hours = greatest(1, least(80, p_weekly_hours)),
    interests = coalesce(p_interests[1:10], '{}'),
    dream_companies = coalesce(p_dream_companies[1:5], '{}'),
    xp = case when onboarded_at is null then xp + 100 else xp end,
    onboarded_at = coalesce(onboarded_at, now()),
    updated_at = now()
  where id = auth.uid()
  returning xp into v_xp;
  return v_xp;
end $$;
revoke all on function public.complete_onboarding(text,text,text,int,text,text,int,text[],text[]) from public, anon;
grant execute on function public.complete_onboarding(text,text,text,int,text,text,int,text[],text[]) to authenticated;
