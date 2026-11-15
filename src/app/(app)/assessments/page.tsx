import type { Metadata } from "next";
import { AssessmentRunner } from "@/components/AssessmentRunner";
import { BANK_TARGET } from "@/lib/bank/quality";
import { bankCounts } from "@/lib/bank/store";
import { ALL_SKILLS } from "@/lib/catalog";
import { AI_SKILLS, PROGRAMMING_LANGUAGES } from "@/lib/catalogGlobal";
import { supabaseAdmin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Assessments" };

const FUNDAMENTALS = ["Data Structures & Algorithms", "OOP", "DBMS", "Operating Systems", "Computer Networks", "System Design"];

export default async function AssessmentsPage() {
  const db = supabaseAdmin();
  const counts = db ? await bankCounts(db).catch(() => []) : [];
  const total = (s: string) => counts.filter((c) => c.skill === s && c.category === "skill").reduce((t, c) => t + Number(c.n), 0);
  const groups = [
    { label: "Programming languages", skills: PROGRAMMING_LANGUAGES.filter((s) => ALL_SKILLS.includes(s)) },
    { label: "AI skills (in demand)", skills: AI_SKILLS.filter((s) => ALL_SKILLS.includes(s)) },
    { label: "Placement fundamentals", skills: FUNDAMENTALS },
    { label: "Tools, frameworks and domains", skills: ALL_SKILLS.filter((s) => !PROGRAMMING_LANGUAGES.includes(s) && !FUNDAMENTALS.includes(s) && !AI_SKILLS.includes(s)) },
  ];
  const ready = ALL_SKILLS.filter((s) => total(s) >= BANK_TARGET).length;
  const bankTotal = ALL_SKILLS.reduce((t, s) => t + total(s), 0);
  const top = [...ALL_SKILLS].sort((a, b) => total(b) - total(a)).slice(0, 8);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight">Assessments</h1>
      <p className="mt-1 text-muted">Ten fresh questions each time, from a bank checked twice by the Question Smith. Answers are graded on the server.</p>

      <section aria-label="Question bank" className="mt-6 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
        <div className="bg-card p-4"><p className="text-sm text-muted">Verified questions</p><p className="text-2xl font-semibold tabular-nums">{bankTotal.toLocaleString()}</p></div>
        <div className="bg-card p-4"><p className="text-sm text-muted">Skills at {BANK_TARGET}+</p><p className="text-2xl font-semibold tabular-nums">{ready} / {ALL_SKILLS.length}</p></div>
        <div className="bg-card p-4">
          <p className="text-sm text-muted">Largest banks</p>
          <p className="mt-1 truncate text-sm">{top.filter((s) => total(s) > 0).map((s) => `${s} ${total(s)}`).join(" · ") || "Building…"}</p>
        </div>
      </section>

      <div className="mt-6"><AssessmentRunner skills={ALL_SKILLS} groups={groups} /></div>
    </div>
  );
}
