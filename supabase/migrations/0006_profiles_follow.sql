-- Public profiles (identity only, never learning progress) and following.
alter table public.profiles
  add column if not exists username text,
  add column if not exists headline text check (char_length(headline) <= 100),
  add column if not exists bio text check (char_length(bio) <= 300),
  add column if not exists avatar_choice text check (avatar_choice ~ '^(identicon|badge|mono):[a-z0-9]{1,16}$'),
  add column if not exists website text check (website ~ '^https://[^\s]{3,200}$'),
  add column if not exists github_user text check (github_user ~ '^[A-Za-z0-9-]{1,39}$'),
  add column if not exists linkedin_user text check (linkedin_user ~ '^[A-Za-z0-9-]{3,100}$');

create unique index if not exists profiles_username_key on public.profiles (lower(username));
alter table public.profiles drop constraint if exists profiles_username_format;
alter table public.profiles add constraint profiles_username_format check (username ~ '^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$');

-- Every account gets a username (name + 4 digits) that the learner can change later.
create or replace function public.ensure_username() returns trigger
language plpgsql set search_path = '' as $$
declare base text; candidate text; i int := 0;
begin
  if new.username is not null then return new; end if;
  base := left(trim(both '-' from regexp_replace(lower(coalesce(new.full_name, 'learner')), '[^a-z0-9]+', '-', 'g')), 20);
  if char_length(base) < 2 then base := 'learner'; end if;
  loop
    candidate := base || '-' || lpad((floor(random() * 10000))::int::text, 4, '0');
    exit when not exists (select 1 from public.profiles p where lower(p.username) = candidate) or i > 20;
    i := i + 1;
  end loop;
  new.username := candidate;
  return new;
end $$;
drop trigger if exists ensure_username on public.profiles;
create trigger ensure_username before insert or update on public.profiles
  for each row execute function public.ensure_username();
update public.profiles set username = null where username is null;

create table if not exists public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  followee_id uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);
create index if not exists follows_followee_idx on public.follows (followee_id);
alter table public.follows enable row level security;
create policy "see own follows" on public.follows for select
  using ((select auth.uid()) in (follower_id, followee_id));
create policy "follow as yourself" on public.follows for insert
  with check ((select auth.uid()) = follower_id);
create policy "unfollow as yourself" on public.follows for delete
  using ((select auth.uid()) = follower_id);

-- Only these identity fields are ever shown to other people. No XP, skills, scores or progress.
create or replace function public.public_profile(p_username text)
returns table (id uuid, username text, full_name text, headline text, bio text, avatar_url text, avatar_choice text,
               website text, github_user text, linkedin_user text, joined date, followers bigint, following bigint, i_follow boolean)
language sql stable security definer set search_path = '' as $$
  select p.id, p.username, p.full_name, p.headline, p.bio, p.avatar_url, p.avatar_choice, p.website, p.github_user, p.linkedin_user,
         p.created_at::date,
         (select count(*) from public.follows f where f.followee_id = p.id),
         (select count(*) from public.follows f where f.follower_id = p.id),
         exists (select 1 from public.follows f where f.follower_id = auth.uid() and f.followee_id = p.id)
  from public.profiles p
  where lower(p.username) = lower(p_username) and p.onboarded_at is not null
$$;

create or replace function public.search_people(p_query text, p_scope text default 'all', p_limit int default 30)
returns table (id uuid, username text, full_name text, headline text, avatar_url text, avatar_choice text, i_follow boolean)
language sql stable security definer set search_path = '' as $$
  select p.id, p.username, p.full_name, p.headline, p.avatar_url, p.avatar_choice,
         exists (select 1 from public.follows f where f.follower_id = auth.uid() and f.followee_id = p.id)
  from public.profiles p
  where auth.uid() is not null and p.onboarded_at is not null and p.id <> auth.uid()
    and (coalesce(p_query, '') = '' or p.full_name ilike '%' || p_query || '%' or p.username ilike '%' || p_query || '%' or p.headline ilike '%' || p_query || '%')
    and (p_scope = 'all'
      or (p_scope = 'following' and exists (select 1 from public.follows f where f.follower_id = auth.uid() and f.followee_id = p.id))
      or (p_scope = 'followers' and exists (select 1 from public.follows f where f.followee_id = auth.uid() and f.follower_id = p.id)))
  order by p.created_at desc
  limit least(greatest(p_limit, 1), 50)
$$;

revoke all on function public.public_profile(text) from public, anon;
revoke all on function public.search_people(text, text, int) from public, anon;
grant execute on function public.public_profile(text) to authenticated;
grant execute on function public.search_people(text, text, int) to authenticated;
