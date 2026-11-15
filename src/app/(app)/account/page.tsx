import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { enabledProviders } from "@/lib/supabase/providers";
import { currentUser, supabaseServer } from "@/lib/supabase/server";
import { AccountPanel } from "./AccountPanel";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/account");
  const { data: p } = await (await supabaseServer()).from("profiles").select("phone").eq("id", user.id).single();
  const providers = await enabledProviders();
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
      <p className="mt-1 text-muted">Sign-in details and security. Nothing on this page is visible to other people.</p>
      <div className="mt-6">
        <AccountPanel
          email={user.email ?? ""}
          newEmail={user.new_email ?? null}
          joined={user.created_at}
          lastSignIn={user.last_sign_in_at ?? null}
          identities={(user.identities ?? []).map((i) => ({ id: i.identity_id, provider: i.provider, email: (i.identity_data?.email as string | undefined) ?? null, created: i.created_at ?? null }))}
          providers={providers.map((x) => ({ id: x.id, label: x.label }))}
          phone={p?.phone ?? ""}
        />
      </div>
    </div>
  );
}
