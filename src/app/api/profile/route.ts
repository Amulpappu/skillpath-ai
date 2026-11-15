import { z } from "zod";
import { ROLES } from "@/lib/catalog";
import { COMPANIES } from "@/lib/company/catalog";
import { COUNTRIES } from "@/lib/jobs/scout";
import { parseRequest } from "@/lib/request";
import { jsonError } from "@/lib/stream";
import { currentUser, supabaseServer } from "@/lib/supabase/server";

const handle = z.string().trim().max(40).regex(/^[A-Za-z0-9_.-]*$/, "Handles use letters, numbers, dot, dash or underscore").optional().default("");

const profileSettingsSchema = z.object({
  full_name: z.string().trim().max(80).default(""),
  country: z.string().refine((c) => c === "" || COUNTRIES.some((x) => x.code === c)).default("IN"),
  target_role: z.string().refine((r) => r === "" || ROLES.includes(r)).default(""),
  dream_companies: z.array(z.string().refine((c) => COMPANIES.some((x) => x.name === c))).max(5).default([]),
  interests: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
  weekly_hours: z.number().int().min(1).max(80).default(8),
  leetcode_handle: handle, gfg_handle: handle, codechef_handle: handle, hackerrank_handle: handle,
});

const FIELDS = "full_name, country, target_role, dream_companies, interests, weekly_hours, leetcode_handle, gfg_handle, codechef_handle, hackerrank_handle";

/** The signed-in learner's settings (row-level security limits the query to their own row). */
export async function GET(): Promise<Response> {
  const user = await currentUser();
  if (!user) return jsonError("Sign in to save settings to your account.", 401);
  const { data } = await (await supabaseServer()).from("profiles").select(FIELDS).eq("id", user.id).single();
  return Response.json(data ?? {}, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseRequest(request, profileSettingsSchema, 30);
  if (!parsed.ok) return parsed.response;
  const user = await currentUser();
  if (!user) return jsonError("Sign in to save settings to your account.", 401);
  const blank = (s: string) => (s ? s : null);
  const d = parsed.data;
  const { error } = await (await supabaseServer()).from("profiles").update({
    ...d, country: blank(d.country), target_role: blank(d.target_role),
    leetcode_handle: blank(d.leetcode_handle), gfg_handle: blank(d.gfg_handle), codechef_handle: blank(d.codechef_handle), hackerrank_handle: blank(d.hackerrank_handle),
    updated_at: new Date().toISOString(),
  }).eq("id", user.id);
  if (error) return jsonError("Could not save. Please try again.", 500);
  return Response.json({ ok: true });
}
