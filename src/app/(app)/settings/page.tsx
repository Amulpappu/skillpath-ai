import type { Metadata } from "next";
import { SettingsForm } from "@/components/SettingsForm";
import { ROLES } from "@/lib/catalog";
import { COMPANIES } from "@/lib/company/catalog";
import { COUNTRIES } from "@/lib/jobs/scout";
import { getTheme } from "@/lib/theme";
import { ThemePicker } from "@/components/ThemeToggle";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const theme = await getTheme();
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-muted">Your goal, time and interests guide every agent. Coding profiles add to your placement readiness.</p>
      <section aria-labelledby="appearance" className="mt-6 rounded-md border border-line bg-card p-5">
        <h2 id="appearance" className="font-semibold">Appearance</h2>
        <p className="mb-3 mt-1 text-sm text-muted">Choose light or dark, or follow your device.</p>
        <ThemePicker initial={theme} />
      </section>
      <div className="mt-6"><SettingsForm roles={ROLES} companies={COMPANIES.map((c) => c.name)} countries={COUNTRIES.map(({ code, name }) => ({ code, name }))} /></div>
    </div>
  );
}
