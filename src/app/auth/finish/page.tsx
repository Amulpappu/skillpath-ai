"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

/**
 * Browser-side finish for sign-in. The browser holds the PKCE code verifier it created when the
 * learner clicked "Continue with …", so if the server could not complete the exchange, the browser can.
 */
function Finish() {
  const params = useSearchParams();
  const router = useRouter();
  const [failed, setFailed] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const code = params.get("code");
    const raw = params.get("next") ?? "/dashboard";
    const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard";
    (async () => {
      const supabase = supabaseBrowser();
      // The client finishes a ?code= in the address bar by itself while it starts up; wait for that first.
      const { data: started } = await supabase.auth.getSession();
      if (started.session) { router.replace(next); router.refresh(); return; }
      if (code) {
        const flowId = params.get("sb_flow_id");
        const { error } = await supabase.auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined);
        if (!error) { router.replace(next); router.refresh(); return; }
      }
      const { data } = await supabase.auth.getUser();
      if (data.user) { router.replace(next); router.refresh(); return; }
      setFailed("This sign-in link has expired or was already used. Please sign in again.");
    })();
  }, [params, router]);

  return (
    <main id="main" className="grid min-h-screen place-items-center px-5">
      {failed ? (
        <div className="max-w-sm text-center">
          <p role="alert" className="text-bad">{failed}</p>
          <a href="/login" className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-ink">Back to sign in</a>
        </div>
      ) : (
        <p role="status" className="text-muted">Signing you in…</p>
      )}
    </main>
  );
}

export default function FinishPage() {
  return <Suspense fallback={null}><Finish /></Suspense>;
}
