import type { Metadata } from "next";
import { SettingsForm } from "@/components/SettingsForm";
import { ROLES } from "@/lib/catalog";
import { COMPANIES } from "@/lib/company/catalog";
import { COUNTRIES } from "@/lib/jobs/scout";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-muted">Your goal, time and interests guide every agent. Coding profiles add to your placement readiness.</p>
      <div className="mt-6"><SettingsForm roles={ROLES} companies={COMPANIES.map((c) => c.name)} countries={COUNTRIES.map(({ code, name }) => ({ code, name }))} /></div>
    </div>
  );
}
