"use client";

import { useEffect, useState } from "react";

type Settings = {
  full_name: string; country: string; target_role: string; dream_companies: string[]; interests: string[]; weekly_hours: number;
  leetcode_handle: string; gfg_handle: string; codechef_handle: string; hackerrank_handle: string;
};
const EMPTY: Settings = { full_name: "", country: "IN", target_role: "", dream_companies: [], interests: [], weekly_hours: 8, leetcode_handle: "", gfg_handle: "", codechef_handle: "", hackerrank_handle: "" };
const LOCAL_KEY = "skillpath:settings:v1";
const HANDLES: { key: keyof Settings; label: string; profile: (h: string) => string }[] = [
  { key: "leetcode_handle", label: "LeetCode", profile: (h) => `https://leetcode.com/u/${h}/` },
  { key: "gfg_handle", label: "GeeksforGeeks", profile: (h) => `https://www.geeksforgeeks.org/user/${h}/` },
  { key: "codechef_handle", label: "CodeChef", profile: (h) => `https://www.codechef.com/users/${h}` },
  { key: "hackerrank_handle", label: "HackerRank", profile: (h) => `https://www.hackerrank.com/profile/${h}` },
];
const input = "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm";

export function SettingsForm({ roles, companies, countries }: { roles: string[]; companies: string[]; countries: { code: string; name: string }[] }) {
  const [s, setS] = useState<Settings>(EMPTY);
  const [account, setAccount] = useState<boolean | null>(null);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [interest, setInterest] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/profile", { cache: "no-store" }).catch(() => null);
      if (res?.ok) {
        const d = await res.json();
        setS({ ...EMPTY, ...Object.fromEntries(Object.entries(d).map(([k, v]) => [k, v ?? (EMPTY as Record<string, unknown>)[k]])) } as Settings);
        setAccount(true); return;
      }
      try { setS({ ...EMPTY, ...JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "{}") }); } catch { /* fresh */ }
      setAccount(false);
    })();
  }, []);

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => { setS((x) => ({ ...x, [k]: v })); setState("idle"); };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    if (!account) {
      try { localStorage.setItem(LOCAL_KEY, JSON.stringify(s)); setState("saved"); } catch { setState("error"); }
      return;
    }
    const res = await fetch("/api/profile", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(s) });
    setState(res.ok ? "saved" : "error");
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <section className="grid gap-4 rounded-xl border border-line bg-card p-5 sm:grid-cols-2">
        <h2 className="font-semibold sm:col-span-2">About you</h2>
        <label className="text-sm font-medium">Name<input value={s.full_name} onChange={(e) => set("full_name", e.target.value)} maxLength={80} className={input} /></label>
        <label className="text-sm font-medium">Country (for jobs)
          <select value={s.country} onChange={(e) => set("country", e.target.value)} className={input}>{countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}</select>
        </label>
        <label className="text-sm font-medium">Target role
          <select value={s.target_role} onChange={(e) => set("target_role", e.target.value)} className={input}>
            <option value="">Choose a role</option>{roles.map((r) => <option key={r}>{r}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium">Hours per week for learning
          <input type="number" min={1} max={80} value={s.weekly_hours} onChange={(e) => set("weekly_hours", Math.max(1, Math.min(80, Number(e.target.value) || 1)))} className={input} />
        </label>
      </section>

      <section className="rounded-xl border border-line bg-card p-5">
        <h2 className="font-semibold">Dream companies <span className="text-sm font-normal text-muted">(up to 5)</span></h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {companies.map((c) => {
            const on = s.dream_companies.includes(c);
            return (
              <button key={c} type="button" aria-pressed={on} onClick={() => set("dream_companies", on ? s.dream_companies.filter((x) => x !== c) : s.dream_companies.length < 5 ? [...s.dream_companies, c] : s.dream_companies)}
                className={`rounded-full border px-3 py-1.5 text-sm ${on ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"}`}>{c}</button>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-line bg-card p-5">
        <h2 className="font-semibold">Interests</h2>
        <p className="mt-1 text-sm text-muted">The Learning Planner uses these to pick examples and projects you will enjoy.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {s.interests.map((i) => (
            <span key={i} className="flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1 text-sm text-accent">{i}
              <button type="button" aria-label={`Remove ${i}`} onClick={() => set("interests", s.interests.filter((x) => x !== i))} className="ml-1">×</button></span>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input value={interest} onChange={(e) => setInterest(e.target.value)} maxLength={40} placeholder="e.g. cyber security, games, finance" className={`${input} mt-0`} aria-label="Add an interest" />
          <button type="button" onClick={() => { const v = interest.trim(); if (v && !s.interests.includes(v) && s.interests.length < 10) set("interests", [...s.interests, v]); setInterest(""); }}
            className="rounded-lg border border-line bg-white px-4 text-sm hover:border-ink">Add</button>
        </div>
      </section>

      <section className="grid gap-4 rounded-xl border border-line bg-card p-5 sm:grid-cols-2">
        <h2 className="font-semibold sm:col-span-2">Coding profiles</h2>
        {HANDLES.map((h) => {
          const v = s[h.key] as string;
          return (
            <label key={h.key} className="text-sm font-medium">{h.label} username
              <input value={v} onChange={(e) => set(h.key, e.target.value.replace(/[^A-Za-z0-9_.-]/g, "") as never)} maxLength={40} className={input} />
              {v && <a href={h.profile(v)} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-accent underline underline-offset-2">Open your {h.label} profile</a>}
            </label>
          );
        })}
      </section>

      <div className="flex items-center gap-3">
        <button disabled={state === "saving"} className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-ink disabled:opacity-60">Save settings</button>
        <span role="status" className="text-sm text-muted">
          {state === "saved" ? (account ? "Saved to your account." : "Saved in this browser.") : state === "error" ? "Could not save. Please try again." : account === false ? "Guest mode: settings are kept in this browser." : ""}
        </span>
      </div>
    </form>
  );
}
