import { z } from "zod";
import { parseRequest } from "@/lib/request";
import { jsonError } from "@/lib/stream";
import { currentUser, supabaseServer } from "@/lib/supabase/server";

const schema = z.object({ status: z.enum(["applied", "shortlisted", "rejected"]) });

/** The poster marks an applicant as shortlisted or not selected. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await params;
  const parsed = await parseRequest(request, schema, 60);
  if (!parsed.ok) return parsed.response;
  if (!(await currentUser())) return jsonError("Please sign in first.", 401);
  const { error } = await (await supabaseServer()).rpc("set_application_status", { p_application: id, p_status: parsed.data.status });
  if (error) return jsonError("Could not update.", 403);
  return Response.json({ ok: true });
}
