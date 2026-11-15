import { bankCounts } from "@/lib/bank/store";
import { BANK_TARGET } from "@/lib/bank/quality";
import { jsonError } from "@/lib/stream";
import { supabaseAdmin } from "@/lib/supabase/server";

/** Public progress of the question bank: questions per skill against the 465 target. */
export async function GET(): Promise<Response> {
  const db = supabaseAdmin();
  if (!db) return jsonError("The question bank is not configured on this server.", 503);
  const rows = await bankCounts(db);
  const bySkill = new Map<string, { skill: string; total: number; beginner: number; intermediate: number; advanced: number }>();
  for (const r of rows.filter((r) => r.category === "skill")) {
    const s = bySkill.get(r.skill) ?? { skill: r.skill, total: 0, beginner: 0, intermediate: 0, advanced: 0 };
    s[r.level] += Number(r.n); s.total += Number(r.n); bySkill.set(r.skill, s);
  }
  const skills = [...bySkill.values()].sort((a, b) => b.total - a.total);
  return Response.json({ target: BANK_TARGET, total: skills.reduce((t, s) => t + s.total, 0), complete: skills.filter((s) => s.total >= BANK_TARGET).length, skills },
    { headers: { "Cache-Control": "public, max-age=300" } });
}
