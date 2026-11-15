import { cookies } from "next/headers";

export type ThemeChoice = "system" | "light" | "dark";
export const THEME_COOKIE = "sp_theme";

/** The learner's saved theme. "system" follows the device's light or dark setting. */
export async function getTheme(): Promise<ThemeChoice> {
  const v = (await cookies()).get(THEME_COOKIE)?.value;
  return v === "light" || v === "dark" ? v : "system";
}
