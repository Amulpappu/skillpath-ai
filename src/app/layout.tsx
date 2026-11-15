import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getT } from "@/lib/i18n/server";
import { getTheme } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "SkillPath AI: learning, placement and jobs", template: "%s · SkillPath AI" },
  description:
    "Twelve AI agents analyse your skills, plan your learning, test you, prepare you for your dream company and find jobs for your role, in 12 languages.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { locale, dir } = await getT();
  const theme = await getTheme();
  return (
    <html lang={locale} dir={dir} data-theme={theme === "system" ? undefined : theme} suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded focus:bg-card focus:px-3 focus:py-2"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
