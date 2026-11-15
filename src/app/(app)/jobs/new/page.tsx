import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { JobsTabs } from "@/components/JobsTabs";
import { currentUser } from "@/lib/supabase/server";
import { PostJobForm } from "./PostJobForm";

export const metadata: Metadata = { title: "Post a job" };

export default async function NewJobPage() {
  if (!(await currentUser())) redirect("/login?next=/jobs/new");
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">Jobs</h1>
      <JobsTabs />
      <div className="mx-auto max-w-2xl"><PostJobForm /></div>
    </div>
  );
}
