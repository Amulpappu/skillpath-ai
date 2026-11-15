"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { FollowButton } from "@/components/FollowButton";

type Person = { id: string; username: string; full_name: string | null; headline: string | null; avatar_url: string | null; avatar_choice: string | null; i_follow: boolean };
const SCOPES = [{ id: "all", label: "Everyone" }, { id: "following", label: "Following" }, { id: "followers", label: "Followers" }] as const;

export function People() {
  const [q, setQ] = useState("");
  const [scope, setScope] = useState<(typeof SCOPES)[number]["id"]>("all");
  const [people, setPeople] = useState<Person[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/people?q=${encodeURIComponent(q)}&scope=${scope}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error();
        setPeople(await res.json()); setFailed(false);
      } catch (e) { if (!ctrl.signal.aborted) { setFailed(true); setPeople([]); } void e; }
    }, 250);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q, scope]);

  return (
    <div className="rounded-md border border-line bg-card">
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-subtle p-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, @username or headline" aria-label="Search people"
          className="min-w-0 flex-1 rounded-md border border-line bg-card px-3 py-1.5 text-sm" />
        <div role="tablist" className="flex rounded-md border border-line text-sm">
          {SCOPES.map((s) => (
            <button key={s.id} role="tab" aria-selected={scope === s.id} onClick={() => setScope(s.id)}
              className={`px-3 py-1.5 first:rounded-s-md last:rounded-e-md ${scope === s.id ? "bg-inverse text-on-inverse" : "bg-card hover:bg-subtle"}`}>{s.label}</button>
          ))}
        </div>
      </div>
      {people === null ? <p className="p-5 text-sm text-muted">Loading…</p>
        : failed ? <p className="p-5 text-sm text-bad">Could not load people. Please try again.</p>
        : people.length === 0 ? <p className="p-5 text-sm text-muted">{scope === "all" ? "No one matches yet. Invite your friends to SkillPath AI!" : `No one here yet.`}</p>
        : (
          <ul className="divide-y divide-line">
            {people.map((p) => (
              <li key={p.id} className="flex items-center gap-3 p-4">
                <Avatar choice={p.avatar_choice} photo={p.avatar_url} name={p.full_name} size={44} />
                <div className="min-w-0 flex-1">
                  <Link href={`/u/${p.username}`} className="font-semibold text-link hover:underline">{p.full_name ?? p.username}</Link>
                  <span className="ms-2 text-sm text-muted">@{p.username}</span>
                  {p.headline && <p className="truncate text-sm text-muted">{p.headline}</p>}
                </div>
                <FollowButton userId={p.id} initial={p.i_follow} />
              </li>
            ))}
          </ul>
        )}
    </div>
  );
}
