"use client";

import { useEffect, useRef } from "react";
import type { AgentEvent } from "@/lib/types";
import { Card } from "./ui";

const ICON: Record<string, string> = {
  "Skill Analyst": "SA", "Career Matcher": "CM", "Learning Planner": "LP", "Assessment Agent": "AA", "AI Mentor": "AM",
};

/**
 * Professional agent timeline: one row per hand-off with a status marker, the agent, what it did,
 * where the answer came from (Gemini or the built-in rule engine) and its step number.
 * Announced politely to screen readers as rows arrive.
 */
export function AgentLog({ events, busy }: { events: AgentEvent[]; busy: boolean }) {
  const listRef = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [events.length]);

  // Collapse "started" + "done" pairs into one row per step.
  const rows: { agent: string; detail: string; done: boolean; source?: string }[] = [];
  for (const e of events) {
    const last = rows[rows.length - 1];
    if (last && last.agent === e.agent && !last.done && e.status === "done") Object.assign(last, { detail: e.detail, done: true, source: e.source });
    else rows.push({ agent: e.agent, detail: e.detail, done: e.status === "done", source: e.source });
  }

  return (
    <Card
      title="Agent activity"
      id="agents-heading"
      aside={
        <span className="flex items-center gap-2 text-sm text-muted">
          <span className={`h-2 w-2 rounded-full ${busy ? "animate-pulse bg-warn" : rows.length ? "bg-accent" : "bg-line"}`} aria-hidden="true" />
          {busy ? "Running" : rows.length ? `Completed · ${rows.filter((r) => r.done).length} steps` : "Waiting for a profile"}
        </span>
      }
    >
      {rows.length === 0 ? (
        <p className="text-sm text-muted">
          Specialist agents work in sequence: Skill Analyst, Career Matcher, Learning Planner, Assessment Agent and AI Mentor. Each hand-off appears here.
        </p>
      ) : (
        <ol ref={listRef} aria-live="polite" tabIndex={0} aria-label="Agent activity log" className="relative max-h-80 space-y-0 overflow-y-auto">
          {rows.map((r, i) => (
            <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
              {i < rows.length - 1 && <span aria-hidden="true" className="absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-px bg-line" />}
              <span aria-hidden="true" className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[11px] font-semibold ${r.done ? "border-accent bg-accent-soft text-accent" : "animate-pulse border-warn bg-warn-soft text-warn"}`}>
                {ICON[r.agent] ?? r.agent.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="text-sm font-semibold">{r.agent}<span className="sr-only">{r.done ? " finished" : " working"}</span></p>
                  <span className="font-mono text-[11px] tabular-nums text-muted">Step {i + 1}</span>
                </div>
                <p className="mt-0.5 text-sm leading-snug text-muted">{r.detail}</p>
                {r.source && (
                  <span className="mt-1 inline-block rounded border border-line px-1.5 py-0.5 text-[11px] text-muted">
                    {r.source === "gemini" ? "Gemini" : "Rule engine"}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
