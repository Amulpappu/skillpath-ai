import type { Metadata } from "next";
import Link from "next/link";
import { LoginButtons } from "./LoginButtons";
import { Logo } from "@/components/Logo";
import { getT } from "@/lib/i18n/server";
import { authEnabled } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { t } = await getT();
  const { next, error } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  return (
    <main id="main" className="grid min-h-screen place-items-center px-5 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center gap-2.5 font-semibold tracking-tight"><Logo /> SkillPath AI</Link>
        <h1 className="text-2xl font-semibold tracking-tight">{t("login.title")}</h1>
        <p className="mt-2 text-muted">{t("login.lead")}</p>
        <div className="mt-8">
          {authEnabled() ? (
            <LoginButtons next={safeNext} labels={{ continueWith: t("login.continueWith"), failed: t("login.failed") }} />
          ) : (
            <p className="rounded-lg border border-warn bg-warn-soft p-4 text-sm text-warn">{t("login.disabled")}</p>
          )}
          {error && <p role="alert" className="mt-4 text-sm text-bad">{t("login.failed")}</p>}
        </div>
        <p className="mt-8 text-xs leading-relaxed text-muted">{t("login.terms")}</p>
        <Link href="/plan" className="mt-6 inline-block text-sm font-medium text-accent underline underline-offset-2">{t("landing.guest")}</Link>
      </div>
    </main>
  );
}
