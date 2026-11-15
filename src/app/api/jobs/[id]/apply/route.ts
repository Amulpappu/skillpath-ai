import { applicationSchema } from "@/lib/jobs/board";
import { parseRequest } from "@/lib/request";
import { jsonError } from "@/lib/stream";
import { currentUser, supabaseServer } from "@/lib/supabase/server";

/** Apply to an open job with a note, contact email and an optional résumé link. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await params;
  const parsed = await parseRequest(request, applicationSchema, 10);
  if (!parsed.ok) return parsed.response;
  const user = await currentUser();
  if (!user) return jsonError("Please sign in first.", 401);
  const d = parsed.data;
  const { error } = await (await supabaseServer()).from("job_applications").insert({
    job_id: id, applicant_id: user.id, note: d.note, contact_email: d.contact_email, resume_url: d.resume_url || null,
  });
  if (error?.code === "23505") return jsonError("You have already applied to this job.", 409);
  if (error) return jsonError("Could not apply. The job may be closed, or it is your own post.", 400);
  return Response.json({ ok: true });
}

/** Withdraw your application. */
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await params;
  const user = await currentUser();
  if (!user) return jsonError("Please sign in first.", 401);
  const { error } = await (await supabaseServer()).from("job_applications").delete().eq("job_id", id).eq("applicant_id", user.id);
  if (error) return jsonError("Could not withdraw.", 400);
  return Response.json({ ok: true });
}
