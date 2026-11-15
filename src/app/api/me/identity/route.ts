import { z } from "zod";
import { AVATAR_CHOICE } from "@/lib/avatar";
import { parseRequest } from "@/lib/request";
import { jsonError } from "@/lib/stream";
import { currentUser, supabaseServer } from "@/lib/supabase/server";

const identitySchema = z.object({
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/, "Usernames are 3 to 30 letters, numbers or dashes."),
  full_name: z.string().trim().min(1).max(80),
  headline: z.string().trim().max(100).default(""),
  bio: z.string().trim().max(300).default(""),
  avatar_choice: z.string().regex(AVATAR_CHOICE).nullable().default(null),
  website: z.string().trim().max(200).refine((v) => v === "" || /^https:\/\/\S{3,200}$/.test(v), "Website must start with https://").default(""),
  github_user: z.string().trim().max(39).regex(/^[A-Za-z0-9-]*$/).default(""),
  linkedin_user: z.string().trim().max(100).regex(/^[A-Za-z0-9-]*$/).default(""),
});

/** Saves the learner's public identity: the only things other people can see. */
export async function POST(request: Request): Promise<Response> {
  const parsed = await parseRequest(request, identitySchema, 20);
  if (!parsed.ok) return parsed.response;
  const user = await currentUser();
  if (!user) return jsonError("Please sign in first.", 401);
  const d = parsed.data;
  const blank = (s: string) => (s ? s : null);
  const { error } = await (await supabaseServer()).from("profiles").update({
    username: d.username, full_name: d.full_name, headline: blank(d.headline), bio: blank(d.bio), avatar_choice: d.avatar_choice,
    website: blank(d.website), github_user: blank(d.github_user), linkedin_user: blank(d.linkedin_user), updated_at: new Date().toISOString(),
  }).eq("id", user.id);
  if (error?.code === "23505") return jsonError("That username is taken. Try another.", 409);
  if (error) return jsonError("Could not save. Please check the fields and try again.", 400);
  return Response.json({ ok: true });
}
