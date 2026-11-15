import { timingSafeEqual } from "node:crypto";
import { ALL_SKILLS } from "@/lib/catalog";
import { LEVEL_TARGET } from "@/lib/bank/quality";
import { growSchema } from "@/lib/bank/schemas";
import { growOnce, type Level } from "@/lib/bank/smith";
import { bankCounts } from "@/lib/bank/store";
import { jsonError } from "@/lib/stream";
import { supabaseAdmin } from "@/lib/supabase/server";

export const maxDuration = 60;

function authorised(request: Request) {
  const secret = process.env.BANK_GROW_SECRET ?? process.env.CRON_SECRET;
  const given = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!secret || given.length !== secret.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(secret));
}

/** One Question Smith step. Protected by a secret; also used by Vercel Cron (GET). */
async function handle(request: Request, body: unknown) {
  if (!authorised(request)) return jsonError("Not allowed.", 401);
  const parsed = growSchema.safeParse(body ?? {});
  if (!parsed.success) return jsonError("Invalid request.", 400);
  const db = supabaseAdmin();
  if (!db) return jsonError("The question bank is not configured on this server.", 503);

  let { skill, level } = parsed.data;
  if (!skill || !level) {
    // pick the emptiest skill/level so the whole catalogue grows evenly
    const counts = await bankCounts(db);
    const n = (s: string, l: Level) => Number(counts.find((c) => c.skill === s && c.level === l && c.category === "skill")?.n ?? 0);
    let best: [string, Level, number] | null = null;
    for (const s of ALL_SKILLS) for (const l of ["beginner", "intermediate", "advanced"] as Level[]) {
      const gap = LEVEL_TARGET[l] - n(s, l);
      if (gap > 0 && (!best || n(s, l) < best[2])) best = [s, l, n(s, l)];
    }
    if (!best) return Response.json({ done: true });
    [skill, level] = best;
  }
  try {
    const result = await growOnce(db, { skill, level, category: parsed.data.category, company: parsed.data.company });
    return Response.json({ skill, level, ...result });
  } catch (e) {
    return jsonError(`Question Smith failed: ${(e as Error).message}`.slice(0, 300), 502);
  }
}

export const POST = async (request: Request) => handle(request, await request.json().catch(() => ({})));
export const GET = async (request: Request) => handle(request, {});
