import { z } from "zod";
import { parseRequest } from "@/lib/request";
import { jsonError } from "@/lib/stream";
import { currentUser, supabaseServer } from "@/lib/supabase/server";

const schema = z.object({ phone: z.string().trim().refine((v) => v === "" || /^\+[1-9][0-9]{6,14}$/.test(v), "Use + country code and digits, e.g. +919876543210") });

/** Saves the private phone number (never shown to other people). */
export async function POST(request: Request): Promise<Response> {
  const parsed = await parseRequest(request, schema, 20);
  if (!parsed.ok) return parsed.response;
  const user = await currentUser();
  if (!user) return jsonError("Please sign in first.", 401);
  const { error } = await (await supabaseServer()).from("profiles").update({ phone: parsed.data.phone || null }).eq("id", user.id);
  if (error) return jsonError("Could not save the number.", 400);
  return Response.json({ ok: true });
}
