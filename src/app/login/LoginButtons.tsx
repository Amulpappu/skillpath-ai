"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { ProviderId } from "@/lib/supabase/config";

type Labels = { continueWith: string; failed: string; email: string; sendLink: string; sent: string; or: string };

/**
 * Email sign-in (a one-time link, built into Supabase) plus any OAuth providers that are switched on.
 * If an official sign-in mark is placed at /public/logos/<provider>.svg it is shown on that button.
 */
export function LoginButtons({ next, labels, providers }: { next: string; labels: Labels; providers: { id: ProviderId; label: string; logo?: boolean }[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const redirectTo = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function oauth(provider: ProviderId) {
    setBusy(provider); setError(false);
    const supabase = supabaseBrowser();
    // Clear any old, broken session in this browser first so it can't wipe the new sign-in midway.
    await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
    const { error } = await supabase.auth.signInWithOAuth({
      provider, options: {
        redirectTo: redirectTo(),
        scopes: provider === "azure" ? "email openid profile" : undefined,
        // Always show the account picker instead of silently reusing the last account.
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) { setError(true); setBusy(null); }
  }

  async function emailLink(e: React.FormEvent) {
    e.preventDefault();
    setBusy("email"); setError(false);
    const supabase = supabaseBrowser();
    await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: redirectTo() } });
    setBusy(null);
    if (error) setError(true); else setSentTo(email.trim());
  }

  if (sentTo) {
    return <p role="status" className="rounded-md border border-accent bg-accent-soft p-4 text-sm text-accent">{labels.sent} <b>{sentTo}</b>.</p>;
  }

  return (
    <div className="space-y-3">
      <form onSubmit={emailLink} className="space-y-3">
        <label className="block text-sm font-medium">{labels.email}
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-line bg-card px-3 py-2.5 text-[15px]" />
        </label>
        <button disabled={busy !== null} className="w-full rounded-md bg-accent px-4 py-3 text-[15px] font-medium text-white hover:bg-accent-hover disabled:opacity-60">
          {busy === "email" ? "…" : labels.sendLink}
        </button>
      </form>
      {providers.length > 0 && (
        <>
          <p className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted"><span className="h-px flex-1 bg-line" />{labels.or}<span className="h-px flex-1 bg-line" /></p>
          {providers.map((p) => (
            <button key={p.id} type="button" onClick={() => oauth(p.id)} disabled={busy !== null}
              className="flex w-full items-center justify-center gap-3 rounded-md border border-line bg-card px-4 py-3 text-[15px] font-medium text-ink transition-colors hover:border-ink disabled:opacity-60">
              {p.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/logos/${p.id}.svg`} alt="" className="h-5 w-5" />
              )}
              {busy === p.id ? "…" : `${labels.continueWith} ${p.label}`}
            </button>
          ))}
        </>
      )}
      {error && <p role="alert" className="text-sm text-bad">{labels.failed}</p>}
    </div>
  );
}
