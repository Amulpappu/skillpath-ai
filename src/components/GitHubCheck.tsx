"use client";

import { useState } from "react";
import { normalizeSkill } from "@/lib/catalog";
import type { Level, Profile } from "@/lib/types";

type Lang = { name: string; percent: number; repos: string[] };
type RepoInfo = { name: string; description: string; url: string; languages: Record<string, number> };
type Question = { language: string; repo: string; prompt: string; options: string[] };
type Result = { language: string; right: number; total: number; level: Level | null };
type Review = { correct: boolean; answerIndex: number; explanation: string };

const btn = "rounded-md border border-line bg-subtle px-3 py-1.5 text-sm font-medium hover:bg-card disabled:opacity-60";
const primary = "rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60";

/**
 * Reads the learner's GitHub projects, then checks each language with questions about their own projects.
 * Languages they can't explain are not counted as known, so they stay in the roadmap.
 */
export function GitHubCheck({ profile, onChange, defaultUser }: { profile: Profile; onChange: (p: Profile) => void; defaultUser: string }) {
  const [user, setUser] = useState(defaultUser);
  const [busy, setBusy] = useState<null | "scan" | "questions" | "grade">(null);
  const [error, setError] = useState<string | null>(null);
  const [scan, setScan] = useState<{ username: string; languages: Lang[]; repos: RepoInfo[] } | null>(null);
  const [quiz, setQuiz] = useState<{ token: string; questions: Question[] } | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [graded, setGraded] = useState<{ results: Result[]; review: Review[] } | null>(null);

  async function post<T>(url: string, body: unknown): Promise<T | null> {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => null);
    if (!res.ok) { setError(data?.error ?? "Something went wrong. Please try again."); return null; }
    return data as T;
  }

  async function read() {
    if (!user.trim()) return;
    const u = user.trim().replace(/^https?:\/\/(www\.)?github\.com\//i, "").replace(/\/.*$/, "");
    setUser(u); setBusy("scan"); setError(null); setScan(null); setQuiz(null); setGraded(null);
    const data = await post<{ username: string; languages: Lang[]; repos: RepoInfo[] }>("/api/github/scan", { username: u });
    setBusy(null);
    if (data) {
      setScan(data);
      // Projects come straight from GitHub (the learner can still edit them below).
      const names = data.repos.slice(0, 8).map((r) => (r.description ? `${r.name}: ${r.description}` : r.name));
      const existing = new Set(profile.projects.map((p) => p.split(":")[0].trim().toLowerCase()));
      onChange({ ...profile, projects: [...profile.projects.filter(Boolean), ...names.filter((n) => !existing.has(n.split(":")[0].trim().toLowerCase()))] });
    }
  }

  async function start() {
    if (!scan) return;
    setBusy("questions"); setError(null); setGraded(null);
    const data = await post<{ token: string; questions: Question[] }>("/api/github/questions", { username: scan.username });
    setBusy(null);
    if (data) { setQuiz(data); setAnswers(data.questions.map(() => -1)); }
  }

  async function grade() {
    if (!quiz) return;
    setBusy("grade"); setError(null);
    const data = await post<{ results: Result[]; review: Review[] }>("/api/github/grade", { token: quiz.token, answers });
    setBusy(null);
    if (!data) return;
    setGraded(data);
    // Apply: verified languages are added at the level shown; unverified ones are removed so the roadmap teaches them.
    let skills = profile.skills.filter((s) => s.name.trim());
    for (const r of data.results) {
      const k = normalizeSkill(r.language);
      skills = skills.filter((s) => normalizeSkill(s.name) !== k);
      if (r.level) skills.push({ name: r.language, level: r.level });
    }
    onChange({ ...profile, skills: skills.length ? skills : [{ name: "", level: "beginner" }] });
  }

  return (
    <fieldset className="rounded-md border border-line bg-paper p-4">
      <legend className="flex items-center gap-2 px-1 text-sm font-semibold">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/github.svg" alt="" className="h-4 w-4" /> Check my skills from GitHub
      </legend>
      <p className="mb-3 text-xs text-muted">We read the languages and READMEs of your public projects, then ask a few questions about <b>your own projects</b>. Only what you can explain counts as known; the rest stays in your roadmap.</p>
      <div className="flex flex-wrap gap-2">
        <div className="flex min-w-0 flex-1 rounded-md border border-line bg-card">
          <span className="px-2.5 py-1.5 text-sm text-muted">github.com/</span>
          <input value={user} onChange={(e) => setUser(e.target.value)} aria-label="GitHub username" placeholder="username"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void read(); } }}
            className="min-w-0 flex-1 rounded-e-md border-s border-line bg-card px-2 py-1.5 text-sm" />
        </div>
        <button type="button" onClick={() => void read()} className={btn} disabled={busy !== null || !user.trim()}>{busy === "scan" ? "Reading…" : scan ? "Read again" : "Read my projects"}</button>
      </div>

      {scan && (
        <div className="mt-4 space-y-3">
          <p className="text-sm"><b>{scan.repos.length}</b> projects read. Languages found:</p>
          <div className="flex flex-wrap gap-1.5">
            {scan.languages.slice(0, 8).map((l) => (
              <span key={l.name} title={l.repos.join(", ")} className="rounded-full border border-line bg-card px-2.5 py-0.5 text-xs">{l.name} <span className="text-muted">{l.percent}%</span></span>
            ))}
          </div>
          <ul className="max-h-32 space-y-0.5 overflow-y-auto text-xs text-muted">
            {scan.repos.map((r) => <li key={r.name}><a href={r.url} target="_blank" rel="noopener noreferrer" className="text-link hover:underline">{r.name}</a>{r.description && ` · ${r.description}`}</li>)}
          </ul>
          {!quiz && <button type="button" onClick={start} disabled={busy !== null} className={primary}>{busy === "questions" ? "Writing questions about your projects…" : `Start the check (${Math.min(5, scan.languages.length) * 2} questions)`}</button>}
        </div>
      )}

      {quiz && (
        <ol className="mt-4 space-y-4">
          {quiz.questions.map((q, i) => {
            const r = graded?.review[i];
            return (
              <li key={i} className="rounded-md border border-line bg-card p-3">
                <p className="mb-1 text-xs text-muted">{q.language} · from <b className="text-ink">{q.repo}</b></p>
                <p className="text-sm font-medium">{i + 1}. {q.prompt}</p>
                <div className="mt-2 grid gap-1.5">
                  {q.options.map((o, oi) => {
                    const chosen = answers[i] === oi;
                    const tone = r ? (oi === r.answerIndex ? "border-accent bg-accent-soft" : chosen ? "border-bad bg-bad-soft" : "border-line") : chosen ? "border-link bg-subtle" : "border-line hover:bg-subtle";
                    return (
                      <button key={oi} type="button" disabled={Boolean(graded)} aria-pressed={chosen}
                        onClick={() => setAnswers(answers.map((a, j) => (j === i ? oi : a)))}
                        className={`rounded-md border px-3 py-1.5 text-start text-sm ${tone}`}>{o}</button>
                    );
                  })}
                </div>
                {r && <p className={`mt-2 text-xs ${r.correct ? "text-accent" : "text-bad"}`}>{r.correct ? "✓ Correct. " : "✗ Not quite. "}<span className="text-muted">{r.explanation}</span></p>}
              </li>
            );
          })}
          {!graded && (
            <button type="button" onClick={grade} disabled={busy !== null || answers.some((a) => a < 0)} className={primary}>
              {busy === "grade" ? "Checking…" : answers.some((a) => a < 0) ? `Answer all ${quiz.questions.length} questions` : "Submit answers"}
            </button>
          )}
        </ol>
      )}

      {graded && (
        <div className="mt-4 rounded-md border border-line bg-card p-3 text-sm">
          <p className="mb-2 font-semibold">Result (added to your skills above)</p>
          <ul className="space-y-1">
            {graded.results.map((r) => (
              <li key={r.language} className="flex items-center justify-between gap-2">
                <span>{r.language} <span className="text-muted">({r.right}/{r.total})</span></span>
                {r.level ? <span className="rounded-full border border-accent px-2 py-0.5 text-xs text-accent">Verified · {r.level}</span>
                  : <span className="rounded-full border border-warn px-2 py-0.5 text-xs text-warn">Not verified · stays in your roadmap</span>}
              </li>
            ))}
          </ul>
          <button type="button" onClick={start} disabled={busy !== null} className={`${btn} mt-3`}>Try new questions</button>
        </div>
      )}
      {error && <p role="alert" className="mt-2 text-sm text-bad">{error}</p>}
    </fieldset>
  );
}
