import { z } from "zod";
import { ROLES } from "@/lib/catalog";
import { COUNTRIES, jobSiteLinks, liveJobs } from "@/lib/jobs/scout";
import { allowRequest, clientKey } from "@/lib/rateLimit";
import { jsonError } from "@/lib/stream";

const query = z.object({ role: z.string().refine((r) => ROLES.includes(r)), country: z.string().refine((c) => COUNTRIES.some((x) => x.code === c)).default("IN") });

/** Job Scout: live listings from free feeds + job-site searches for a role and country. */
export async function GET(request: Request): Promise<Response> {
  if (!allowRequest(clientKey(request), 20)) return jsonError("Too many requests. Please wait a minute.", 429);
  const parsed = query.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return jsonError("Pick a role from the list.", 400);
  const { role, country } = parsed.data;
  const jobs = await liveJobs(role);
  return Response.json({ role, country, jobs, sites: jobSiteLinks(role, country) }, { headers: { "Cache-Control": "public, max-age=600" } });
}
