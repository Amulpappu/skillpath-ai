import { serveQuiz } from "@/lib/bank/store";
import { quizQuerySchema } from "@/lib/bank/schemas";
import { allowRequest, clientKey } from "@/lib/rateLimit";
import { jsonError } from "@/lib/stream";
import { currentUser, supabaseAdmin } from "@/lib/supabase/server";

/** GET a quiz from the shared bank. Answer keys never leave the server. */
export async function GET(request: Request): Promise<Response> {
  if (!allowRequest(clientKey(request), 30)) return jsonError("Too many requests. Please wait a minute.", 429);
  const parsed = quizQuerySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return jsonError("Invalid quiz request.", 400);
  const db = supabaseAdmin();
  if (!db) return jsonError("The question bank is not configured on this server.", 503);
  try {
    const user = await currentUser();
    const questions = await serveQuiz(db, { userId: user?.id ?? null, ...parsed.data });
    if (questions.length === 0) return jsonError("No questions for this skill yet. The Question Smith is still building it.", 404);
    return Response.json({ questions, source: "bank" }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("bank quiz failed", e);
    return jsonError("Could not load the quiz. Please try again.", 500);
  }
}
