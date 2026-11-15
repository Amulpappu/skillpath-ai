import { z } from "zod";
import { openAnswers } from "@/lib/github/scan";
import { parseRequest } from "@/lib/request";
import { jsonError } from "@/lib/stream";

const schema = z.object({ token: z.string().min(20).max(20_000), answers: z.array(z.number().int().min(-1).max(3)).max(12) });
type Key = { language: string; answerIndex: number; explanation: string }[];

/**
 * Grades the GitHub check. Per language: both right → intermediate, one right → beginner,
 * none right → not verified (the language stays in the roadmap to learn).
 */
export async function POST(request: Request): Promise<Response> {
  const parsed = await parseRequest(request, schema, 10);
  if (!parsed.ok) return parsed.response;
  const key = openAnswers<Key>(parsed.data.token);
  if (!key) return jsonError("This check has expired. Please start it again.", 410);
  const per = new Map<string, { right: number; total: number }>();
  const review = key.map((k, i) => {
    const correct = parsed.data.answers[i] === k.answerIndex;
    const e = per.get(k.language) ?? { right: 0, total: 0 };
    e.total += 1; if (correct) e.right += 1; per.set(k.language, e);
    return { correct, answerIndex: k.answerIndex, explanation: k.explanation };
  });
  const results = [...per.entries()].map(([language, { right, total }]) => ({
    language, right, total,
    level: right === total ? "intermediate" : right > 0 ? "beginner" : null,
  }));
  return Response.json({ results, review });
}
