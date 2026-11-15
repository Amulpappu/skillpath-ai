import { NextResponse, type NextRequest } from "next/server";
import { isLocale } from "@/lib/i18n/messages";
import { LOCALE_COOKIE } from "@/lib/i18n/server";

/** Saves the chosen interface language for a year. */
export async function POST(request: NextRequest) {
  const { locale } = (await request.json().catch(() => ({}))) as { locale?: string };
  if (!isLocale(locale)) return NextResponse.json({ error: "Unknown language" }, { status: 400 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  return res;
}
