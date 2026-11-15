"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/jobs", label: "Live openings" },
  { href: "/jobs/board", label: "Community board" },
  { href: "/jobs/mine", label: "My posts & applications" },
];

/** GitHub-style underline tabs for the Jobs section. */
export function JobsTabs() {
  const path = usePathname();
  const active = (href: string) => (href === "/jobs" ? path === "/jobs" : path.startsWith(href) || (href === "/jobs/board" && path.startsWith("/jobs/post")));
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-line">
      <nav aria-label="Jobs" className="flex gap-1 overflow-x-auto">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} aria-current={active(t.href) ? "page" : undefined}
            className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm ${active(t.href) ? "border-[#fd8c73] font-semibold text-ink" : "border-transparent text-muted hover:border-line hover:text-ink"}`}>{t.label}</Link>
        ))}
      </nav>
      <Link href="/jobs/new" className="mb-2 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover">Post a job</Link>
    </div>
  );
}
