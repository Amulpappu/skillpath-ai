"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Logo } from "@/components/Logo";

type Status = "student" | "fresher" | "working" | "switching";
const STATUS: { id: Status; label: string; hint: string }[] = [
  { id: "student", label: "Student", hint: "Still in school or college" },
  { id: "fresher", label: "Fresher", hint: "Graduated, looking for a first job" },
  { id: "working", label: "Working", hint: "Employed and levelling up" },
  { id: "switching", label: "Switching careers", hint: "Moving into a new field" },
];

const TOUR = [
  { title: "Roadmap", body: "Tell the agents your skills and dream role. They build a week-by-week plan sized to your free time.", where: "Roadmap in the sidebar" },
  { title: "Coding practice", body: "An ordered ladder of LeetCode, GFG, CodeChef and HackerRank problems. Reorder topics and tick off what you solve.", where: "Coding practice" },
  { title: "Tests and company prep", body: "Levelled quizzes for every skill, plus aptitude, English and problem-understanding tests for your dream company.", where: "Assessments and Company prep" },
  { title: "Jobs", body: "Live openings for your role, job-site links for your country, and posts from people on SkillPath.", where: "Jobs" },
];

const XP = { basics: 30, interests: 20, tourCard: 10, finish: 10 };
const input = "w-full rounded-md border border-line bg-card px-3 py-1.5 text-sm text-ink";
const label = "mb-1 block text-sm font-semibold";

export function Onboarding(props: {
  initialName: string; initialCountry: string; initialRole: string;
  roles: string[]; countries: { code: string; name: string }[]; companies: string[]; skills: string[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(props.initialName);
  const [status, setStatus] = useState<Status | null>(null);
  const [institution, setInstitution] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [country, setCountry] = useState(props.initialCountry);
  const [role, setRole] = useState(props.initialRole);
  const [hours, setHours] = useState(8);
  const [interests, setInterests] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [filter, setFilter] = useState("");
  const [seen, setSeen] = useState<boolean[]>(TOUR.map(() => false));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const basicsOk = name.trim().length > 0 && status !== null && role !== "" && country !== "";
  const xp = (step > 0 ? XP.basics : 0) + (step > 1 ? XP.interests : 0) + seen.filter(Boolean).length * XP.tourCard;
  const shown = useMemo(() => {
    const f = filter.trim().toLowerCase();
    return (f ? props.skills.filter((s) => s.toLowerCase().includes(f)) : props.skills).slice(0, 40);
  }, [filter, props.skills]);

  const toggle = (list: string[], set: (v: string[]) => void, v: string, max: number) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : list.length < max ? [...list, v] : list);

  async function finish() {
    setSaving(true); setError(null);
    const res = await fetch("/api/onboarding", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: name, status, institution, grad_year: gradYear ? Number(gradYear) : null, country,
        target_role: role, weekly_hours: hours, interests, dream_companies: companies, tour_seen: true,
      }),
    });
    if (!res.ok) { setSaving(false); setError((await res.json().catch(() => null))?.error ?? "Could not save. Please try again."); return; }
    router.replace("/plan");
    router.refresh();
  }

  const steps = ["About you", "Interests", "Quick tour", "Start"];
  return (
    <main id="main" className="min-h-screen bg-paper">
      <div className="mx-auto max-w-2xl px-5 py-10">
        <div className="mb-6 flex items-center gap-2.5 font-semibold"><Logo className="h-6 w-6" /> SkillPath AI</div>

        <div className="mb-6 rounded-md border border-line bg-card p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold">Setup · step {step + 1} of 4</span>
            <span className="font-mono text-accent">{xp} / 100 XP</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-subtle" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={xp} aria-label="Setup XP">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${xp}%` }} />
          </div>
          <ol className="mt-3 flex gap-4 text-xs text-muted">
            {steps.map((s, i) => <li key={s} className={i === step ? "font-semibold text-ink" : i < step ? "text-accent" : ""}>{i < step ? "✓ " : ""}{s}</li>)}
          </ol>
        </div>

        <section className="rounded-md border border-line bg-card">
          {step === 0 && (
            <div className="space-y-5 p-6">
              <div><h1 className="text-xl font-semibold">Welcome! Tell us about you</h1><p className="mt-1 text-sm text-muted">This shapes your roadmap, tests and jobs. Only you can see it. <span className="text-accent">+{XP.basics} XP</span></p></div>
              <label className="block"><span className={label}>Your name</span><input className={input} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required /></label>
              <fieldset><legend className={label}>Right now I am</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {STATUS.map((s) => (
                    <button key={s.id} type="button" aria-pressed={status === s.id} onClick={() => setStatus(s.id)}
                      className={`rounded-md border px-3 py-2 text-start ${status === s.id ? "border-link bg-subtle" : "border-line hover:bg-subtle"}`}>
                      <span className="block text-sm font-semibold">{s.label}</span><span className="text-xs text-muted">{s.hint}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
                <label className="block"><span className={label}>{status === "working" ? "Company" : "College or school"} <span className="font-normal text-muted">(optional)</span></span><input className={input} value={institution} onChange={(e) => setInstitution(e.target.value)} maxLength={120} /></label>
                <label className="block"><span className={label}>{status === "working" ? "Graduated" : "Graduation year"} <span className="font-normal text-muted">(optional)</span></span><input className={input} inputMode="numeric" value={gradYear} onChange={(e) => setGradYear(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="2030" /></label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block"><span className={label}>Dream role</span>
                  <select className={input} value={role} onChange={(e) => setRole(e.target.value)} required><option value="">Choose a role…</option>{props.roles.map((r) => <option key={r}>{r}</option>)}</select></label>
                <label className="block"><span className={label}>Country</span>
                  <select className={input} value={country} onChange={(e) => setCountry(e.target.value)}>{props.countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}</select></label>
              </div>
              <label className="block"><span className={label}>Time for learning: <span className="font-mono">{hours} hours a week</span></span>
                <input type="range" min={1} max={40} value={hours} onChange={(e) => setHours(Number(e.target.value))} className="w-full accent-[var(--accent)]" /></label>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5 p-6">
              <div><h1 className="text-xl font-semibold">What do you want to learn?</h1><p className="mt-1 text-sm text-muted">Pick 1 to 10 skills. Dream companies are optional. <span className="text-accent">+{XP.interests} XP</span></p></div>
              <div>
                <input className={input} placeholder="Filter skills…" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter skills" />
                <div className="mt-3 flex flex-wrap gap-2">
                  {shown.map((s) => (
                    <button key={s} type="button" aria-pressed={interests.includes(s)} onClick={() => toggle(interests, setInterests, s, 10)}
                      className={`rounded-full border px-3 py-1 text-sm ${interests.includes(s) ? "border-link bg-subtle font-semibold text-link" : "border-line hover:bg-subtle"}`}>{interests.includes(s) ? "✓ " : ""}{s}</button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted">{interests.length} of 10 chosen</p>
              </div>
              <div><p className={label}>Dream companies <span className="font-normal text-muted">(up to 5)</span></p>
                <div className="flex flex-wrap gap-2">
                  {props.companies.map((c) => (
                    <button key={c} type="button" aria-pressed={companies.includes(c)} onClick={() => toggle(companies, setCompanies, c, 5)}
                      className={`rounded-full border px-3 py-1 text-sm ${companies.includes(c) ? "border-link bg-subtle font-semibold text-link" : "border-line hover:bg-subtle"}`}>{c}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 p-6">
              <div><h1 className="text-xl font-semibold">A 1-minute tour</h1><p className="mt-1 text-sm text-muted">Mark each card as read. <span className="text-accent">+{XP.tourCard} XP each</span></p></div>
              <ol className="grid gap-3 sm:grid-cols-2">
                {TOUR.map((c, i) => (
                  <li key={c.title} className={`flex flex-col rounded-md border p-4 ${seen[i] ? "border-accent" : "border-line"}`}>
                    <span className="text-xs font-mono text-muted">{i + 1} / {TOUR.length}</span>
                    <h2 className="mt-1 font-semibold">{c.title}</h2>
                    <p className="mt-1 flex-1 text-sm text-muted">{c.body}</p>
                    <p className="mt-2 text-xs text-muted">Find it in: <b className="text-ink">{c.where}</b></p>
                    <button type="button" disabled={seen[i]} onClick={() => setSeen(seen.map((v, j) => (j === i ? true : v)))}
                      className="mt-3 self-start rounded-md border border-line bg-subtle px-3 py-1 text-sm font-medium hover:bg-card disabled:border-accent disabled:text-accent">
                      {seen[i] ? `✓ Got it · +${XP.tourCard} XP` : "Got it"}
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 p-6">
              <h1 className="text-xl font-semibold">You&apos;re ready, {name.split(" ")[0]}!</h1>
              <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[140px_1fr]">
                <dt className="text-muted">Dream role</dt><dd className="font-medium">{role}</dd>
                <dt className="text-muted">Time a week</dt><dd className="font-medium">{hours} hours</dd>
                <dt className="text-muted">Skills</dt><dd className="font-medium">{interests.join(", ")}</dd>
                {companies.length > 0 && <><dt className="text-muted">Companies</dt><dd className="font-medium">{companies.join(", ")}</dd></>}
              </dl>
              <p className="rounded-md border border-line bg-subtle p-3 text-sm">Finish setup to earn your first <b className="text-accent">100 XP</b>. Your XP is private: there is no leaderboard.</p>
              {error && <p role="alert" className="text-sm text-bad">{error}</p>}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-line bg-subtle px-6 py-3">
            <button type="button" onClick={() => setStep(step - 1)} disabled={step === 0 || saving} className="rounded-md border border-line bg-card px-3 py-1.5 text-sm font-medium hover:bg-subtle disabled:invisible">Back</button>
            {step < 3 ? (
              <button type="button" onClick={() => setStep(step + 1)}
                disabled={(step === 0 && !basicsOk) || (step === 1 && interests.length === 0) || (step === 2 && seen.some((v) => !v))}
                className="rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50">Continue</button>
            ) : (
              <button type="button" onClick={finish} disabled={saving} className="rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60">{saving ? "Saving…" : "Start learning · +10 XP"}</button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
