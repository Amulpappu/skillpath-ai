"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Avatar } from "./Avatar";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { ThemePicker } from "./ThemeToggle";
import type { Locale } from "@/lib/i18n/messages";
import type { ThemeChoice } from "@/lib/theme";

export type NavIcon = "home" | "map" | "code" | "check" | "building" | "briefcase" | "book" | "chart" | "users";
export type NavItem = { href: string; label: string; icon: NavIcon };
export type NavGroup = { title: string; items: NavItem[] };
export type Me = { name: string; username: string | null; xp: number; photo: string | null; choice: string | null };

const ICONS: Record<NavIcon, ReactNode> = {
  home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  map: <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zm0 0v14m6-12v14" />,
  code: <path d="m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16" />,
  check: <path d="M4 4h16v16H4zm4 8 3 3 5-6" />,
  building: <path d="M4 21V5l8-2v18m0 0h8V9l-8-2M8 8h.01M8 12h.01M8 16h.01M16 12h.01M16 16h.01" />,
  briefcase: <path d="M3 8h18v12H3zm6 0V5h6v3M3 13h18" />,
  book: <path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2zm0 16V5m4 2h8" />,
  chart: <path d="M4 20V10m6 10V4m6 16v-7m4 7H2" />,
  users: <path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m7-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm13 10v-2a4 4 0 0 0-3-3.9M16 2.1a4 4 0 0 1 0 7.8" />,
};

function Icon({ name }: { name: NavIcon }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="nav-icon h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{ICONS[name]}</svg>;
}

/** Shows a small spinner and highlights the item while its page is loading. */
function LinkBody({ item, active }: { item: NavItem; active: boolean }) {
  const { pending } = useLinkStatus();
  const on = active || pending;
  return (
    <span className={`nav-item group relative flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm ${on ? "bg-subtle font-semibold text-ink" : "text-muted hover:bg-subtle hover:text-ink"}`}>
      <span aria-hidden="true" className={`absolute inset-y-1 start-0 w-1 rounded-full bg-link transition-transform duration-200 ${on ? "scale-y-100" : "scale-y-0"}`} />
      <Icon name={item.icon} />
      <span className="truncate">{item.label}</span>
      {pending && <span aria-hidden="true" className="ms-auto h-3.5 w-3.5 animate-spin rounded-full border-2 border-line border-t-link" />}
    </span>
  );
}

function AccountMenu({ me, theme, locale, labels }: { me: Me; theme: ThemeChoice; locale: Locale; labels: { language: string; signOut: string; profile: string; account: string; settings: string } }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", close); };
  }, [open]);
  const item = "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-ink hover:bg-subtle";
  return (
    <div ref={ref} className="relative" key={pathname}>
      {open && (
        <div role="menu" className="menu-pop absolute bottom-full start-0 z-50 mb-2 w-72 rounded-md border border-line bg-card p-2 shadow-xl">
          <div className="flex items-center gap-3 border-b border-line px-2 pb-3 pt-1">
            <Avatar photo={me.photo} choice={me.choice} name={me.name} size={40} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{me.name}</p>
              {me.username && <p className="truncate text-xs text-muted">@{me.username}</p>}
            </div>
            <span title="Your XP is private" className="ms-auto rounded-full border border-line bg-subtle px-2 py-0.5 font-mono text-xs text-accent">★ {me.xp}</span>
          </div>
          <nav className="py-1.5">
            {me.username && <Link role="menuitem" href={`/u/${me.username}`} className={item} onClick={() => setOpen(false)}>Your public profile</Link>}
            <Link role="menuitem" href="/profile" className={item} onClick={() => setOpen(false)}>Edit profile</Link>
            <Link role="menuitem" href="/account" className={item} onClick={() => setOpen(false)}>{labels.account}</Link>
            <Link role="menuitem" href="/settings" className={item} onClick={() => setOpen(false)}>{labels.settings}</Link>
          </nav>
          <div className="space-y-2 border-t border-line px-2 py-3">
            <p className="text-xs font-semibold text-muted">Theme</p>
            <div className="[&_[role=radiogroup]]:grid-cols-3 [&_[role=radiogroup]]:gap-1.5 [&_button]:px-2 [&_button]:py-1.5 [&_button]:text-xs">
              <ThemePicker initial={theme} compact />
            </div>
            <LanguageSwitcher current={locale} label={labels.language} />
          </div>
          <form action="/auth/signout" method="post" className="border-t border-line pt-2">
            <button role="menuitem" className={`${item} w-full text-bad`}>{labels.signOut}</button>
          </form>
        </div>
      )}
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="menu"
        className="account-card flex w-full items-center gap-2.5 rounded-md border border-line bg-paper px-2.5 py-2 text-start hover:border-muted hover:bg-subtle">
        <Avatar photo={me.photo} choice={me.choice} name={me.name} size={32} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{me.name}</span>
          <span className="block truncate font-mono text-xs text-accent">★ {me.xp} XP</span>
        </span>
        <svg aria-hidden="true" viewBox="0 0 16 16" className={`h-4 w-4 text-muted transition-transform ${open ? "rotate-180" : ""}`} fill="currentColor"><path d="M4.4 10.6 8 7l3.6 3.6.9-.9L8 5.2 3.5 9.7z" /></svg>
      </button>
    </div>
  );
}

export function AppSidebar({ groups, me, theme, locale, labels }: {
  groups: NavGroup[]; me: Me | null; theme: ThemeChoice; locale: Locale;
  labels: { language: string; signOut: string; signIn: string; profile: string; account: string; settings: string; menu: string };
}) {
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/") || (href === "/jobs" && pathname.startsWith("/jobs"));

  const body = (
    <>
      <Link href="/dashboard" className="flex items-center gap-2.5 px-5 py-4 font-semibold tracking-tight"><Logo className="h-6 w-6" /> SkillPath AI</Link>
      <nav aria-label="Main" className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="mb-1 px-3 text-xs font-semibold text-muted">{g.title}</p>
            <ul className="space-y-0.5">
              {g.items.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} aria-current={isActive(n.href) ? "page" : undefined} onClick={() => setDrawer(false)} className="block">
                    <LinkBody item={n} active={isActive(n.href)} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-line p-3">
        {me ? <AccountMenu me={me} theme={theme} locale={locale} labels={labels} />
          : <Link href="/login" className="block rounded-md bg-accent px-3 py-2 text-center text-sm font-medium text-white hover:bg-accent-hover">{labels.signIn}</Link>}
      </div>
    </>
  );

  return (
    <>
      {/* Phones and tablets: a top bar with a menu button */}
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-line bg-card px-4 py-2.5 lg:hidden">
        <button type="button" onClick={() => setDrawer(true)} aria-label={labels.menu} className="grid h-8 w-8 place-items-center rounded-md border border-line hover:bg-subtle">
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor"><path d="M1 2.75A.75.75 0 0 1 1.75 2h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 2.75Zm0 5A.75.75 0 0 1 1.75 7h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 7.75ZM1.75 12h12.5a.75.75 0 0 1 0 1.5H1.75a.75.75 0 0 1 0-1.5Z" /></svg>
        </button>
        <span className="flex items-center gap-2 font-semibold"><Logo className="h-5 w-5" /> SkillPath AI</span>
        {me && <Link href="/profile" className="ms-auto" aria-label={labels.profile}><Avatar photo={me.photo} choice={me.choice} name={me.name} size={28} /></Link>}
      </div>
      {drawer && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setDrawer(false)} aria-hidden="true" />}
      <aside className={`fixed inset-y-0 start-0 z-50 flex w-64 flex-col border-e border-line bg-card transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 ${drawer ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"}`}>
        {body}
      </aside>
    </>
  );
}
