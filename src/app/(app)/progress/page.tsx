import type { Metadata } from "next";
import Link from "next/link";
import { ROLE_REQUIREMENTS } from "@/lib/catalog";
import { PLACEMENT_SKILLS, readiness } from "@/lib/company/catalog";
import { ALL_PROBLEMS } from "@/lib/practice/catalog";
import { currentUser, supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Progress" };

const LABELS = { skills: "Core skill quizzes", practice: "Coding practice", tests: "Aptitude and English tests", profile: "Profile" } as const;
const WEIGHTS = { skills: "40%", practice: "30%", tests: "20%", profile: "10%" } as const;

export default async function ProgressPage() {
  const user = await currentUser();
  if (!user) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>
        <p className="mt-2 text-muted">Sign in to see your Placement Readiness score. It combines your quiz results, coding practice, aptitude and English tests and profile into one number out of 100.</p>
        <Link href="/login?next=/progress" className="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover">Sign in</Link>
      </div>
    );
  }
  const db = await supabaseServer();
  const [{ data: profile }, { data: attempts }, { count: solved }, { count: skillCount }] = await Promise.all([
    db.from("profiles").select("target_role, dream_companies, leetcode_handle, gfg_handle, codechef_handle, hackerrank_handle").eq("id", user.id).single(),
    db.from("quiz_attempts").select("skill, category, score, created_at").order("created_at", { ascending: false }).limit(300),
    db.from("practice_progress").select("problem_id", { count: "exact", head: true }).eq("status", "solved"),
    db.from("user_skills").select("skill", { count: "exact", head: true }),
  ]);
  const latest = new Map<string, number>();
  for (const a of attempts ?? []) if (!latest.has(`${a.category}:${a.skill}`)) latest.set(`${a.category}:${a.skill}`, Number(a.score));
  const role = profile?.target_role && ROLE_REQUIREMENTS[profile.target_role] ? profile.target_role : null;
  const core = role ? ROLE_REQUIREMENTS[role].core : [];
  const r = readiness({
    coreSkillMastery: core.map((s) => latest.get(`skill:${s}`) ?? 0),
    practiceSolved: solved ?? 0, practiceTotal: ALL_PROBLEMS.length,
    placementScores: PLACEMENT_SKILLS.map((p) => latest.get(`${p.category}:${p.skill}`) ?? 0),
    profileFields: {
      targetRole: Boolean(role), dreamCompany: (profile?.dream_companies?.length ?? 0) > 0,
      codingHandle: Boolean(profile?.leetcode_handle || profile?.gfg_handle || profile?.codechef_handle || profile?.hackerrank_handle),
      skills: (skillCount ?? 0) > 0,
    },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>
      <section className="mt-6 grid gap-6 rounded-md border border-line bg-card p-6 sm:grid-cols-[200px_1fr]">
        <div>
          <p className="text-sm text-muted">Placement readiness</p>
          <p className="text-6xl font-semibold tabular-nums tracking-tight">{r.score}</p>
          <p className="mt-1 text-sm font-medium text-accent">{r.band}</p>
        </div>
        <div>
          <ul className="space-y-3">
            {(Object.keys(LABELS) as (keyof typeof LABELS)[]).map((k) => (
              <li key={k}>
                <div className="flex justify-between text-sm"><span>{LABELS[k]} <span className="text-muted">· {WEIGHTS[k]}</span></span><span className="tabular-nums">{r.parts[k]}</span></div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-accent" style={{ width: `${r.parts[k]}%` }} /></div>
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-md bg-paper p-3 text-sm"><span className="font-semibold">AI Mentor: </span>{r.advice}</p>
        </div>
      </section>
      {!role && <p className="mt-4 text-sm text-muted">Set a target role in your plan so core-skill quizzes count towards the score.</p>}
    </div>
  );
}
