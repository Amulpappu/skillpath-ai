import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { AGENTS } from "@/lib/agents/registry";
import { ALL_SKILLS, ROLES } from "@/lib/catalog";
import { CATALOG_REVIEWED } from "@/lib/catalogGlobal";
import { getT } from "@/lib/i18n/server";

const STAGES = [
  { id: "understand", label: "Understand you" },
  { id: "plan", label: "Plan the path" },
  { id: "learn", label: "Learn and practise" },
  { id: "prove", label: "Prove it" },
  { id: "place", label: "Get placed" },
] as const;

export default async function Landing() {
  const { t } = await getT();
  const stats = [
    { value: ROLES.length, label: t("landing.stat.roles") },
    { value: ALL_SKILLS.length, label: t("landing.stat.skills") },
    { value: AGENTS.length, label: t("landing.stat.agents") },
    { value: "465+", label: t("landing.stat.questions") },
  ];
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="mx-auto max-w-6xl px-5 pb-16 pt-16 sm:pt-24">
          <p className="mb-5 text-sm font-medium text-accent">{t("brand.tagline")}</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">{t("landing.title")}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{t("landing.lead")}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/login" className="rounded-lg bg-accent px-6 py-3 font-medium text-white hover:bg-ink">{t("landing.cta")}</Link>
            <Link href="/plan" className="rounded-lg border border-line bg-card px-6 py-3 font-medium hover:border-ink">{t("landing.guest")}</Link>
          </div>
          <dl className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-card px-6 py-5">
                <dt className="text-sm text-muted">{s.label}</dt>
                <dd className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">{s.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-sm text-muted">Roles, skills and courses reviewed {CATALOG_REVIEWED} for the AI era: every role includes an AI skill, and new roles cover AI engineering, agents and AI strategy.</p>
        </section>

        <section aria-labelledby="how" className="border-t border-line bg-card">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <h2 id="how" className="text-2xl font-semibold tracking-tight">How the agents work together</h2>
            <p className="mt-2 max-w-2xl text-muted">Each agent has one job and hands its result to the next. You can watch every hand-off in your activity timeline.</p>
            <ol className="mt-10 grid gap-8 lg:grid-cols-5">
              {STAGES.map((stage, i) => (
                <li key={stage.id}>
                  <p className="font-mono text-xs uppercase tracking-wider text-muted">0{i + 1}</p>
                  <h3 className="mt-1 font-semibold">{stage.label}</h3>
                  <ul className="mt-4 space-y-4">
                    {AGENTS.filter((a) => a.stage === stage.id).map((a) => (
                      <li key={a.id} className="border-l-2 border-accent pl-3">
                        <p className="text-sm font-semibold">{a.name}</p>
                        <p className="mt-0.5 text-sm leading-snug text-muted">{a.job}</p>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <footer className="mx-auto max-w-6xl px-5 py-10 text-sm text-muted">
          SkillPath AI · built by Lohith K · started at PromptWars × Rathinam Technical Campus
        </footer>
      </main>
    </>
  );
}
