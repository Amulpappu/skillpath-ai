import { createHash } from "node:crypto";
import { z } from "zod";

/**
 * Quality gate for generated questions. Pure functions so they are unit-tested.
 * A question must pass every rule here before the blind second-answer check.
 */

export const draftSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  answerIndex: z.number().int(),
  explanation: z.string(),
});
export type Draft = z.infer<typeof draftSchema>;

const BANNED_OPTIONS = /^(all|none|both) of the (above|options|answers)\b|^(a|b|c|d) and (a|b|c|d)\b|^either\b.*\bor\b/i;
const VAGUE_PROMPT = /\b(which of the following is true|what do you think|in your opinion)\b/i;

/** Normalised text used to detect duplicates even with different punctuation, spacing or case. */
export function normalise(text: string): string {
  return text.toLowerCase().replace(/`/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

/** Stable duplicate key for a question within a skill and level. */
export function fingerprint(skill: string, level: string, prompt: string): string {
  return createHash("sha256").update(`${normalise(skill)}|${level}|${normalise(prompt)}`).digest("hex").slice(0, 32);
}

/** Returns the reasons a draft is rejected (empty array = accepted). */
export function problems(d: Draft): string[] {
  const out: string[] = [];
  const q = d.question.trim();
  if (q.length < 15) out.push("question too short");
  if (q.length > 500) out.push("question too long");
  if (VAGUE_PROMPT.test(q)) out.push("vague question");
  if (d.options.length !== 4) out.push("needs exactly 4 options");
  if (!Number.isInteger(d.answerIndex) || d.answerIndex < 0 || d.answerIndex > 3) out.push("answer index out of range");
  const opts = d.options.map((o) => o.trim());
  if (opts.some((o) => o.length === 0)) out.push("empty option");
  if (opts.some((o) => o.length > 220)) out.push("option too long");
  if (new Set(opts.map(normalise)).size !== opts.length) out.push("duplicate options");
  if (opts.some((o) => BANNED_OPTIONS.test(o))) out.push("uses all/none/both-of-the-above style option");
  // A correct answer that is far longer than every distractor is a give-away.
  const lens = opts.map((o) => o.length);
  const correct = lens[d.answerIndex] ?? 0;
  const others = lens.filter((_, i) => i !== d.answerIndex);
  if (others.length === 3 && correct > 2.2 * Math.max(...others) && correct > 60) out.push("correct option is a length give-away");
  if (d.explanation.trim().length < 10) out.push("missing explanation");
  if (d.explanation.length > 600) out.push("explanation too long");
  return out;
}

/** Keeps accepted drafts, dropping exact or near-exact duplicates (by fingerprint) within the batch and against `seen`. */
export function screen(skill: string, level: string, drafts: Draft[], seen: Set<string>) {
  const accepted: (Draft & { fingerprint: string })[] = [];
  const rejected: { draft: Draft; reasons: string[] }[] = [];
  for (const d of drafts) {
    const reasons = problems(d);
    const fp = fingerprint(skill, level, d.question);
    if (seen.has(fp)) reasons.push("duplicate");
    if (reasons.length) rejected.push({ draft: d, reasons });
    else {
      seen.add(fp);
      accepted.push({ ...d, question: d.question.trim(), options: d.options.map((o) => o.trim()), fingerprint: fp });
    }
  }
  return { accepted, rejected };
}

/** Shuffles options deterministically (by fingerprint) so the correct answer is spread across A–D. */
export function rebalance<T extends Draft & { fingerprint: string }>(d: T): T {
  const target = parseInt(d.fingerprint.slice(0, 2), 16) % 4;
  if (target === d.answerIndex) return d;
  const options = [...d.options];
  [options[target], options[d.answerIndex]] = [options[d.answerIndex], options[target]];
  return { ...d, options, answerIndex: target };
}

/** Target size of every skill's bank across all levels. */
export const BANK_TARGET = 465;
/** Split of the target across levels (beginner gets slightly more). */
export const LEVEL_TARGET = { beginner: 160, intermediate: 155, advanced: 150 } as const;
