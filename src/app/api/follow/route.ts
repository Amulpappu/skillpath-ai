import { z } from "zod";
import { parseRequest } from "@/lib/request";
import { jsonError } from "@/lib/stream";
import { currentUser, supabaseServer } from "@/lib/supabase/server";

const followSchema = z.object({ user_id: z.string().uuid(), follow: z.boolean() });

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseRequest(request, followSchema, 60);
  if (!parsed.ok) return parsed.response;
  const user = await currentUser();
  if (!user) return jsonError("Please sign in first.", 401);
  if (parsed.data.user_id === user.id) return jsonError("You can't follow yourself.", 400);
  const db = await supabaseServer();
  const { error } = parsed.data.follow
    ? await db.from("follows").upsert({ follower_id: user.id, followee_id: parsed.data.user_id }, { onConflict: "follower_id,followee_id", ignoreDuplicates: true })
    : await db.from("follows").delete().eq("follower_id", user.id).eq("followee_id", parsed.data.user_id);
  if (error) return jsonError("Could not update. Please try again.", 500);
  return Response.json({ ok: true });
}
