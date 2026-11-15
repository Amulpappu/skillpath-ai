"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { supabaseBrowser } from "@/lib/supabase/client";

/** Second step of sign-in for accounts with two-step verification turned on. */
export default function MfaPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const sb = supabaseBrowser();
    const { data } = await sb.auth.mfa.listFactors();
    const factor = data?.totp.find((f) => f.status === "verified");
    if (!factor) { router.replace("/dashboard"); return; }
    const { error } = await sb.auth.mfa.challengeAndVerify({ factorId: factor.id, code: code.trim() });
    setBusy(false);
    if (error) { setError("That code didn't work. Try the newest code from your app."); return; }
    router.replace("/dashboard"); router.refresh();
  }

  return (
    <main id="main" className="grid min-h-screen place-items-center bg-paper px-5">
      <div className="w-full max-w-sm">
      <form onSubmit={verify} className="w-full rounded-md border border-line bg-card p-6">
        <div className="mb-4 flex items-center gap-2 font-semibold"><Logo className="h-6 w-6" /> SkillPath AI</div>
        <h1 className="text-xl font-semibold">Two-step verification</h1>
        <p className="mt-1 text-sm text-muted">Open your authenticator app and enter the 6-digit code for SkillPath AI.</p>
        <input autoFocus inputMode="numeric" autoComplete="one-time-code" aria-label="6-digit code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="mt-4 w-full rounded-md border border-line bg-card px-3 py-2 text-center font-mono text-xl tracking-[0.5em]" required minLength={6} />
        {error && <p role="alert" className="mt-2 text-sm text-bad">{error}</p>}
        <button disabled={busy || code.length < 6} className="mt-4 w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60">{busy ? "Checking…" : "Verify"}</button>
      </form>
      <form action="/auth/signout" method="post" className="mt-3 text-center"><button className="text-sm text-link hover:underline">Use a different account</button></form>
      </div>
    </main>
  );
}
