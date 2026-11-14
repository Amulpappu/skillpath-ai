"use client";

import { useEffect, useRef } from "react";
import type { AgentEvent } from "@/lib/types";
import { Card } from "./ui";

/** Live log of agent hand-offs. Announced politely to screen readers as lines arrive. */
export function AgentLog({ events, busy }: { events: AgentEvent[]; busy: boolean }) {
  const listRef = useRef<HTMLOListElement>(null);

  // Keep the newest hand-off in view.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [events.length]);

  return (
    <Card
      title="Agent activity"
      id="agents-heading"
      aside={<span className="text-sm text-muted">{busy ? "Running" : events.length ? "Idle" : "Waiting for a profile"}</span>}
    >
      {events.length === 0 ? (
        <p className="text-sm text-muted">
          Five agents work in sequence: Skill Analyst, Career Matcher, Learning Planner, Assessment Agent and AI Mentor. Each
          hand-off appears here.
        </p>
      ) : (
        <ol ref={listRef} aria-live="polite" className="max-h-72 space-y-2 overflow-y-auto font-mono text-[13px] leading-snug" tabIndex={0} aria-label="Agent activity log">
          {events.map((event, index) => (
            <li key={index} className="flex gap-2">
              <span aria-hidden="true" className={event.status === "done" ? "text-accent" : "text-warn"}>
                {event.status === "done" ? "✓" : "…"}
              </span>
              <span>
                <strong className="font-semibold">{event.agent}</strong>
                <span className="sr-only">{event.status === "done" ? " finished: " : " started: "}</span>{" "}
                {event.detail}
                {event.source && (
                  <span className="ml-2 rounded border border-line px-1.5 py-0.5 text-[11px] text-muted">
                    {event.source === "gemini" ? "Gemini" : "rule engine"}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
