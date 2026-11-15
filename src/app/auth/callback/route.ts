import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * OAuth / email-link return point: swaps the one-time code for a session cookie, then continues.
 * If the code was already used (double request, back button) but the user is signed in, carry on
 * instead of showing an error.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));
  const supabase = await supabaseServer();
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
    console.warn("Sign-in code exchange failed:", error.message);
  }
  const { data } = await supabase.auth.getUser();
  if (data.user) return NextResponse.redirect(new URL(next, url.origin));
  if (code) {
    // The browser holds the PKCE code verifier; let it finish the sign-in.
    return NextResponse.redirect(new URL(`/auth/finish?code=${encodeURIComponent(code)}&next=${encodeURIComponent(next)}`, url.origin));
  }
  const reason = url.searchParams.get("error_description") ?? "missing";
  return NextResponse.redirect(new URL(`/login?error=signin&reason=${encodeURIComponent(reason.slice(0, 120))}`, url.origin));
}

/** Only allow same-site relative paths, so the callback can't be used as an open redirect. */
function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}
