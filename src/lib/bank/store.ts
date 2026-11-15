import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PASS_MARK } from "../scoring";
import type { Category, Level } from "./smith";

export interface ServedQuestion { id: string; prompt: string; options: string[]; topic: string | null }

/** Live question counts per skill/level/category. */
export async function bankCounts(db: SupabaseClient) {
  const { data, error } = await db.rpc("bank_counts");
  if (error) throw new Error(error.message);
  return (data ?? []) as { skill: string; level: Level; category: Category; n: number }[];
}

/** Question ids this user has already answered for a skill/level (so a new quiz shows fresh ones). */
async function seenIds(db: SupabaseClient, userId: string | null, skill: string, level: Level) {
  if (!userId) return [];
  const { data } = await db.from("quiz_attempts").select("question_ids").eq("user_id", userId).eq("skill", skill).eq("level", level)
    .order("created_at", { ascending: false }).limit(40);
  return (data ?? []).flatMap((r) => r.question_ids as string[]);
}

export async function serveQuiz(
  db: SupabaseClient,
  q: { userId: string | null; skill: string; level: Level; category?: Category; company?: string | null; n?: number },
): Promise<ServedQuestion[]> {
  const exclude = await seenIds(db, q.userId, q.skill, q.level);
  const call = (ex: string[]) => db.rpc("pick_questions", {
    p_skill: q.skill, p_level: q.level, p_category: q.category ?? "skill", p_company: q.company ?? null, p_n: q.n ?? 10, p_exclude: ex,
  });
  let { data, error } = await call(exclude);
  if (!error && (data?.length ?? 0) < (q.n ?? 10)) ({ data, error } = await call([])); // seen everything: allow repeats
  if (error) throw new Error(error.message);
  return (data ?? []) as ServedQuestion[];
}

/** Grades answers against the stored keys and records the attempt. Never trusts the browser for correctness. */
export async function gradeQuiz(
  db: SupabaseClient,
  a: { userId: string | null; skill: string; level: Level; category?: Category; company?: string | null; ids: string[]; answers: number[]; seconds?: number },
) {
  const { data, error } = await db.from("questions").select("id, answer_index, explanation, options").in("id", a.ids);
  if (error) throw new Error(error.message);
  const byId = new Map((data ?? []).map((r) => [r.id as string, r]));
  const review = a.ids.map((id, i) => {
    const row = byId.get(id);
    return { id, chosen: a.answers[i] ?? -1, correct: row ? (row.answer_index as number) : -1, explanation: (row?.explanation as string) ?? "" };
  });
  const right = review.filter((r) => r.chosen === r.correct).length;
  const score = a.ids.length ? Math.round((right / a.ids.length) * 100) : 0;
  if (a.userId) {
    await db.from("quiz_attempts").insert({
      user_id: a.userId, skill: a.skill, level: a.level, category: a.category ?? "skill", company: a.company ?? null,
      question_ids: a.ids, answers: a.answers, score, seconds: a.seconds ?? null,
    });
  }
  return { score, passed: score >= PASS_MARK, right, total: a.ids.length, review };
}
