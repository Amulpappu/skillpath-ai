"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { APP_STATUS } from "@/lib/jobs/board";

const input = "w-full rounded-md border border-line bg-card px-3 py-1.5 text-sm";

export function ApplyForm({ id, applied, defaultEmail }: { id: string; applied: boolean; defaultEmail: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [email, setEmail] = useState(defaultEmail);
  const [resume, setResume] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(method: "POST" | "DELETE", e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true); setError(null);
    const res = await fetch(`/api/jobs/${id}/apply`, { method, headers: { "Content-Type": "application/json" }, body: method === "POST" ? JSON.stringify({ note, contact_email: email, resume_url: resume }) : undefined });
    setBusy(false);
    if (!res.ok) { setError((await res.json().catch(() => null))?.error ?? "Something went wrong."); return; }
    router.refresh();
  }

  if (applied) return (
    <button type="button" onClick={() => send("DELETE")} disabled={busy} className="mt-3 rounded-md border border-line bg-subtle px-3 py-1 text-sm font-medium text-bad hover:border-bad disabled:opacity-60">Withdraw application</button>
  );
  return (
    <form onSubmit={(e) => send("POST", e)} className="rounded-md border border-line bg-card">
      <div className="border-b border-line px-4 py-3 font-semibold">Apply</div>
      <div className="space-y-3 p-4">
        <p className="text-xs text-muted">The poster sees your public profile (name, photo, headline), this note and your email. Never your scores or progress.</p>
        <label className="block text-sm"><span className="mb-1 block font-semibold">Why you&apos;re a fit</span><textarea className={`${input} min-h-28`} value={note} onChange={(e) => setNote(e.target.value)} required minLength={10} maxLength={1000} /></label>
        <label className="block text-sm"><span className="mb-1 block font-semibold">Contact email</span><input type="email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label className="block text-sm"><span className="mb-1 block font-semibold">Résumé link <span className="font-normal text-muted">(optional)</span></span><input className={input} value={resume} onChange={(e) => setResume(e.target.value)} placeholder="https://drive.google.com/…" /></label>
        {error && <p role="alert" className="text-sm text-bad">{error}</p>}
        <button disabled={busy} className="w-full rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60">{busy ? "Sending…" : "Send application"}</button>
      </div>
    </form>
  );
}

export function PostControls({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function call(method: "PATCH" | "DELETE") {
    if (method === "DELETE" && !window.confirm("Delete this job post and all its applications? This can't be undone.")) return;
    setBusy(true);
    const res = await fetch(`/api/jobs/${id}`, { method, headers: { "Content-Type": "application/json" }, body: method === "PATCH" ? JSON.stringify({ status: status === "open" ? "closed" : "open" }) : undefined });
    setBusy(false);
    if (res.ok) { if (method === "DELETE") router.push("/jobs/mine"); else router.refresh(); }
  }
  return (
    <div className="rounded-md border border-line bg-card p-4 text-sm">
      <p className="font-semibold">Your post</p>
      <p className="mt-1 text-muted">{status === "open" ? "Open: people can apply." : "Closed: hidden from the board."}</p>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => call("PATCH")} disabled={busy} className="rounded-md border border-line bg-subtle px-3 py-1 font-medium hover:bg-card disabled:opacity-60">{status === "open" ? "Close job" : "Reopen job"}</button>
        <button type="button" onClick={() => call("DELETE")} disabled={busy} className="rounded-md border border-line bg-subtle px-3 py-1 font-medium text-bad hover:border-bad disabled:opacity-60">Delete</button>
      </div>
    </div>
  );
}

type Applicant = { id: string; username: string; full_name: string | null; headline: string | null; avatar_url: string | null; avatar_choice: string | null; note: string; contact_email: string; resume_url: string | null; status: keyof typeof APP_STATUS; created_at: string };

export function Applicants({ rows }: { rows: Applicant[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  async function mark(id: string, status: keyof typeof APP_STATUS) {
    setBusy(id);
    await fetch(`/api/applications/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setBusy(null); router.refresh();
  }
  return (
    <section className="rounded-md border border-line bg-card">
      <h3 className="border-b border-line bg-subtle px-4 py-2.5 text-sm font-semibold">Applicants ({rows.length})</h3>
      {rows.length === 0 ? <p className="p-5 text-sm text-muted">No applications yet.</p> : (
        <ul className="divide-y divide-line">
          {rows.map((a) => (
            <li key={a.id} className="flex flex-wrap gap-3 p-4">
              <Avatar choice={a.avatar_choice} photo={a.avatar_url} name={a.full_name} size={40} />
              <div className="min-w-0 flex-1">
                <Link href={`/u/${a.username}`} className="font-semibold text-link hover:underline">{a.full_name ?? a.username}</Link>
                <span className="ms-2 text-sm text-muted">@{a.username}</span>
                {a.headline && <p className="text-sm text-muted">{a.headline}</p>}
                <p className="mt-2 whitespace-pre-line text-sm">{a.note}</p>
                <p className="mt-2 text-sm"><a className="text-link hover:underline" href={`mailto:${a.contact_email}`}>{a.contact_email}</a>
                  {a.resume_url && <> · <a className="text-link hover:underline" href={a.resume_url} target="_blank" rel="noopener noreferrer nofollow">Résumé</a></>}</p>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className={`rounded-full border px-2 py-0.5 text-xs ${a.status === "shortlisted" ? "border-accent text-accent" : a.status === "rejected" ? "border-bad text-bad" : "border-line text-muted"}`}>{APP_STATUS[a.status]}</span>
                {a.status !== "shortlisted" && <button type="button" disabled={busy === a.id} onClick={() => mark(a.id, "shortlisted")} className="rounded-md border border-line bg-subtle px-2 py-0.5 hover:bg-card">Shortlist</button>}
                {a.status !== "rejected" && <button type="button" disabled={busy === a.id} onClick={() => mark(a.id, "rejected")} className="rounded-md border border-line bg-subtle px-2 py-0.5 hover:bg-card">Not selected</button>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
