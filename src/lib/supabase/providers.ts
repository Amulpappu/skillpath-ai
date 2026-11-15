import "server-only";
import { PROVIDERS, SUPABASE_ANON_KEY, SUPABASE_URL, authEnabled, type ProviderId } from "./config";

/**
 * OAuth providers that are actually switched on in Supabase (read from the public auth settings),
 * so a Google or GitHub button appears as soon as it is enabled in the dashboard, with no code or env change.
 * NEXT_PUBLIC_OAUTH_PROVIDERS, if set, still adds providers explicitly.
 */
export async function enabledProviders(): Promise<{ id: ProviderId; label: string }[]> {
  const all = [{ id: "google", label: "Google" }, { id: "github", label: "GitHub" }, { id: "azure", label: "Microsoft" }] as const;
  if (!authEnabled()) return [];
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_ANON_KEY }, next: { revalidate: 60 }, signal: AbortSignal.timeout(4000) });
    const external = ((await res.json()) as { external?: Record<string, boolean> }).external ?? {};
    const explicit = new Set(PROVIDERS.map((p) => p.id));
    return all.filter((p) => external[p.id] === true || explicit.has(p.id)).map((p) => ({ ...p }));
  } catch {
    return [...PROVIDERS];
  }
}
