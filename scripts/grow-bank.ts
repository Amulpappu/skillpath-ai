/**
 * Grows the shared question bank towards 465+ verified questions per skill.
 *
 *   npm run bank:grow                          → all skills, emptiest first
 *   npm run bank:grow -- --skill Java          → one skill
 *   npm run bank:grow -- --max-calls 100       → stop after 100 batches (each batch = 2 Gemini calls)
 *   npm run bank:grow -- --category aptitude --skill "Quantitative Aptitude"
 *
 * Needs GEMINI_API_KEY, NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 * Safe to stop (Ctrl+C) and re-run: it always continues from what is already in the database.
 */
import { createClient } from "@supabase/supabase-js";
import { ALL_SKILLS } from "../src/lib/catalog";
import { LEVEL_TARGET } from "../src/lib/bank/quality";
import { growOnce, type Category, type Level } from "../src/lib/bank/smith";
import { bankCounts } from "../src/lib/bank/store";

const args = process.argv.slice(2);
const arg = (name: string) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const onlySkill = arg("skill");
const category = (arg("category") ?? "skill") as Category;
const maxCalls = Number(arg("max-calls") ?? 1000);
const delayMs = Number(arg("delay") ?? 4) * 1000;
const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key || !process.env.GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY, NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function next(): Promise<[string, Level, number] | null> {
  const counts = await bankCounts(db);
  const n = (s: string, l: Level) => Number(counts.find((c) => c.skill === s && c.level === l && c.category === category)?.n ?? 0);
  const skills = onlySkill ? [onlySkill] : ALL_SKILLS;
  let best: [string, Level, number] | null = null;
  for (const s of skills) for (const l of LEVELS) {
    if (n(s, l) < LEVEL_TARGET[l] && (!best || n(s, l) < best[2])) best = [s, l, n(s, l)];
  }
  return best;
}

let calls = 0, added = 0, failures = 0;
while (calls < maxCalls) {
  const pick = await next();
  if (!pick) { console.log("✓ Target reached for every selected skill."); break; }
  const [skill, level, have] = pick;
  try {
    const r = await growOnce(db, { skill, level, category });
    calls++; added += r.added; failures = 0;
    console.log(`${skill.padEnd(28)} ${level.padEnd(12)} ${String(have + r.added).padStart(3)}/${LEVEL_TARGET[level]}  +${r.added}  (topic: ${r.topic}; rejected ${r.rejected}, checker disagreed ${r.disagreed})`);
    await sleep(delayMs);
  } catch (e) {
    const msg = (e as Error).message ?? String(e);
    failures++;
    const limited = /429|RESOURCE_EXHAUSTED|quota|rate/i.test(msg);
    const wait = limited ? Math.min(15 * 60_000, 60_000 * failures) : 10_000;
    console.warn(`! ${skill} ${level}: ${msg.slice(0, 160)}. Waiting ${Math.round(wait / 1000)}s.`);
    if (failures >= 8) { console.error("Stopping after 8 failures in a row. Run again later."); break; }
    await sleep(wait);
  }
}
console.log(`Done: ${calls} batches, ${added} new verified questions.`);
