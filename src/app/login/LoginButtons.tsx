"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { PROVIDERS, type ProviderId } from "@/lib/supabase/config";

/**
 * One button per provider. If an official sign-in mark is placed at /public/logos/<provider>.svg
 * it is shown; otherwise the button is text-only.
 */
export function LoginButtons({ next, labels }: { next: string; labels: { continueWith: string; failed: string } }) {
  const [busy, setBusy] = useState<ProviderId | null>(null);
  const [error, setError] = useState(false);

  async function signIn(provider: ProviderId) {
    setBusy(provider);
    setError(false);
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabaseBrowser().auth.signInWithOAuth({
      provider,
      options: { redirectTo, scopes: provider === "azure" ? "email openid profile" : undefined },
    });
    if (error) {
      setError(true);
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      {PROVIDERS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => signIn(p.id)}
          disabled={busy !== null}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-line bg-white px-4 py-3 text-[15px] font-medium text-ink transition-colors hover:border-ink disabled:opacity-60"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/logos/${p.id}.svg`} alt="" className="h-5 w-5" onError={(e) => e.currentTarget.remove()} />
          {busy === p.id ? "…" : `${labels.continueWith} ${p.label}`}
        </button>
      ))}
      {error && (
        <p role="alert" className="text-sm text-bad">
          {labels.failed}
        </p>
      )}
    </div>
  );
}
