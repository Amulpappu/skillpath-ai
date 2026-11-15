import type { Metadata } from "next";
import Link from "next/link";
import { LoginButtons } from "./LoginButtons";
import { Logo } from "@/components/Logo";
import { getT } from "@/lib/i18n/server";
import { authEnabled } from "@/lib/supabase/config";
import { enabledProviders } from "@/lib/supabase/providers";

export const metadata: Metadata = { title: "Sign in" };

const LOGOS = new Set(["google", "github"]);

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string; reason?: string }> }) {
  const { t } = await getT();
  const { next, error, reason } = await searchParams;
  // marks shipped in public/logos (from the open-licensed Iconify "logos" set)
  const providers = (await enabledProviders()).map((p) => ({ ...p, logo: LOGOS.has(p.id) }));
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  return (
    <main id="main" className="grid min-h-screen place-items-center px-5 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center gap-2.5 font-semibold tracking-tight"><Logo /> SkillPath AI</Link>
        <h1 className="text-2xl font-semibold tracking-tight">{t("login.title")}</h1>
        <p className="mt-2 text-muted">{t("login.lead")}</p>
        <div className="mt-8">
          {authEnabled() ? (
            <LoginButtons next={safeNext} providers={providers} labels={{ continueWith: t("login.continueWith"), failed: t("login.failed"), email: t("login.email"), sendLink: t("login.sendLink"), sent: t("login.sent"), or: t("login.or") }} />
          ) : (
            <p className="rounded-lg border border-warn bg-warn-soft p-4 text-sm text-warn">{t("login.disabled")}</p>
          )}
          {error && <p role="alert" className="mt-4 text-sm text-bad">{t("login.failed")}{reason ? ` (${reason.slice(0, 120)})` : ""}</p>}
        </div>
        <p className="mt-8 text-xs leading-relaxed text-muted">{t("login.terms")}</p>
      </div>
    </main>
  );
}
