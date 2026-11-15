import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { FollowButton } from "@/components/FollowButton";
import { currentUser, supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Profile" };

type PublicProfile = {
  id: string; username: string; full_name: string | null; headline: string | null; bio: string | null; avatar_url: string | null; avatar_choice: string | null;
  website: string | null; github_user: string | null; linkedin_user: string | null; joined: string; followers: number; following: number; i_follow: boolean;
};

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await currentUser();
  if (!user) redirect(`/login?next=/u/${encodeURIComponent(username)}`);
  const { data } = await (await supabaseServer()).rpc("public_profile", { p_username: username });
  const p = (data as PublicProfile[] | null)?.[0];
  if (!p) notFound();
  const mine = p.id === user.id;
  return (
    <div className="mx-auto max-w-4xl md:grid md:grid-cols-[260px_1fr] md:gap-8">
      <aside>
        <Avatar choice={p.avatar_choice} photo={p.avatar_url} name={p.full_name} size={220} className="mx-auto md:mx-0" />
        <h1 className="mt-4 text-2xl font-semibold leading-tight">{p.full_name}</h1>
        <p className="text-xl font-light text-muted">@{p.username}</p>
        {p.headline && <p className="mt-3">{p.headline}</p>}
        <div className="mt-4">
          {mine ? <Link href="/profile" className="block rounded-md border border-line bg-subtle px-3 py-1.5 text-center text-sm font-medium hover:bg-card">Edit profile</Link>
            : <FollowButton userId={p.id} initial={p.i_follow} />}
        </div>
        <p className="mt-4 text-sm text-muted"><b className="text-ink">{p.followers}</b> followers · <b className="text-ink">{p.following}</b> following</p>
        <ul className="mt-4 space-y-1.5 text-sm">
          {p.website && <li><a className="text-link hover:underline" href={p.website} target="_blank" rel="noopener noreferrer nofollow">{p.website.replace(/^https:\/\//, "")}</a></li>}
          {p.github_user && <li><a className="text-link hover:underline" href={`https://github.com/${p.github_user}`} target="_blank" rel="noopener noreferrer nofollow">github.com/{p.github_user}</a></li>}
          {p.linkedin_user && <li><a className="text-link hover:underline" href={`https://www.linkedin.com/in/${p.linkedin_user}`} target="_blank" rel="noopener noreferrer nofollow">linkedin.com/in/{p.linkedin_user}</a></li>}
          <li className="text-muted">Joined {new Date(p.joined).toLocaleDateString("en", { month: "long", year: "numeric" })}</li>
        </ul>
      </aside>
      <section className="mt-8 md:mt-0">
        <div className="rounded-md border border-line bg-card p-5">
          <h2 className="text-sm font-semibold">About</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-muted">{p.bio || "No bio yet."}</p>
        </div>
        <p className="mt-4 rounded-md border border-dashed border-line p-4 text-sm text-muted">Learning progress, scores and XP are private on SkillPath AI and are never shown on profiles.</p>
      </section>
    </div>
  );
}
