import { z } from "zod";
import { parseRequest } from "@/lib/request";
import { jsonError } from "@/lib/stream";
import { currentUser, supabaseServer } from "@/lib/supabase/server";

const statusSchema = z.object({ status: z.enum(["open", "closed"]) });

/** Open or close your own post (row-level security blocks anyone else). */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await params;
  const parsed = await parseRequest(request, statusSchema, 30);
  if (!parsed.ok) return parsed.response;
  const user = await currentUser();
  if (!user) return jsonError("Please sign in first.", 401);
  const { data, error } = await (await supabaseServer()).from("job_posts").update({ status: parsed.data.status }).eq("id", id).eq("poster_id", user.id).select("id");
  if (error || !data?.length) return jsonError("Could not update this post.", 403);
  return Response.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await params;
  const user = await currentUser();
  if (!user) return jsonError("Please sign in first.", 401);
  const { data, error } = await (await supabaseServer()).from("job_posts").delete().eq("id", id).eq("poster_id", user.id).select("id");
  if (error || !data?.length) return jsonError("Could not delete this post.", 403);
  return Response.json({ ok: true });
}
