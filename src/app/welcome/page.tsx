import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ALL_SKILLS, ROLES } from "@/lib/catalog";
import { AI_SKILLS } from "@/lib/catalogGlobal";
import { COMPANIES } from "@/lib/company/catalog";
import { COUNTRIES } from "@/lib/jobs/scout";
import { currentUser, supabaseServer } from "@/lib/supabase/server";
import { Onboarding } from "./Onboarding";

export const metadata: Metadata = { title: "Welcome" };

export default async function WelcomePage() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/welcome");
  const { data: profile } = await (await supabaseServer()).from("profiles").select("full_name, onboarded_at, country, target_role").eq("id", user.id).single();
  if (profile?.onboarded_at) redirect("/dashboard");
  const name = profile?.full_name ?? (user.user_metadata?.full_name as string | undefined) ?? "";
  const skills = [...new Set([...AI_SKILLS, ...ALL_SKILLS])];
  return (
    <Onboarding
      initialName={name}
      initialCountry={profile?.country ?? "IN"}
      initialRole={profile?.target_role ?? ""}
      roles={ROLES}
      countries={COUNTRIES.map((c) => ({ code: c.code, name: c.name }))}
      companies={COMPANIES.map((c) => c.name)}
      skills={skills}
    />
  );
}
