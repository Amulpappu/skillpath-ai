/**
 * Supabase settings. The project URL and publishable key are PUBLIC by design (they ship to every
 * browser); data is protected by row-level security. Defaults point at the SkillPath AI project so a
 * fresh deploy works without extra setup; set the env vars to use a different project.
 * The service-role key is secret and is never defaulted (see server.ts).
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rnsokogscsyjyoupajgg.supabase.co";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_JZQLhwpYPv2FWoacQDsBfw_DX5sXsUm";
export const authEnabled = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Every OAuth provider the app supports, in display order. Supabase calls Microsoft "azure". */
const ALL_PROVIDERS = [
  { id: "google", label: "Google" },
  { id: "github", label: "GitHub" },
  { id: "azure", label: "Microsoft" },
] as const;
export type ProviderId = (typeof ALL_PROVIDERS)[number]["id"];

/**
 * OAuth buttons are shown only after the provider is switched on in Supabase AND listed in
 * NEXT_PUBLIC_OAUTH_PROVIDERS (comma-separated, e.g. "google,github"). Until then, email sign-in
 * (a one-time link, built into Supabase) is the only option, so no button ever leads to an error.
 */
const enabled = (process.env.NEXT_PUBLIC_OAUTH_PROVIDERS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
export const PROVIDERS = ALL_PROVIDERS.filter((p) => enabled.includes(p.id));
