import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/supabase/server";
import { People } from "./People";

export const metadata: Metadata = { title: "People" };

export default async function PeoplePage() {
  if (!(await currentUser())) redirect("/login?next=/people");
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">People</h1>
      <p className="mt-1 text-muted">Find classmates and friends and follow them. Everyone sees only names, photos and headlines, never progress.</p>
      <div className="mt-6"><People /></div>
    </div>
  );
}
