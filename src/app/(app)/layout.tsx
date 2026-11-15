import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import { Avatar } from "@/components/Avatar";
import { getT } from "@/lib/i18n/server";
import type { MessageKey } from "@/lib/i18n/messages";
import { currentUser, supabaseServer } from "@/lib/supabase/server";
import { getTheme } from "@/lib/theme";
import { ThemeToggle } from "@/components/ThemeToggle";

/** Sections of the signed-in app. Only built sections are listed; the rest arrive in later phases. */
const NAV: { href: string; key: MessageKey; ready: boolean }[] = [
  { href: "/dashboard", key: "nav.dashboard", ready: true },
  { href: "/plan", key: "nav.roadmap", ready: true },
  { href: "/practice", key: "nav.practice", ready: true },
  { href: "/assessments", key: "nav.assessments", ready: true },
  { href: "/company", key: "nav.company", ready: true },
  { href: "/jobs", key: "nav.jobs", ready: true },
  { href: "/courses", key: "nav.courses", ready: true },
  { href: "/progress", key: "nav.progress", ready: true },
  { href: "/people", key: "nav.people", ready: true },
  { href: "/profile", key: "nav.profile", ready: true },
  { href: "/settings", key: "nav.settings", ready: true },
];

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { t, locale } = await getT();
  const user = await currentUser();
  const theme = await getTheme();
  let xp: number | null = null;
  let avatar: { photo: string | null; choice: string | null } | null = null;
  let name = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? "Guest";
  if (user) {
    const { data: profile } = await (await supabaseServer()).from("profiles").select("full_name, xp, onboarded_at, avatar_url, avatar_choice").eq("id", user.id).single();
    // New accounts finish the short setup (basic info + tour) before they start learning.
    if (profile && !profile.onboarded_at) redirect("/welcome");
    xp = profile?.xp ?? 0;
    name = profile?.full_name || name;
    avatar = { photo: profile?.avatar_url ?? null, choice: profile?.avatar_choice ?? null };
  }
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-line bg-card lg:min-h-screen lg:border-b-0 lg:border-e">
        <div className="flex items-center gap-2.5 px-5 py-4 font-semibold tracking-tight"><Logo className="h-6 w-6" /> SkillPath AI</div>
        <nav aria-label="Main" className="px-3 pb-4">
          <ul className="flex gap-1 overflow-x-auto lg:block lg:space-y-0.5">
            {NAV.filter((n) => n.ready).map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="block whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-ink hover:bg-subtle">{t(n.key)}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div>
        <header className="flex items-center justify-end gap-3 border-b border-line bg-card px-6 py-2.5">
          <LanguageSwitcher current={locale} label={t("nav.language")} />
          <ThemeToggle initial={theme} />
          {xp !== null && <span title="Your XP is private" className="rounded-full border border-line bg-subtle px-2.5 py-0.5 font-mono text-xs text-accent">★ {xp} XP</span>}
          {avatar ? <Link href="/profile" title="Your profile" className="flex items-center gap-2 text-sm text-muted hover:text-ink"><Avatar photo={avatar.photo} choice={avatar.choice} name={name} size={28} /><span className="hidden sm:inline">{name}</span></Link> : <span className="text-sm text-muted">{name}</span>}
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
