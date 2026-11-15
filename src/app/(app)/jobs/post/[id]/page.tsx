import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { JobsTabs } from "@/components/JobsTabs";
import { APP_STATUS, JOB_TYPES, WORK_MODES } from "@/lib/jobs/board";
import { currentUser, supabaseServer } from "@/lib/supabase/server";
import { Applicants, ApplyForm, PostControls } from "./JobActions";

export const metadata: Metadata = { title: "Job" };

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await currentUser();
  if (!user) redirect(`/login?next=/jobs/post/${id}`);
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const db = await supabaseServer();
  const { data: job } = await db.from("job_posts").select("*").eq("id", id).maybeSingle();
  if (!job) notFound();
  const mine = job.poster_id === user.id;
  const { data: poster } = await db.rpc("job_board", { p_query: "", p_limit: 100 });
  const posterUsername = (poster as { id: string; poster_username: string }[] | null)?.find((r) => r.id === id)?.poster_username;
  const [{ data: applicants }, { data: myApp }] = await Promise.all([
    mine ? db.rpc("job_applicants", { p_job: id }) : Promise.resolve({ data: null }),
    mine ? Promise.resolve({ data: null }) : db.from("job_applications").select("status, created_at").eq("job_id", id).eq("applicant_id", user.id).maybeSingle(),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">Jobs</h1>
      <JobsTabs />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <article className="rounded-md border border-line bg-card">
          <header className="border-b border-line p-5">
            <h2 className="text-xl font-semibold">{job.title}</h2>
            <p className="mt-1 text-muted">{job.company} · {job.location}</p>
            <p className="mt-2 flex flex-wrap gap-1.5 text-xs">
              <span className="rounded-full border border-line px-2 py-0.5">{JOB_TYPES[job.job_type as keyof typeof JOB_TYPES]}</span>
              <span className="rounded-full border border-line px-2 py-0.5">{WORK_MODES[job.work_mode as keyof typeof WORK_MODES]}</span>
              {job.status === "closed" && <span className="rounded-full border border-bad px-2 py-0.5 text-bad">Closed</span>}
              {job.apply_by && <span className="rounded-full border border-line px-2 py-0.5">Apply by {job.apply_by}</span>}
            </p>
          </header>
          <div className="p-5">
            <p className="whitespace-pre-line text-sm leading-relaxed">{job.description}</p>
            {job.skills.length > 0 && <p className="mt-4 flex flex-wrap gap-1">{(job.skills as string[]).map((s) => <span key={s} className="rounded-full bg-subtle px-2 py-0.5 text-xs text-link">{s}</span>)}</p>}
            {job.apply_url && <p className="mt-4 text-sm">Company page: <a className="text-link hover:underline" href={job.apply_url} target="_blank" rel="noopener noreferrer nofollow">{job.apply_url.replace(/^https:\/\//, "")}</a></p>}
            {posterUsername && !mine && <p className="mt-4 text-sm text-muted">Posted by <Link className="text-link hover:underline" href={`/u/${posterUsername}`}>@{posterUsername}</Link></p>}
          </div>
        </article>
        <aside className="space-y-4">
          {mine ? (
            <PostControls id={id} status={job.status} />
          ) : myApp ? (
            <div className="rounded-md border border-line bg-card p-4 text-sm">
              <p className="font-semibold">Your application</p>
              <p className="mt-1">Status: <b className={myApp.status === "shortlisted" ? "text-accent" : myApp.status === "rejected" ? "text-bad" : ""}>{APP_STATUS[myApp.status as keyof typeof APP_STATUS]}</b></p>
              <ApplyForm id={id} applied defaultEmail={user.email ?? ""} />
            </div>
          ) : job.status === "open" ? (
            <ApplyForm id={id} applied={false} defaultEmail={user.email ?? ""} />
          ) : (
            <p className="rounded-md border border-line bg-card p-4 text-sm text-muted">This job is closed.</p>
          )}
        </aside>
      </div>
      {mine && <div className="mt-6"><Applicants rows={applicants ?? []} /></div>}
    </div>
  );
}
