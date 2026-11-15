import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser, supabaseServer } from "@/lib/supabase/server";
import { suggestions } from "@/lib/avatar";
import { ProfileEditor } from "./ProfileEditor";

export const metadata: Metadata = { title: "Your profile" };

export default async function ProfilePage() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/profile");
  const { data: p } = await (await supabaseServer()).from("profiles")
    .select("username, full_name, headline, bio, avatar_url, avatar_choice, website, github_user, linkedin_user").eq("id", user.id).single();
  const provider = (user.app_metadata?.provider as string | undefined) ?? "email";
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Public profile</h1>
      <p className="mt-1 text-muted">This is all other people can see about you. Your learning, scores and XP stay private.</p>
      <div className="mt-6">
        <ProfileEditor
          initial={{
            username: p?.username ?? "", full_name: p?.full_name ?? "", headline: p?.headline ?? "", bio: p?.bio ?? "",
            avatar_choice: p?.avatar_choice ?? null, website: p?.website ?? "", github_user: p?.github_user ?? "", linkedin_user: p?.linkedin_user ?? "",
          }}
          photo={p?.avatar_url ?? null}
          initialIdeas={suggestions()}
          providerLabel={provider === "github" ? "GitHub" : provider === "google" ? "Google" : "account"}
        />
      </div>
    </div>
  );
}
