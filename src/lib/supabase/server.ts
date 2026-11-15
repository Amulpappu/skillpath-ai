import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, authEnabled } from "./config";

/** Server Supabase client acting as the signed-in user (reads the session cookie). */
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component: the proxy refreshes the session instead.
        }
      },
    },
  });
}

/** The signed-in user, or null (also null when sign-in is not configured). */
export async function currentUser() {
  if (!authEnabled()) return null;
  const { data } = await (await supabaseServer()).auth.getUser();
  return data.user ?? null;
}

/**
 * Service-role client for server-only jobs such as writing the shared question bank.
 * Never import this into client code; the key bypasses row-level security.
 */
export function supabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !key) return null;
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false } });
}
