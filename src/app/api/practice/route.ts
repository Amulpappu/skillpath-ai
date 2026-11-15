import { z } from "zod";
import { ALL_PROBLEMS, LADDER } from "@/lib/practice/catalog";
import { parseRequest } from "@/lib/request";
import { jsonError } from "@/lib/stream";
import { currentUser, supabaseServer } from "@/lib/supabase/server";

const problemIds = new Set(ALL_PROBLEMS.map((p) => p.id));
const topicIds = LADDER.map((t) => t.id);

const bodySchema = z.union([
  z.object({ problemId: z.string().refine((id) => problemIds.has(id)), status: z.enum(["todo", "solved", "skipped"]) }),
  z.object({ order: z.array(z.string().refine((id) => topicIds.includes(id))).max(topicIds.length) }),
]);

/** The signed-in learner's practice statuses and topic order (row-level security limits it to their rows). */
export async function GET(): Promise<Response> {
  const user = await currentUser();
  if (!user) return jsonError("Sign in to sync practice progress.", 401);
  const db = await supabaseServer();
  const [{ data: rows }, { data: profile }] = await Promise.all([
    db.from("practice_progress").select("problem_id, status"),
    db.from("profiles").select("practice_order, weekly_hours, learning_pace").eq("id", user.id).single(),
  ]);
  return Response.json({
    status: Object.fromEntries((rows ?? []).map((r) => [r.problem_id, r.status])),
    order: profile?.practice_order ?? [], weeklyHours: profile?.weekly_hours ?? 8, pace: Number(profile?.learning_pace ?? 1),
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseRequest(request, bodySchema, 60);
  if (!parsed.ok) return parsed.response;
  const user = await currentUser();
  if (!user) return jsonError("Sign in to sync practice progress.", 401);
  const db = await supabaseServer();
  const body = parsed.data;
  const { error } = "order" in body
    ? await db.from("profiles").update({ practice_order: body.order, updated_at: new Date().toISOString() }).eq("id", user.id)
    : await db.from("practice_progress").upsert({ user_id: user.id, problem_id: body.problemId, status: body.status, updated_at: new Date().toISOString() });
  if (error) return jsonError("Could not save. Please try again.", 500);
  return Response.json({ ok: true });
}
