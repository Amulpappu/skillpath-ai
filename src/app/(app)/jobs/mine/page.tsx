import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { JobsTabs } from "@/components/JobsTabs";
import { APP_STATUS } from "@/lib/jobs/board";
import { currentUser, supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "My jobs" };

export default async function MyJobsPage() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/jobs/mine");
  const db = await supabaseServer();
  const [{ data: posts }, { data: apps }] = await Promise.all([
    db.from("job_posts").select("id, title, company, status, created_at").eq("poster_id", user.id).order("created_at", { ascending: false }),
    db.from("job_applications").select("status, created_at, job_posts(id, title, company, status)").eq("applicant_id", user.id).order("created_at", { ascending: false }),
  ]);
  type AppRow = { status: keyof typeof APP_STATUS; created_at: string; job_posts: { id: string; title: string; company: string; status: string } | null };
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">Jobs</h1>
      <JobsTabs />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-md border border-line bg-card">
          <h2 className="border-b border-line bg-subtle px-4 py-2.5 text-sm font-semibold">Jobs you posted</h2>
          {!posts?.length ? <p className="p-5 text-sm text-muted">None yet. <Link className="text-link hover:underline" href="/jobs/new">Post a job</Link>.</p> : (
            <ul className="divide-y divide-line">{posts.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <div><Link href={`/jobs/post/${p.id}`} className="font-semibold text-link hover:underline">{p.title}</Link><p className="text-muted">{p.company}</p></div>
                <span className={`rounded-full border px-2 py-0.5 text-xs ${p.status === "open" ? "border-accent text-accent" : "border-line text-muted"}`}>{p.status === "open" ? "Open" : "Closed"}</span>
              </li>))}
            </ul>)}
        </section>
        <section className="rounded-md border border-line bg-card">
          <h2 className="border-b border-line bg-subtle px-4 py-2.5 text-sm font-semibold">Your applications</h2>
          {!apps?.length ? <p className="p-5 text-sm text-muted">None yet. <Link className="text-link hover:underline" href="/jobs/board">Browse the board</Link>.</p> : (
            <ul className="divide-y divide-line">{(apps as unknown as AppRow[]).map((a, i) => a.job_posts && (
              <li key={i} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <div><Link href={`/jobs/post/${a.job_posts.id}`} className="font-semibold text-link hover:underline">{a.job_posts.title}</Link><p className="text-muted">{a.job_posts.company}{a.job_posts.status === "closed" ? " · closed" : ""}</p></div>
                <span className={`rounded-full border px-2 py-0.5 text-xs ${a.status === "shortlisted" ? "border-accent text-accent" : a.status === "rejected" ? "border-bad text-bad" : "border-line text-muted"}`}>{APP_STATUS[a.status]}</span>
              </li>))}
            </ul>)}
        </section>
      </div>
    </div>
  );
}
