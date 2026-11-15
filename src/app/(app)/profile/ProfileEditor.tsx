"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { suggestions } from "@/lib/avatar";

type Identity = { username: string; full_name: string; headline: string; bio: string; avatar_choice: string | null; website: string; github_user: string; linkedin_user: string };
const input = "w-full rounded-md border border-line bg-card px-3 py-1.5 text-sm";
const label = "mb-1 block text-sm font-semibold";

export function ProfileEditor({ initial, photo, providerLabel, initialIdeas }: { initial: Identity; photo: string | null; providerLabel: string; initialIdeas: string[] }) {
  const router = useRouter();
  const [f, setF] = useState<Identity>(initial);
  const [ideas, setIdeas] = useState<string[]>(initialIdeas);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof Identity>(k: K, v: Identity[K]) => { setF({ ...f, [k]: v }); setState("idle"); };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setState("saving"); setError(null);
    const res = await fetch("/api/me/identity", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    if (!res.ok) { setState("idle"); setError((await res.json().catch(() => null))?.error ?? "Could not save."); return; }
    setState("saved"); router.refresh();
  }

  const pick = (c: string | null) => set("avatar_choice", c);
  const tile = (selected: boolean) => `rounded-full p-0.5 ${selected ? "ring-2 ring-link" : "hover:ring-2 hover:ring-line"}`;

  return (
    <form onSubmit={save} className="space-y-6">
      <section className="rounded-md border border-line bg-card p-5">
        <h2 className="font-semibold">Profile picture</h2>
        <div className="mt-4 flex flex-wrap items-start gap-6">
          <Avatar choice={f.avatar_choice} photo={photo} name={f.full_name} size={120} />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted">Use your {providerLabel} photo, or pick one of ours.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {photo && (
                <button type="button" onClick={() => pick(null)} className={tile(f.avatar_choice === null)} aria-pressed={f.avatar_choice === null} title={`${providerLabel} photo`}>
                  <Avatar photo={photo} name={f.full_name} size={52} />
                </button>
              )}
              {ideas.map((c) => (
                <button key={c} type="button" onClick={() => pick(c)} className={tile(f.avatar_choice === c)} aria-pressed={f.avatar_choice === c} title="Suggested picture">
                  <Avatar choice={c} name={f.full_name} size={52} />
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setIdeas(suggestions())} className="mt-3 rounded-md border border-line bg-subtle px-3 py-1 text-sm font-medium hover:bg-card">↻ More suggestions</button>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-md border border-line bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block"><span className={label}>Name</span><input className={input} value={f.full_name} onChange={(e) => set("full_name", e.target.value)} maxLength={80} required /></label>
          <label className="block"><span className={label}>Username</span>
            <div className="flex rounded-md border border-line bg-subtle"><span className="px-2.5 py-1.5 text-sm text-muted">@</span>
              <input className="w-full rounded-e-md border-s border-line bg-card px-2 py-1.5 text-sm" value={f.username} onChange={(e) => set("username", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} minLength={3} maxLength={30} required /></div>
          </label>
        </div>
        <label className="block"><span className={label}>Headline</span><input className={input} value={f.headline} onChange={(e) => set("headline", e.target.value)} maxLength={100} placeholder="CSE student · aspiring backend developer" /></label>
        <label className="block"><span className={label}>Bio</span><textarea className={`${input} min-h-24`} value={f.bio} onChange={(e) => set("bio", e.target.value)} maxLength={300} /><span className="text-xs text-muted">{f.bio.length}/300</span></label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block"><span className={label}>Website</span><input className={input} value={f.website} onChange={(e) => set("website", e.target.value)} placeholder="https://…" /></label>
          <label className="block"><span className={label}>GitHub username</span><input className={input} value={f.github_user} onChange={(e) => set("github_user", e.target.value)} /></label>
          <label className="block"><span className={label}>LinkedIn (in/…)</span><input className={input} value={f.linkedin_user} onChange={(e) => set("linkedin_user", e.target.value)} /></label>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button disabled={state === "saving"} className="rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60">{state === "saving" ? "Saving…" : "Update profile"}</button>
        {state === "saved" && <span role="status" className="text-sm text-accent">✓ Saved</span>}
        {error && <span role="alert" className="text-sm text-bad">{error}</span>}
        <Link href={`/u/${initial.username}`} className="ms-auto text-sm text-link hover:underline">View public profile →</Link>
      </div>
    </form>
  );
}
