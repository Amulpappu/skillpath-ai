-- Random questions for a quiz, skipping ones the learner has already seen. Server-only.
-- Returns no answer key: grading happens in the API against public.questions.
create function public.pick_questions(p_skill text, p_level text, p_category text, p_company text, p_n int, p_exclude uuid[])
returns table (id uuid, prompt text, options jsonb, topic text)
language sql volatile set search_path = '' as $$
  select q.id, q.prompt, q.options, q.topic
  from public.questions q
  where q.status = 'live' and q.skill = p_skill and q.level = p_level and q.category = p_category
    and (q.company is not distinct from p_company)
    and not (q.id = any (coalesce(p_exclude, '{}')))
  order by random()
  limit greatest(1, least(p_n, 30))
$$;
revoke execute on function public.pick_questions(text, text, text, text, int, uuid[]) from public, anon, authenticated;
grant execute on function public.pick_questions(text, text, text, text, int, uuid[]) to service_role;
