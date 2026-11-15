import { gradeQuiz } from "@/lib/bank/store";
import { gradeSchema } from "@/lib/bank/schemas";
import { parseRequest } from "@/lib/request";
import { jsonError } from "@/lib/stream";
import { currentUser, supabaseAdmin } from "@/lib/supabase/server";

/** POST answers; the server grades them against stored keys and saves the attempt for signed-in users. */
export async function POST(request: Request): Promise<Response> {
  const parsed = await parseRequest(request, gradeSchema, 30);
  if (!parsed.ok) return parsed.response;
  const db = supabaseAdmin();
  if (!db) return jsonError("The question bank is not configured on this server.", 503);
  try {
    const user = await currentUser();
    const result = await gradeQuiz(db, { userId: user?.id ?? null, ...parsed.data });
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("bank grade failed", e);
    return jsonError("Could not grade the quiz. Please try again.", 500);
  }
}
