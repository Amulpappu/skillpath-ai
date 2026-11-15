import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, authEnabled } from "@/lib/supabase/config";

/** Pages that need an account. Everything else (landing, login, guest planner) is public. */
const PROTECTED = ["/dashboard"]; // practice, tests and company prep also work for guests (saved in the browser)

/** Refreshes the Supabase session cookie and sends signed-out visitors on protected pages to /login. */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!authEnabled()) return response;

  const path = request.nextUrl.pathname;
  // Sign-in pages handle their own cookies. Touching the session here could clear the
  // one-time sign-in verifier (when an old, broken session cookie is present) before it is used.
  if (path.startsWith("/auth/")) return response;

  // A sign-in link can land on any page (Supabase falls back to the Site URL); finish it in the
  // callback, keeping every parameter (including sb_flow_id, which identifies this sign-in).
  if (request.nextUrl.searchParams.get("code")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    if (!url.searchParams.get("next")) url.searchParams.set("next", "/dashboard");
    return NextResponse.redirect(url);
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data } = await supabase.auth.getUser();

  if (!data.user && PROTECTED.some((p) => path === p || path.startsWith(p + "/"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:png|jpg|svg|webp|ico)$).*)"],
};
