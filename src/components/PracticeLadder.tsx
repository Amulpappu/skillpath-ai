"use client";

import { useEffect, useMemo, useState } from "react";
import { LADDER, OPEN_PRACTICE, WARMUPS, dailyTarget, nextProblems, type Status } from "@/lib/practice/catalog";

const LOCAL_KEY = "skillpath:practice:v1";
const DIFF_STYLE = { Easy: "bg-accent-soft text-accent", Medium: "bg-warn-soft text-warn", Hard: "bg-bad-soft text-bad" } as const;

/**
 * Practice Coach UI: shows only the next few problems (one step at a time), lets the learner reorder topics,
 * and saves progress to the account when signed in or to this browser for guests.
 */
export function PracticeLadder() {
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [order, setOrder] = useState<string[]>(LADDER.map((t) => t.id));
  const [weeklyHours, setWeeklyHours] = useState(8);
  const [pace, setPace] = useState(1);
  const [synced, setSynced] = useState<boolean | null>(null);
  const [language, setLanguage] = useState("Python");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/practice", { cache: "no-store" }).catch(() => null);
      if (res?.ok) {
        const d = await res.json();
        setStatus(d.status); if (d.order?.length) setOrder(d.order); setWeeklyHours(d.weeklyHours); setPace(d.pace); setSynced(true);
        return;
      }
      try {
        const local = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "{}");
        if (local.status) setStatus(local.status); if (local.order?.length) setOrder(local.order); if (local.weeklyHours) setWeeklyHours(local.weeklyHours);
      } catch { /* storage unavailable: start fresh */ }
      setSynced(false);
    })();
  }, []);

  function persist(next: { status?: Record<string, Status>; order?: string[]; weeklyHours?: number }, body?: object) {
    if (synced) { if (body) void fetch("/api/practice", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); return; }
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify({ status, order, weeklyHours, ...next })); } catch { /* ignore */ }
  }

  function mark(id: string, s: Status) {
    const next = { ...status, [id]: s }; setStatus(next); persist({ status: next }, { problemId: id, status: s });
  }
  function move(id: string, dir: -1 | 1) {
    const i = order.indexOf(id), j = i + dir; if (j < 0 || j >= order.length) return;
    const next = [...order]; [next[i], next[j]] = [next[j], next[i]]; setOrder(next); persist({ order: next }, { order: next });
  }

  const target = dailyTarget(weeklyHours, pace);
  const today = useMemo(() => nextProblems(order, status, target), [order, status, target]);
  const solved = Object.values(status).filter((s) => s === "solved").length;
  const total = LADDER.reduce((t, x) => t + x.problems.length, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <section aria-labelledby="today" className="rounded-md border border-line bg-card p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="today" className="font-semibold">Today: {target} problem{target > 1 ? "s" : ""}</h2>
            <p className="text-sm text-muted">{solved} / {total} solved{synced === false ? " · saved in this browser" : synced ? " · synced to your account" : ""}</p>
          </div>
          <p className="mt-1 text-sm text-muted">The Practice Coach unlocks problems one step at a time, easiest first. Solve on the platform, then mark it here.</p>
          <ol className="mt-4 space-y-3">
            {today.map((p, i) => (
              <li key={p.id} className="rounded-md border border-line bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium"><span className="mr-2 font-mono text-xs text-muted">{i + 1}</span>{p.title}</p>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${DIFF_STYLE[p.difficulty]}`}>{p.difficulty}</span>
                </div>
                <p className="mt-1 text-sm text-muted">{p.topic} · {p.platform} · about {p.minutes} min</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover">Solve on {p.platform}<span className="sr-only"> (opens in a new tab)</span></a>
                  <button type="button" onClick={() => mark(p.id, "solved")} className="rounded-md border border-line px-3 py-1.5 text-sm hover:border-ink">Mark solved</button>
                  <button type="button" onClick={() => mark(p.id, "skipped")} className="rounded-md px-3 py-1.5 text-sm text-muted hover:text-ink">Skip</button>
                </div>
              </li>
            ))}
            {today.length === 0 && <li className="text-sm">Ladder complete. Keep going with open practice on the right.</li>}
          </ol>
          <label className="mt-4 flex items-center gap-2 text-sm text-muted">Hours per week
            <input type="number" min={1} max={80} value={weeklyHours} onChange={(e) => { const v = Math.max(1, Math.min(80, Number(e.target.value) || 1)); setWeeklyHours(v); persist({ weeklyHours: v }); }}
              className="w-20 rounded-md border border-line bg-card px-2 py-1 text-ink" />
          </label>
        </section>

        <section aria-labelledby="topics" className="rounded-md border border-line bg-card p-5">
          <h2 id="topics" className="font-semibold">Your topic order</h2>
          <p className="mt-1 text-sm text-muted">Move topics up to practise them sooner. Problems inside a topic stay easiest first.</p>
          <ol className="mt-4 divide-y divide-line">
            {order.map((id, i) => {
              const t = LADDER.find((x) => x.id === id)!;
              const done = t.problems.filter((p) => status[p.id] === "solved").length;
              return (
                <li key={id} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{t.name}</p>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-accent" style={{ width: `${(done / t.problems.length) * 100}%` }} /></div>
                  </div>
                  <span className="w-12 text-right text-xs tabular-nums text-muted">{done}/{t.problems.length}</span>
                  <button type="button" aria-label={`Move ${t.name} up`} disabled={i === 0} onClick={() => move(id, -1)} className="rounded border border-line px-2 py-0.5 text-sm disabled:opacity-30">↑</button>
                  <button type="button" aria-label={`Move ${t.name} down`} disabled={i === order.length - 1} onClick={() => move(id, 1)} className="rounded border border-line px-2 py-0.5 text-sm disabled:opacity-30">↓</button>
                </li>
              );
            })}
          </ol>
        </section>
      </div>

      <aside className="space-y-6">
        <section aria-labelledby="warm" className="rounded-md border border-line bg-card p-5">
          <h2 id="warm" className="font-semibold">Language warm-up</h2>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} aria-label="Language" className="mt-3 w-full rounded-md border border-line bg-card px-3 py-2 text-sm">
            {Object.keys(WARMUPS).map((l) => <option key={l}>{l}</option>)}
          </select>
          <a href={WARMUPS[language].url} target="_blank" rel="noopener noreferrer" className="mt-3 block text-sm font-medium text-link hover:underline">HackerRank {WARMUPS[language].title}</a>
        </section>
        <section aria-labelledby="open" className="rounded-md border border-line bg-card p-5">
          <h2 id="open" className="font-semibold">Open practice</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {OPEN_PRACTICE.map((o) => (
              <li key={o.url}><a href={o.url} target="_blank" rel="noopener noreferrer" className="font-medium text-link hover:underline">{o.platform}</a><span className="block text-muted">{o.title}</span></li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  );
}
