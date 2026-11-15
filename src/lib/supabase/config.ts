/** Supabase settings. Sign-in is switched off (and the app runs in guest mode) until both are set. */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const authEnabled = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** OAuth providers offered on the login page, in display order. Supabase calls Microsoft "azure". */
export const PROVIDERS = [
  { id: "google", label: "Google" },
  { id: "github", label: "GitHub" },
  { id: "azure", label: "Microsoft" },
] as const;
export type ProviderId = (typeof PROVIDERS)[number]["id"];
