import "server-only";
import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale, type MessageKey } from "./messages";

export const LOCALE_COOKIE = "sp_lang";

/** Locale from the cookie, else the browser's Accept-Language, else English. */
export async function getLocale(): Promise<Locale> {
  const fromCookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;
  const accept = (await headers()).get("accept-language") ?? "";
  for (const part of accept.split(",")) {
    const code = part.split(";")[0].trim().slice(0, 2).toLowerCase();
    if (isLocale(code)) return code;
  }
  return DEFAULT_LOCALE;
}

/** Translator for server components: t("nav.jobs"). */
export async function getT() {
  const locale = await getLocale();
  const m = LOCALES[locale].messages;
  return { locale, dir: LOCALES[locale].dir, t: (key: MessageKey) => m[key] };
}
