import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppSidebar, type Me, type NavIcon } from "@/components/AppSidebar";
import { getT } from "@/lib/i18n/server";
import type { MessageKey } from "@/lib/i18n/messages";
import { currentUser, supabaseServer } from "@/lib/supabase/server";
import { getTheme } from "@/lib/theme";

/** Sections of the signed-in app, grouped like GitHub's sidebar. Profile, Account and Settings live in the account menu. */
const GROUPS: { title: string; items: { href: string; key: MessageKey; icon: NavIcon }[] }[] = [
  { title: "Learn", items: [
    { href: "/dashboard", key: "nav.dashboard", icon: "home" },
    { href: "/plan", key: "nav.roadmap", icon: "map" },
    { href: "/practice", key: "nav.practice", icon: "code" },
    { href: "/assessments", key: "nav.assessments", icon: "check" },
    { href: "/company", key: "nav.company", icon: "building" },
    { href: "/courses", key: "nav.courses", icon: "book" },
    { href: "/progress", key: "nav.progress", icon: "chart" },
  ] },
  { title: "Career", items: [
    { href: "/jobs", key: "nav.jobs", icon: "briefcase" },
    { href: "/people", key: "nav.people", icon: "users" },
  ] },
];

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { t, locale } = await getT();
  const user = await currentUser();
  const theme = await getTheme();
  let me: Me | null = null;
  let name = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? "Guest";
  if (user) {
    // Accounts with two-step verification must enter their code before using the app.
    const { data: aal } = await (await supabaseServer()).auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") redirect("/auth/mfa");
    const { data: profile } = await (await supabaseServer()).from("profiles").select("full_name, username, xp, onboarded_at, avatar_url, avatar_choice").eq("id", user.id).single();
    // New accounts finish the short setup (basic info + tour) before they start learning.
    if (profile && !profile.onboarded_at) redirect("/welcome");
    name = profile?.full_name || name;
    me = { name, username: profile?.username ?? null, xp: profile?.xp ?? 0, photo: profile?.avatar_url ?? null, choice: profile?.avatar_choice ?? null };
  }
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[256px_1fr]">
      <AppSidebar
        groups={GROUPS.map((g) => ({ title: g.title, items: g.items.map((n) => ({ href: n.href, label: t(n.key), icon: n.icon })) }))}
        me={me}
        theme={theme}
        locale={locale}
        labels={{ language: t("nav.language"), signOut: t("nav.signOut"), signIn: t("nav.signIn"), profile: t("nav.profile"), account: t("nav.account"), settings: t("nav.settings"), menu: "Menu" }}
      />
      <main id="main" className="min-w-0 px-5 py-8 lg:px-8">{children}</main>
    </div>
  );
}
