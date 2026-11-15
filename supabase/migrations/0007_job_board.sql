-- Job board: anyone signed in can post an opening; others apply in-app with their profile and a note.
create table if not exists public.job_posts (
  id          uuid primary key default gen_random_uuid(),
  poster_id   uuid not null references public.profiles (id) on delete cascade,
  title       text not null check (char_length(title) between 3 and 120),
  company     text not null check (char_length(company) between 1 and 120),
  location    text not null check (char_length(location) between 1 and 120),
  work_mode   text not null check (work_mode in ('onsite','remote','hybrid')),
  job_type    text not null check (job_type in ('full-time','internship','part-time','contract')),
  description text not null check (char_length(description) between 20 and 4000),
  skills      text[] not null default '{}' check (cardinality(skills) <= 10),
  apply_url   text check (apply_url ~ '^https://[^\s]{3,300}$'),
  apply_by    date,
  status      text not null default 'open' check (status in ('open','closed')),
  created_at  timestamptz not null default now()
);
create index if not exists job_posts_open_idx on public.job_posts (status, created_at desc);
create index if not exists job_posts_poster_idx on public.job_posts (poster_id);

create table if not exists public.job_applications (
  id            uuid primary key default gen_random_uuid(),
  job_id        uuid not null references public.job_posts (id) on delete cascade,
  applicant_id  uuid not null references public.profiles (id) on delete cascade,
  note          text not null check (char_length(note) between 10 and 1000),
  contact_email text not null check (contact_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(contact_email) <= 200),
  resume_url    text check (resume_url ~ '^https://[^\s]{3,300}$'),
  status        text not null default 'applied' check (status in ('applied','shortlisted','rejected')),
  created_at    timestamptz not null default now(),
  unique (job_id, applicant_id)
);
create index if not exists job_applications_applicant_idx on public.job_applications (applicant_id);

alter table public.job_posts enable row level security;
alter table public.job_applications enable row level security;

create policy "read open or own posts" on public.job_posts for select to authenticated
  using (status = 'open' or poster_id = (select auth.uid()));
create policy "post as yourself" on public.job_posts for insert to authenticated
  with check (poster_id = (select auth.uid()));
create policy "edit own posts" on public.job_posts for update to authenticated
  using (poster_id = (select auth.uid())) with check (poster_id = (select auth.uid()));
create policy "delete own posts" on public.job_posts for delete to authenticated
  using (poster_id = (select auth.uid()));

-- Applicants see their own applications; the poster reads them through job_applicants() below.
create policy "read own applications" on public.job_applications for select to authenticated
  using (applicant_id = (select auth.uid()));
create policy "apply as yourself to open jobs" on public.job_applications for insert to authenticated
  with check (
    applicant_id = (select auth.uid())
    and status = 'applied'
    and exists (select 1 from public.job_posts j where j.id = job_id and j.status = 'open' and j.poster_id <> (select auth.uid()))
  );
create policy "withdraw own application" on public.job_applications for delete to authenticated
  using (applicant_id = (select auth.uid()));

-- The poster's view of applicants: identity + what the applicant chose to send. No progress or scores.
create or replace function public.job_applicants(p_job uuid)
returns table (id uuid, applicant_id uuid, username text, full_name text, headline text, avatar_url text, avatar_choice text,
               note text, contact_email text, resume_url text, status text, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select a.id, a.applicant_id, p.username, p.full_name, p.headline, p.avatar_url, p.avatar_choice,
         a.note, a.contact_email, a.resume_url, a.status, a.created_at
  from public.job_applications a
  join public.job_posts j on j.id = a.job_id
  join public.profiles p on p.id = a.applicant_id
  where a.job_id = p_job and j.poster_id = auth.uid()
  order by a.created_at
$$;

create or replace function public.set_application_status(p_application uuid, p_status text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_status not in ('applied','shortlisted','rejected') then raise exception 'bad status'; end if;
  update public.job_applications a set status = p_status
  where a.id = p_application
    and exists (select 1 from public.job_posts j where j.id = a.job_id and j.poster_id = auth.uid());
  if not found then raise exception 'not allowed'; end if;
end $$;

-- Who posted a job (identity only) plus how many applied, for the board.
create or replace function public.job_board(p_query text default '', p_limit int default 50)
returns table (id uuid, title text, company text, location text, work_mode text, job_type text, skills text[], apply_by date, created_at timestamptz,
               poster_username text, poster_name text, applicants bigint, i_applied boolean, mine boolean)
language sql stable security definer set search_path = '' as $$
  select j.id, j.title, j.company, j.location, j.work_mode, j.job_type, j.skills, j.apply_by, j.created_at,
         p.username, p.full_name,
         (select count(*) from public.job_applications a where a.job_id = j.id),
         exists (select 1 from public.job_applications a where a.job_id = j.id and a.applicant_id = auth.uid()),
         j.poster_id = auth.uid()
  from public.job_posts j join public.profiles p on p.id = j.poster_id
  where auth.uid() is not null and j.status = 'open'
    and (coalesce(p_query, '') = '' or j.title ilike '%' || p_query || '%' or j.company ilike '%' || p_query || '%'
         or j.location ilike '%' || p_query || '%' or array_to_string(j.skills, ' ') ilike '%' || p_query || '%')
  order by j.created_at desc
  limit least(greatest(p_limit, 1), 100)
$$;

revoke all on function public.job_applicants(uuid) from public, anon;
revoke all on function public.set_application_status(uuid, text) from public, anon;
revoke all on function public.job_board(text, int) from public, anon;
grant execute on function public.job_applicants(uuid) to authenticated;
grant execute on function public.set_application_status(uuid, text) to authenticated;
grant execute on function public.job_board(text, int) to authenticated;
