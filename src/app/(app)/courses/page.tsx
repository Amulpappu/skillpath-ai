import type { Metadata } from "next";
import { ALL_SKILLS, exerciseFor, resourcesFor } from "@/lib/catalog";
import { AI_SKILLS, CATALOG_REVIEWED, PROGRAMMING_LANGUAGES } from "@/lib/catalogGlobal";
import { labsFor } from "@/lib/labs";

export const metadata: Metadata = { title: "Free courses and labs" };

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ s?: string }> }) {
  const { s } = await searchParams;
  const skill = s && ALL_SKILLS.includes(s) ? s : "Data Structures & Algorithms";
  const groups = [
    { label: "AI skills", skills: AI_SKILLS.filter((x) => ALL_SKILLS.includes(x)) },
    { label: "Languages", skills: PROGRAMMING_LANGUAGES.filter((x) => ALL_SKILLS.includes(x)) },
    { label: "Everything else", skills: ALL_SKILLS.filter((x) => !AI_SKILLS.includes(x) && !PROGRAMMING_LANGUAGES.includes(x)) },
  ];
  const steps = [
    { n: "1", title: "Learn", body: "Free official courses and docs.", items: resourcesFor(skill).map((r) => ({ title: r.title, sub: r.provider, url: r.url })) },
    { n: "2", title: "Try it in a lab", body: "See it run, break it, fix it.", items: labsFor(skill).map((l) => ({ title: l.title, sub: l.what, url: l.url })) },
  ];
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight">Free courses and labs</h1>
      <p className="mt-1 text-muted">Every skill follows Learn → Try it in a lab → Practise → Quiz. All free. Catalogue reviewed {CATALOG_REVIEWED}.</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <nav aria-label="Skills" className="max-h-[70vh] overflow-y-auto rounded-xl border border-line bg-card p-3">
          {groups.map((g) => (
            <div key={g.label} className="mb-3">
              <p className="px-2 pb-1 font-mono text-[11px] uppercase tracking-wider text-muted">{g.label}</p>
              {g.skills.map((x) => (
                <a key={x} href={`/courses?s=${encodeURIComponent(x)}`} aria-current={x === skill ? "page" : undefined}
                  className={`block rounded-md px-2 py-1.5 text-sm ${x === skill ? "bg-ink text-white" : "hover:bg-paper"}`}>{x}</a>
              ))}
            </div>
          ))}
        </nav>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{skill}</h2>
          {steps.map((st) => (
            <section key={st.n} className="rounded-xl border border-line bg-card p-5">
              <p className="font-mono text-xs text-muted">STEP {st.n}</p>
              <h3 className="font-semibold">{st.title}</h3><p className="text-sm text-muted">{st.body}</p>
              <ul className="mt-3 space-y-3">
                {st.items.map((it) => (
                  <li key={it.url}><a href={it.url} target="_blank" rel="noopener noreferrer" className="font-medium text-accent underline underline-offset-2">{it.title}</a><span className="block text-sm text-muted">{it.sub}</span></li>
                ))}
              </ul>
            </section>
          ))}
          <section className="rounded-xl border border-line bg-card p-5">
            <p className="font-mono text-xs text-muted">STEP 3 AND 4</p>
            <h3 className="font-semibold">Practise, then prove it</h3>
            <p className="mt-1 text-sm">{exerciseFor(skill)}</p>
            <div className="mt-3 flex gap-2">
              <a href="/practice" className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm hover:border-ink">Coding practice</a>
              <a href="/assessments" className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-ink">Take the {skill} quiz</a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
