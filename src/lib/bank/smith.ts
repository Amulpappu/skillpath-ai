import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { askGemini } from "../gemini";
import { sanitizeForPrompt } from "../validation";
import { type Draft, draftSchema, rebalance, screen } from "./quality";

/**
 * Question Smith agent: grows the shared question bank one batch at a time.
 * 1. Syllabus: asks Gemini once per skill/level for 14 sub-topics, so batches cover the whole skill.
 * 2. Write: picks the least-covered sub-topic and writes a batch, avoiding prompts already in the bank.
 * 3. Screen: the rule-based quality gate (quality.ts) rejects weak or duplicate questions.
 * 4. Blind check: Gemini answers each question again WITHOUT the key; only questions where both answers
 *    agree are stored as verified. This removes most wrong or ambiguous keys.
 */

export type Level = "beginner" | "intermediate" | "advanced";
export type Category = "skill" | "aptitude" | "english" | "problem-understanding";
export interface BankTarget { skill: string; level: Level; category?: Category; company?: string | null }

const LONG = { timeoutMs: 60_000 };

const LEVEL_GUIDE: Record<Level, string> = {
  beginner: "core concepts and syntax a learner meets in their first month; still require understanding, not recall of trivia",
  intermediate: "applying the skill to realistic tasks: reading code or scenarios, choosing the right approach, spotting bugs",
  advanced: "edge cases, performance, security, design trade-offs and interview-grade reasoning",
};

const CATEGORY_GUIDE: Record<Category, string> = {
  skill: "technical knowledge of the skill",
  aptitude: "placement-style aptitude: quantitative, logical reasoning and data interpretation with numeric answers worked out step by step",
  english: "placement-style English: grammar, vocabulary in context, sentence correction and short reading comprehension",
  "problem-understanding": "reading a problem statement carefully: identifying inputs, outputs, constraints, edge cases and the right approach before coding",
};

const syllabusSchema = z.object({ topics: z.array(z.string().min(3).max(80)).min(8).max(20) });
const batchSchema = z.object({ questions: z.array(draftSchema).min(1).max(25) });
const blindSchema = z.object({ answers: z.array(z.number().int().min(-1).max(3)) });

function describe(t: BankTarget) {
  const cat = t.category ?? "skill";
  const company = t.company ? ` in the style of ${sanitizeForPrompt(t.company)}'s hiring tests` : "";
  return `${sanitizeForPrompt(t.skill)} (${t.level} level, ${CATEGORY_GUIDE[cat]}${company})`;
}

export async function syllabus(t: BankTarget): Promise<string[]> {
  const { topics } = await askGemini(
    "You design assessment syllabi. Reply with JSON only.",
    `List 14 distinct sub-topics that together cover ${describe(t)}. Level guidance: ${LEVEL_GUIDE[t.level]}.
Each sub-topic is a short noun phrase. No numbering. Schema: {"topics":[string]}`,
    syllabusSchema,
    { ...LONG, temperature: 0.3 },
  );
  return [...new Set(topics.map((x) => x.trim()))];
}

export async function writeBatch(t: BankTarget, topic: string, avoid: string[], n = 15): Promise<Draft[]> {
  const avoidList = avoid.slice(-30).map((a) => `- ${a.slice(0, 120)}`).join("\n");
  const { questions } = await askGemini(
    `You are the Question Smith, writing assessment questions for a professional learning and placement platform.
Rules:
- Exactly 4 options, exactly one correct. Distractors are plausible mistakes a real learner makes.
- Never use "all of the above", "none of the above", "both A and B".
- One unambiguous answer that experts agree on. No opinion questions, no trivia about dates or people.
- Prefer short scenarios, code or worked examples over definitions. Put code in backticks.
- Keep options similar in length so the answer is not guessable from length.
- explanation: 1–2 sentences on why the answer is right.
Reply with JSON only: {"questions":[{"question":string,"options":[4 strings],"answerIndex":0-3,"explanation":string}]}`,
    `Write ${n} questions on the sub-topic "${sanitizeForPrompt(topic)}" for ${describe(t)}.
Level guidance: ${LEVEL_GUIDE[t.level]}.
Do not repeat or rephrase these existing questions:
${avoidList || "- (none yet)"}`,
    batchSchema,
    { ...LONG, temperature: 0.8 },
  );
  return questions;
}

/** Answers each question without seeing the key; returns indexes (-1 when unsure). */
export async function blindAnswers(t: BankTarget, drafts: Draft[]): Promise<number[]> {
  const list = drafts.map((d, i) => `${i + 1}. ${d.question}\n${d.options.map((o, j) => `   ${j}) ${o}`).join("\n")}`).join("\n\n");
  const { answers } = await askGemini(
    `You are an exam checker for ${describe(t)}. For each question choose the single best option index (0–3).
If a question is ambiguous or has more than one correct option, answer -1. Reply with JSON only: {"answers":[numbers]}`,
    list,
    blindSchema,
    { ...LONG, temperature: 0 },
  );
  return answers;
}

/** One growth step for a skill/level. Returns how many questions were added and why others were dropped. */
export async function growOnce(db: SupabaseClient, t: BankTarget, batchSize = 15) {
  const category = t.category ?? "skill";
  const company = t.company ?? null;

  // 1. syllabus (created once)
  const { data: topicRows } = await db.from("bank_topics").select("topic, generated")
    .eq("skill", t.skill).eq("level", t.level).eq("category", category).order("generated", { ascending: true });
  let topics = topicRows ?? [];
  if (topics.length === 0) {
    const list = await syllabus(t);
    await db.from("bank_topics").insert(list.map((topic) => ({ skill: t.skill, level: t.level, category, topic })));
    topics = list.map((topic) => ({ topic, generated: 0 }));
  }
  const topic = topics[0].topic;

  // 2. existing prompts for de-duplication
  let existingQ = db.from("questions").select("fingerprint, prompt, topic").eq("skill", t.skill).eq("level", t.level).eq("category", category);
  existingQ = company ? existingQ.eq("company", company) : existingQ.is("company", null);
  const { data: existing } = await existingQ;
  const seen = new Set((existing ?? []).map((r) => r.fingerprint as string));
  const avoid = (existing ?? []).filter((r) => r.topic === topic).map((r) => r.prompt as string);

  // 3. write + screen
  const drafts = await writeBatch(t, topic, avoid, batchSize);
  const { accepted, rejected } = screen(t.skill, t.level, drafts, seen);
  if (accepted.length === 0) return { topic, added: 0, rejected: rejected.length, disagreed: 0 };

  // 4. blind check
  const blind = await blindAnswers(t, accepted);
  const verified = accepted.filter((d, i) => blind[i] === d.answerIndex).map(rebalance);
  const disagreed = accepted.length - verified.length;

  if (verified.length) {
    const { error } = await db.from("questions").upsert(
      verified.map((d) => ({
        skill: t.skill, level: t.level, category, company, topic,
        prompt: d.question, options: d.options, answer_index: d.answerIndex, explanation: d.explanation,
        fingerprint: d.fingerprint, verified: true, created_by: "question-smith",
      })),
      { onConflict: "fingerprint", ignoreDuplicates: true },
    );
    if (error) throw new Error(`Saving questions failed: ${error.message}`);
    await db.from("bank_topics").update({ generated: (topics[0].generated ?? 0) + verified.length })
      .eq("skill", t.skill).eq("level", t.level).eq("category", category).eq("topic", topic);
  }
  return { topic, added: verified.length, rejected: rejected.length, disagreed };
}
