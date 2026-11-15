import type { Metadata } from "next";
import Link from "next/link";
import { AGENTS } from "@/lib/agents/registry";
import { getT } from "@/lib/i18n/server";
import { currentUser, supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard" };

export default async function Dashboard() {
  const { t } = await getT();
  const user = await currentUser();
  let profile: { full_name: string | null; target_role: string | null; dream_companies: string[] } | null = null;
  if (user) {
    const { data } = await (await supabaseServer()).from("profiles").select("full_name, target_role, dream_companies").eq("id", user.id).single();
    profile = data;
  }
  const first = (profile?.full_name ?? "").split(" ")[0];
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight">{first ? `Welcome, ${first}` : t("nav.dashboard")}</h1>
      <p className="mt-1 text-muted">{profile?.target_role ? `Working towards ${profile.target_role}` : "Set your skills and target role to start your plan."}</p>

      <section className="mt-8 rounded-xl border border-line bg-card p-6">
        <h2 className="font-semibold">Next step</h2>
        <p className="mt-1 text-sm text-muted">Enter your current skills and dream role. The agents build your roadmap in under a minute.</p>
        <Link href="/plan" className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-ink">Build my plan</Link>
      </section>

      <section aria-labelledby="team" className="mt-8">
        <h2 id="team" className="font-semibold">Your agent team</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {AGENTS.map((a) => (
            <li key={a.id} className="rounded-lg border border-line bg-card p-4">
              <p className="flex items-center justify-between text-sm font-semibold">
                {a.name}
                <span className="font-mono text-[11px] font-normal uppercase tracking-wider text-muted">{a.stage}</span>
              </p>
              <p className="mt-1 text-sm leading-snug text-muted">{a.job}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
