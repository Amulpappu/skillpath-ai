import { z } from "zod";
import { ROLES } from "@/lib/catalog";
import { COMPANIES } from "@/lib/company/catalog";
import { COUNTRIES } from "@/lib/jobs/scout";
import { parseRequest } from "@/lib/request";
import { jsonError } from "@/lib/stream";
import { currentUser, supabaseServer } from "@/lib/supabase/server";

const onboardingSchema = z.object({
  full_name: z.string().trim().min(1).max(80),
  status: z.enum(["student", "fresher", "working", "switching"]),
  institution: z.string().trim().max(120).default(""),
  grad_year: z.number().int().min(1980).max(2040).nullable().default(null),
  country: z.string().refine((c) => COUNTRIES.some((x) => x.code === c)),
  target_role: z.string().refine((r) => ROLES.includes(r)),
  weekly_hours: z.number().int().min(1).max(80),
  interests: z.array(z.string().trim().min(1).max(40)).min(1).max(10),
  dream_companies: z.array(z.string().refine((c) => COMPANIES.some((x) => x.name === c))).max(5).default([]),
  tour_seen: z.literal(true),
});

/** Finishes onboarding: saves the basics and awards the first 100 XP (once). */
export async function POST(request: Request): Promise<Response> {
  const parsed = await parseRequest(request, onboardingSchema, 10);
  if (!parsed.ok) return parsed.response;
  const user = await currentUser();
  if (!user) return jsonError("Please sign in first.", 401);
  const d = parsed.data;
  const { data, error } = await (await supabaseServer()).rpc("complete_onboarding", {
    p_full_name: d.full_name, p_status: d.status, p_institution: d.institution, p_grad_year: d.grad_year,
    p_country: d.country, p_target_role: d.target_role, p_weekly_hours: d.weekly_hours,
    p_interests: d.interests, p_dream_companies: d.dream_companies,
  });
  if (error) return jsonError("Could not save. Please try again.", 500);
  return Response.json({ ok: true, xp: data });
}
