import type { Metadata } from "next";
import Link from "next/link";
import { AssessmentRunner } from "@/components/AssessmentRunner";
import { COMPANIES, SECTIONS } from "@/lib/company/catalog";

export const metadata: Metadata = { title: "Company prep" };

export default async function CompanyPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  const company = COMPANIES.find((x) => x.name === c) ?? COMPANIES[0];
  const sections = company.sections.map((k) => SECTIONS[k]);
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight">Company prep</h1>
      <p className="mt-1 text-muted">Pick your dream company. The Company Prep Agent shows its typical hiring rounds and gives you practice tests for each one.</p>

      <nav aria-label="Companies" className="mt-6 flex flex-wrap gap-2">
        {COMPANIES.map((x) => (
          <Link key={x.name} href={`/company?c=${encodeURIComponent(x.name)}`} aria-current={x.name === company.name ? "page" : undefined}
            className={`rounded-full border px-3 py-1.5 text-sm ${x.name === company.name ? "border-inverse bg-inverse text-on-inverse" : "border-line bg-card hover:border-ink"}`}>{x.name}</Link>
        ))}
      </nav>

      <section className="mt-6 grid gap-6 rounded-md border border-line bg-card p-6 md:grid-cols-2">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted">{company.kind}</p>
          <h2 className="mt-1 text-xl font-semibold">{company.name}: typical rounds</h2>
          <ol className="mt-3 space-y-2 text-sm">
            {company.rounds.map((r, i) => <li key={r} className="flex gap-3"><span className="font-mono text-xs text-muted">{i + 1}</span>{r}</li>)}
          </ol>
          <p className="mt-4 text-xs leading-relaxed text-muted">Patterns change each hiring season. Always check the current pattern on the{" "}
            <a href={company.careers} target="_blank" rel="noopener noreferrer" className="text-link hover:underline">official {company.name} careers page</a>.</p>
        </div>
        <div>
          <h3 className="font-semibold">What to practise</h3>
          <ul className="mt-3 space-y-2 text-sm">{sections.map((s) => <li key={s.skill} className="border-l-2 border-accent pl-3">{s.label}</li>)}</ul>
          <Link href="/practice" className="mt-4 inline-block text-sm font-medium text-link hover:underline">Coding problems in order →</Link>
        </div>
      </section>

      <section aria-labelledby="tests" className="mt-8">
        <h2 id="tests" className="font-semibold">Practice tests</h2>
        <div className="mt-4 space-y-8">
          {(["aptitude", "english", "problem-understanding"] as const).map((cat) => {
            const list = sections.filter((s) => s.category === cat);
            if (!list.length) return null;
            const label = { aptitude: "Aptitude and reasoning", english: "English", "problem-understanding": "Understanding the problem" }[cat];
            return (
              <div key={cat}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{label}</h3>
                <AssessmentRunner category={cat} startLabel="Start test" skills={list.map((s) => s.skill)} groups={[{ label, skills: list.map((s) => s.skill) }]} />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
