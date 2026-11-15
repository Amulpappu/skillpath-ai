import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { getT } from "@/lib/i18n/server";
import { currentUser } from "@/lib/supabase/server";

export async function SiteHeader() {
  const { t, locale } = await getT();
  const user = await currentUser();
  return (
    <header className="border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <Logo /> <span className="hidden whitespace-nowrap sm:inline">SkillPath AI</span>
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSwitcher current={locale} label={t("nav.language")} />
          {user ? (
            <Link href="/dashboard" className="whitespace-nowrap rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-ink">
              {t("nav.dashboard")}
            </Link>
          ) : (
            <Link href="/login" className="whitespace-nowrap rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-ink">
              {t("nav.signIn")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
