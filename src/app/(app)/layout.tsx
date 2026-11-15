import Link from "next/link";
import type { ReactNode } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import { getT } from "@/lib/i18n/server";
import type { MessageKey } from "@/lib/i18n/messages";
import { currentUser } from "@/lib/supabase/server";

/** Sections of the signed-in app. Only built sections are listed; the rest arrive in later phases. */
const NAV: { href: string; key: MessageKey; ready: boolean }[] = [
  { href: "/dashboard", key: "nav.dashboard", ready: true },
  { href: "/plan", key: "nav.roadmap", ready: true },
  { href: "/practice", key: "nav.practice", ready: true },
  { href: "/assessments", key: "nav.assessments", ready: true },
  { href: "/company", key: "nav.company", ready: true },
  { href: "/jobs", key: "nav.jobs", ready: false },
  { href: "/courses", key: "nav.courses", ready: false },
  { href: "/progress", key: "nav.progress", ready: true },
];

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { t, locale } = await getT();
  const user = await currentUser();
  const name = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? "Guest";
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-line bg-card lg:min-h-screen lg:border-b-0 lg:border-e">
        <div className="flex items-center gap-2.5 px-5 py-4 font-semibold tracking-tight"><Logo className="h-6 w-6" /> SkillPath AI</div>
        <nav aria-label="Main" className="px-3 pb-4">
          <ul className="flex gap-1 overflow-x-auto lg:block lg:space-y-0.5">
            {NAV.filter((n) => n.ready).map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="block whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-ink hover:bg-paper">{t(n.key)}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div>
        <header className="flex items-center justify-end gap-4 border-b border-line bg-paper px-6 py-3">
          <LanguageSwitcher current={locale} label={t("nav.language")} />
          <span className="text-sm text-muted">{name}</span>
          {user && (
            <form action="/auth/signout" method="post">
              <button className="rounded-md border border-line bg-card px-3 py-1.5 text-sm hover:border-ink">{t("nav.signOut")}</button>
            </form>
          )}
        </header>
        <main id="main" className="px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
