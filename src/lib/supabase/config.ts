/** Supabase settings. Sign-in is switched off (and the app runs in guest mode) until both are set. */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const authEnabled = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Every OAuth provider the app supports, in display order. Supabase calls Microsoft "azure". */
const ALL_PROVIDERS = [
  { id: "google", label: "Google" },
  { id: "github", label: "GitHub" },
  { id: "azure", label: "Microsoft" },
] as const;
export type ProviderId = (typeof ALL_PROVIDERS)[number]["id"];

/**
 * Providers switched on with NEXT_PUBLIC_AUTH_PROVIDERS (comma-separated, e.g. "google,github").
 * Defaults to Google and GitHub, which are free to set up; Microsoft needs an Azure account.
 */
const enabled = (process.env.NEXT_PUBLIC_AUTH_PROVIDERS ?? "google,github").split(",").map((s) => s.trim());
export const PROVIDERS = ALL_PROVIDERS.filter((p) => enabled.includes(p.id));
