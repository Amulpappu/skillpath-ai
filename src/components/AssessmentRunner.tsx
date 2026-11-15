"use client";

import { useMemo, useState } from "react";

type Level = "beginner" | "intermediate" | "advanced";
interface Q { id: string; prompt: string; options: string[]; topic?: string | null }
interface Review { id: string; chosen: number; correct: number; explanation: string }
interface Result { score: number; passed: boolean; right: number; total: number; review: Review[] }

const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];
const LETTERS = ["A", "B", "C", "D"];

/** Bank-backed quiz: fetches questions without answers, grades on the server, then shows a review. */
export function AssessmentRunner({ skills, groups }: { skills: string[]; groups: { label: string; skills: string[] }[] }) {
  const [skill, setSkill] = useState(skills.includes("JavaScript") ? "JavaScript" : skills[0]);
  const [level, setLevel] = useState<Level>("beginner");
  const [questions, setQuestions] = useState<Q[] | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(0);
  const unanswered = useMemo(() => answers.filter((a) => a < 0).length, [answers]);

  async function start() {
    setBusy(true); setError(null); setResult(null);
    const res = await fetch(`/api/bank/quiz?${new URLSearchParams({ skill, level, n: "10" })}`, { cache: "no-store" });
    const body = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setError(body.error ?? "Could not load the quiz."); return; }
    setQuestions(body.questions); setAnswers(body.questions.map(() => -1)); setStarted(Date.now());
  }

  async function submit() {
    if (!questions) return;
    setBusy(true); setError(null);
    const res = await fetch("/api/bank/grade", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ skill, level, ids: questions.map((q) => q.id), answers, seconds: Math.round((Date.now() - started) / 1000) }),
    });
    const body = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setError(body.error ?? "Could not grade the quiz."); return; }
    setResult(body);
  }

  const reviewFor = (id: string) => result?.review.find((r) => r.id === id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-5">
        <label className="text-sm font-medium">Skill
          <select value={skill} onChange={(e) => { setSkill(e.target.value); setQuestions(null); setResult(null); }} className="mt-1 block w-64 rounded-lg border border-line bg-white px-3 py-2">
            {groups.map((g) => (
              <optgroup key={g.label} label={g.label}>{g.skills.map((s) => <option key={s}>{s}</option>)}</optgroup>
            ))}
          </select>
        </label>
        <fieldset className="text-sm font-medium">
          <legend>Level</legend>
          <div className="mt-1 flex overflow-hidden rounded-lg border border-line">
            {LEVELS.map((l) => (
              <button key={l} type="button" onClick={() => { setLevel(l); setQuestions(null); setResult(null); }} aria-pressed={level === l}
                className={`px-3 py-2 capitalize ${level === l ? "bg-ink text-white" : "bg-white hover:bg-paper"}`}>{l}</button>
            ))}
          </div>
        </fieldset>
        <button type="button" onClick={start} disabled={busy} className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white hover:bg-ink disabled:opacity-60">
          {questions ? "New quiz" : "Start quiz"}
        </button>
      </div>

      {error && <p role="alert" className="rounded-lg border border-bad bg-bad-soft p-4 text-sm text-bad">{error}</p>}

      {result && (
        <div className={`rounded-xl border p-5 ${result.passed ? "border-accent bg-accent-soft" : "border-warn bg-warn-soft"}`} aria-live="polite">
          <p className="text-3xl font-semibold tabular-nums">{result.score}%</p>
          <p className="mt-1 text-sm">{result.right} of {result.total} correct · pass mark 60% · {result.passed ? "Passed. Your roadmap moves on." : "Below 60%. The Learning Planner will add a revision step."}</p>
        </div>
      )}

      {questions && (
        <ol className="space-y-4">
          {questions.map((q, qi) => {
            const r = reviewFor(q.id);
            return (
              <li key={q.id} className="rounded-xl border border-line bg-card p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Question {qi + 1}{q.topic ? ` · ${q.topic}` : ""}</p>
                <p className="mt-1 font-medium leading-snug">{q.prompt}</p>
                <div className="mt-3 grid gap-2" role="radiogroup" aria-label={`Question ${qi + 1}`}>
                  {q.options.map((o, oi) => {
                    const chosen = answers[qi] === oi;
                    const state = r ? (oi === r.correct ? "border-accent bg-accent-soft" : chosen ? "border-bad bg-bad-soft" : "border-line") : chosen ? "border-ink bg-paper" : "border-line hover:border-ink";
                    return (
                      <button key={oi} type="button" role="radio" aria-checked={chosen} disabled={Boolean(result)}
                        onClick={() => setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)))}
                        className={`flex items-start gap-3 rounded-lg border bg-white px-3 py-2 text-left text-sm ${state}`}>
                        <span className="font-mono text-xs text-muted">{LETTERS[oi]}</span><span>{o}</span>
                      </button>
                    );
                  })}
                </div>
                {r && <p className="mt-3 text-sm text-muted">{r.explanation}</p>}
              </li>
            );
          })}
        </ol>
      )}

      {questions && !result && (
        <button type="button" onClick={submit} disabled={busy || unanswered > 0} className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-ink disabled:opacity-50">
          {unanswered > 0 ? `Answer ${unanswered} more` : "Submit answers"}
        </button>
      )}
    </div>
  );
}
