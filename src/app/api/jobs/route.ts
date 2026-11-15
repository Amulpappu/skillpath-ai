import { jobPostSchema } from "@/lib/jobs/board";
import { parseRequest } from "@/lib/request";
import { jsonError } from "@/lib/stream";
import { currentUser, supabaseServer } from "@/lib/supabase/server";

/** Post a job opening. */
export async function POST(request: Request): Promise<Response> {
  const parsed = await parseRequest(request, jobPostSchema, 10);
  if (!parsed.ok) return parsed.response;
  const user = await currentUser();
  if (!user) return jsonError("Please sign in first.", 401);
  const d = parsed.data;
  const { data, error } = await (await supabaseServer()).from("job_posts").insert({
    poster_id: user.id, title: d.title, company: d.company, location: d.location, work_mode: d.work_mode, job_type: d.job_type,
    description: d.description, skills: d.skills, apply_url: d.apply_url || null, apply_by: d.apply_by || null,
  }).select("id").single();
  if (error || !data) return jsonError("Could not post the job. Please check the fields.", 400);
  return Response.json({ id: data.id });
}
