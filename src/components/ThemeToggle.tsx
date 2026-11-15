"use client";

import { useState } from "react";
import type { ThemeChoice } from "@/lib/theme";

const ORDER: ThemeChoice[] = ["system", "light", "dark"];
const LABEL: Record<ThemeChoice, string> = { system: "Device theme", light: "Light theme", dark: "Dark theme" };

function Icon({ choice }: { choice: ThemeChoice }) {
  if (choice === "light") return <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M8 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-1.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm5.657-8.157a.75.75 0 0 1 0 1.061l-1.061 1.06a.749.749 0 0 1-1.06-1.06l1.06-1.06a.75.75 0 0 1 1.06 0Zm-9.193 9.193a.75.75 0 0 1 0 1.06l-1.06 1.061a.75.75 0 1 1-1.061-1.06l1.06-1.061a.75.75 0 0 1 1.061 0ZM8 0a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V.75A.75.75 0 0 1 8 0ZM3 8a.75.75 0 0 1-.75.75H.75a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 3 8Zm13 0a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 16 8Zm-8 5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 13Zm3.536-1.464a.75.75 0 0 1 1.06 0l1.061 1.06a.75.75 0 0 1-1.06 1.061l-1.061-1.06a.75.75 0 0 1 0-1.061ZM2.343 2.343a.75.75 0 0 1 1.061 0l1.06 1.061a.751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018l-1.06-1.06a.75.75 0 0 1 0-1.06Z"/></svg>;
  if (choice === "dark") return <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M9.598 1.591a.749.749 0 0 1 .785-.175 7.001 7.001 0 1 1-8.967 8.967.75.75 0 0 1 .961-.96 5.5 5.5 0 0 0 7.046-7.046.75.75 0 0 1 .175-.786Zm1.616 1.945a7 7 0 0 1-7.678 7.678 5.499 5.499 0 1 0 7.678-7.678Z"/></svg>;
  return <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M0 2.75C0 1.784.784 1 1.75 1h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 13H9.5v1.5h1.75a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1 0-1.5H6.5V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25v-8.5a.25.25 0 0 0-.25-.25Z"/></svg>;
}

export function applyTheme(choice: ThemeChoice) {
  document.cookie = `sp_theme=${choice}; path=/; max-age=31536000; samesite=lax`;
  if (choice === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", choice);
}

/** Header button: cycles device → light → dark. */
export function ThemeToggle({ initial }: { initial: ThemeChoice }) {
  const [choice, setChoice] = useState<ThemeChoice>(initial);
  const next = ORDER[(ORDER.indexOf(choice) + 1) % ORDER.length];
  return (
    <button type="button" onClick={() => { applyTheme(next); setChoice(next); }}
      title={`${LABEL[choice]} (switch to ${LABEL[next].toLowerCase()})`} aria-label={`${LABEL[choice]}. Switch to ${LABEL[next].toLowerCase()}`}
      className="grid h-8 w-8 place-items-center rounded-md border border-line bg-card text-muted hover:bg-subtle hover:text-ink">
      <Icon choice={choice} />
    </button>
  );
}

/** Settings control: three explicit choices. */
export function ThemePicker({ initial, compact = false }: { initial: ThemeChoice; compact?: boolean }) {
  const [choice, setChoice] = useState<ThemeChoice>(initial);
  return (
    <div role="radiogroup" aria-label="Theme" className="grid gap-3 sm:grid-cols-3">
      {ORDER.map((c) => (
        <button key={c} type="button" role="radio" aria-checked={choice === c} onClick={() => { applyTheme(c); setChoice(c); }}
          className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm ${choice === c ? "border-link bg-subtle font-semibold" : "border-line bg-card hover:bg-subtle"}`}>
          <Icon choice={c} /> {compact ? { system: "Device", light: "Light", dark: "Dark" }[c] : LABEL[c]}
        </button>
      ))}
    </div>
  );
}
