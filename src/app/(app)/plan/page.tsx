import type { Metadata } from "next";
import { currentUser, supabaseServer } from "@/lib/supabase/server";
import { PlanClient } from "./PlanClient";

export const metadata: Metadata = { title: "Roadmap" };

export default async function PlanPage() {
  const user = await currentUser();
  let name = "", role = "";
  if (user) {
    const { data } = await (await supabaseServer()).from("profiles").select("full_name, target_role").eq("id", user.id).single();
    name = data?.full_name ?? (user.user_metadata?.full_name as string | undefined) ?? "";
    role = data?.target_role ?? "";
  }
  return <PlanClient accountName={name} accountRole={role} />;
}
