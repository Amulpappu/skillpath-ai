import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { JobsTabs } from "@/components/JobsTabs";
import { JOB_TYPES, WORK_MODES } from "@/lib/jobs/board";
import { currentUser, supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Community job board" };

type Row = { id: string; title: string; company: string; location: string; work_mode: keyof typeof WORK_MODES; job_type: keyof typeof JOB_TYPES;
  skills: string[]; apply_by: string | null; created_at: string; poster_username: string; poster_name: string | null; applicants: number; i_applied: boolean; mine: boolean };

function ago(iso: string) {
  const d = Math.max(0, Math.round((Date.parse(new Date().toISOString()) - Date.parse(iso)) / 86_400_000));
  return d === 0 ? "today" : d === 1 ? "yesterday" : `${d} days ago`;
}

export default async function BoardPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  if (!(await currentUser())) redirect("/login?next=/jobs/board");
  const q = ((await searchParams).q ?? "").slice(0, 60);
  const { data } = await (await supabaseServer()).rpc("job_board", { p_query: q, p_limit: 50 });
  const jobs = (data ?? []) as Row[];
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">Jobs</h1>
      <JobsTabs />
      <form className="mb-4 flex gap-2" role="search">
        <input name="q" defaultValue={q} placeholder="Search title, company, location or skill" aria-label="Search jobs" className="min-w-0 flex-1 rounded-md border border-line bg-card px-3 py-1.5 text-sm" />
        <button className="rounded-md border border-line bg-subtle px-3 py-1.5 text-sm font-medium hover:bg-card">Search</button>
      </form>
      <div className="rounded-md border border-line bg-card">
        <div className="border-b border-line bg-subtle px-4 py-2.5 text-sm font-semibold">{jobs.length} open {jobs.length === 1 ? "job" : "jobs"} posted by people on SkillPath</div>
        {jobs.length === 0 ? (
          <p className="p-6 text-sm text-muted">{q ? "No jobs match that search." : "No jobs posted yet."} <Link href="/jobs/new" className="text-link hover:underline">Post the first one</Link>.</p>
        ) : (
          <ul className="divide-y divide-line">
            {jobs.map((j) => (
              <li key={j.id} className="flex flex-wrap items-start gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <Link href={`/jobs/post/${j.id}`} className="font-semibold text-link hover:underline">{j.title}</Link>
                  <span className="ms-2 rounded-full border border-line px-2 py-0.5 text-xs text-muted">{JOB_TYPES[j.job_type]}</span>
                  <span className="ms-1 rounded-full border border-line px-2 py-0.5 text-xs text-muted">{WORK_MODES[j.work_mode]}</span>
                  <p className="mt-1 text-sm text-muted">{j.company} · {j.location} · posted {ago(j.created_at)} by <Link href={`/u/${j.poster_username}`} className="hover:text-link hover:underline">@{j.poster_username}</Link></p>
                  {j.skills.length > 0 && <p className="mt-1.5 flex flex-wrap gap-1">{j.skills.map((s) => <span key={s} className="rounded-full bg-subtle px-2 py-0.5 text-xs text-link">{s}</span>)}</p>}
                </div>
                <div className="text-end text-sm">
                  {j.mine ? <span className="text-muted">Your post · {j.applicants} applied</span>
                    : j.i_applied ? <span className="text-accent">✓ Applied</span>
                    : <Link href={`/jobs/post/${j.id}`} className="rounded-md bg-accent px-3 py-1 font-medium text-white hover:bg-accent-hover">Apply</Link>}
                  {j.apply_by && <p className="mt-1 text-xs text-muted">Apply by {j.apply_by}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
