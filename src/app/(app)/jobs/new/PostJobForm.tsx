"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { JOB_TYPES, WORK_MODES } from "@/lib/jobs/board";

const input = "w-full rounded-md border border-line bg-card px-3 py-1.5 text-sm";
const label = "mb-1 block text-sm font-semibold";

export function PostJobForm() {
  const router = useRouter();
  const [f, setF] = useState({ title: "", company: "", location: "", work_mode: "onsite", job_type: "full-time", description: "", skills: "", apply_url: "", apply_by: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const skills = f.skills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 10);
    const res = await fetch("/api/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, skills }) });
    const body = await res.json().catch(() => null);
    if (!res.ok) { setBusy(false); setError(body?.error ?? "Could not post the job."); return; }
    router.push(`/jobs/post/${body.id}`);
  }

  return (
    <form onSubmit={submit} className="rounded-md border border-line bg-card">
      <div className="border-b border-line px-5 py-4"><h2 className="text-lg font-semibold">Post a job</h2><p className="text-sm text-muted">People on SkillPath can apply in-app. You will see their profile, note and contact email.</p></div>
      <div className="space-y-4 p-5">
        <label className="block"><span className={label}>Job title</span><input className={input} value={f.title} onChange={set("title")} required minLength={3} maxLength={120} placeholder="Junior Backend Developer" /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block"><span className={label}>Company</span><input className={input} value={f.company} onChange={set("company")} required maxLength={120} /></label>
          <label className="block"><span className={label}>Location</span><input className={input} value={f.location} onChange={set("location")} required maxLength={120} placeholder="Coimbatore, India" /></label>
          <label className="block"><span className={label}>Type</span><select className={input} value={f.job_type} onChange={set("job_type")}>{Object.entries(JOB_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
          <label className="block"><span className={label}>Work mode</span><select className={input} value={f.work_mode} onChange={set("work_mode")}>{Object.entries(WORK_MODES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        </div>
        <label className="block"><span className={label}>Description</span><textarea className={`${input} min-h-40`} value={f.description} onChange={set("description")} required minLength={20} maxLength={4000} placeholder="What the role involves, who it suits, how you will select…" /><span className="text-xs text-muted">{f.description.length}/4000</span></label>
        <label className="block"><span className={label}>Skills <span className="font-normal text-muted">(comma separated, up to 10)</span></span><input className={input} value={f.skills} onChange={set("skills")} placeholder="Python, SQL, REST APIs" /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block"><span className={label}>Company careers link <span className="font-normal text-muted">(optional)</span></span><input className={input} value={f.apply_url} onChange={set("apply_url")} placeholder="https://…" /></label>
          <label className="block"><span className={label}>Apply by <span className="font-normal text-muted">(optional)</span></span><input type="date" className={input} value={f.apply_by} onChange={set("apply_by")} /></label>
        </div>
        <p className="text-xs text-muted">Only post real openings you are allowed to share. Never ask applicants for money.</p>
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-line bg-subtle px-5 py-3">
        {error && <span role="alert" className="me-auto text-sm text-bad">{error}</span>}
        <button disabled={busy} className="rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60">{busy ? "Posting…" : "Post job"}</button>
      </div>
    </form>
  );
}
