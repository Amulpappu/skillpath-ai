"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { ProviderId } from "@/lib/supabase/config";

type Labels = { continueWith: string; failed: string; email: string; sendLink: string; sent: string; or: string };

/**
 * Email sign-in (a one-time link, built into Supabase) plus any OAuth providers that are switched on.
 * If an official sign-in mark is placed at /public/logos/<provider>.svg it is shown on that button.
 */
export function LoginButtons({ next, labels, providers }: { next: string; labels: Labels; providers: { id: ProviderId; label: string }[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const redirectTo = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function oauth(provider: ProviderId) {
    setBusy(provider); setError(false);
    const { error } = await supabaseBrowser().auth.signInWithOAuth({
      provider, options: { redirectTo: redirectTo(), scopes: provider === "azure" ? "email openid profile" : undefined },
    });
    if (error) { setError(true); setBusy(null); }
  }

  async function emailLink(e: React.FormEvent) {
    e.preventDefault();
    setBusy("email"); setError(false);
    const { error } = await supabaseBrowser().auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: redirectTo() } });
    setBusy(null);
    if (error) setError(true); else setSentTo(email.trim());
  }

  if (sentTo) {
    return <p role="status" className="rounded-lg border border-accent bg-accent-soft p-4 text-sm text-accent">{labels.sent} <b>{sentTo}</b>.</p>;
  }

  return (
    <div className="space-y-3">
      <form onSubmit={emailLink} className="space-y-3">
        <label className="block text-sm font-medium">{labels.email}
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[15px]" />
        </label>
        <button disabled={busy !== null} className="w-full rounded-lg bg-accent px-4 py-3 text-[15px] font-medium text-white hover:bg-ink disabled:opacity-60">
          {busy === "email" ? "…" : labels.sendLink}
        </button>
      </form>
      {providers.length > 0 && (
        <>
          <p className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted"><span className="h-px flex-1 bg-line" />{labels.or}<span className="h-px flex-1 bg-line" /></p>
          {providers.map((p) => (
            <button key={p.id} type="button" onClick={() => oauth(p.id)} disabled={busy !== null}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-line bg-white px-4 py-3 text-[15px] font-medium text-ink transition-colors hover:border-ink disabled:opacity-60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/logos/${p.id}.svg`} alt="" className="h-5 w-5" onError={(e) => e.currentTarget.remove()} />
              {busy === p.id ? "…" : `${labels.continueWith} ${p.label}`}
            </button>
          ))}
        </>
      )}
      {error && <p role="alert" className="text-sm text-bad">{labels.failed}</p>}
    </div>
  );
}
