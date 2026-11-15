import type { Metadata } from "next";
import { JobScout } from "@/components/JobScout";
import { ROLES } from "@/lib/catalog";
import { COUNTRIES } from "@/lib/jobs/scout";

export const metadata: Metadata = { title: "Jobs" };

export default function JobsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight">Jobs</h1>
      <p className="mt-1 text-muted">The Job Scout finds openings for your role and builds searches on LinkedIn, Indeed, Naukri and more.</p>
      <div className="mt-6"><JobScout roles={ROLES} countries={COUNTRIES.map(({ code, name }) => ({ code, name }))} /></div>
    </div>
  );
}
