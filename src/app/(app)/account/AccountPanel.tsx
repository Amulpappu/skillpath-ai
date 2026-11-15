"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Factor } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase/client";

type Identity = { id: string; provider: string; email: string | null; created: string | null };
const LABEL: Record<string, string> = { google: "Google", github: "GitHub", azure: "Microsoft", email: "Email link / password" };
const LOGO: Record<string, string> = { google: "/logos/google.svg", github: "/logos/github.svg" };
const input = "w-full rounded-md border border-line bg-card px-3 py-1.5 text-sm";
const btn = "rounded-md border border-line bg-subtle px-3 py-1 text-sm font-medium hover:bg-card disabled:opacity-60";
const primary = "rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60";

function Box({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-line bg-card">
      <div className="border-b border-line px-5 py-3"><h2 className="font-semibold">{title}</h2>{desc && <p className="text-sm text-muted">{desc}</p>}</div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Msg({ m }: { m: { ok: boolean; text: string } | null }) {
  return m ? <p role={m.ok ? "status" : "alert"} className={`mt-2 text-sm ${m.ok ? "text-accent" : "text-bad"}`}>{m.text}</p> : null;
}

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—");

export function AccountPanel(props: { email: string; newEmail: string | null; joined: string; lastSignIn: string | null; identities: Identity[]; providers: { id: string; label: string }[]; phone: string }) {
  const router = useRouter();
  const sb = supabaseBrowser();

  // email
  const [email, setEmail] = useState("");
  const [emailMsg, setEmailMsg] = useState<{ ok: boolean; text: string } | null>(null);
  async function changeEmail(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await sb.auth.updateUser({ email: email.trim() }, { emailRedirectTo: `${location.origin}/auth/callback?next=/account` });
    setEmailMsg(error ? { ok: false, text: error.message } : { ok: true, text: "Check both inboxes: confirm the change from the links we sent." });
  }

  // identities
  const [idMsg, setIdMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const linked = new Set(props.identities.map((i) => i.provider));
  async function link(provider: string) {
    const { error } = await sb.auth.linkIdentity({ provider: provider as "google", options: { redirectTo: `${location.origin}/auth/callback?next=/account`, queryParams: { prompt: "select_account" } } });
    if (error) setIdMsg({ ok: false, text: /manual linking/i.test(error.message) ? "Linking accounts is switched off in Supabase (Authentication → Sign In / Providers → Allow manual linking)." : error.message });
  }
  async function unlink(identity: Identity) {
    if (props.identities.length < 2) return;
    if (!window.confirm(`Remove ${LABEL[identity.provider] ?? identity.provider} sign-in from this account?`)) return;
    const { data } = await sb.auth.getUserIdentities();
    const target = data?.identities.find((i) => i.identity_id === identity.id);
    if (!target) return;
    const { error } = await sb.auth.unlinkIdentity(target);
    if (error) setIdMsg({ ok: false, text: error.message }); else router.refresh();
  }

  // password
  const [pw, setPw] = useState({ a: "", b: "" });
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  async function setPassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw.a.length < 8) return setPwMsg({ ok: false, text: "Use at least 8 characters." });
    if (pw.a !== pw.b) return setPwMsg({ ok: false, text: "The two passwords don't match." });
    const { error } = await sb.auth.updateUser({ password: pw.a });
    setPwMsg(error ? { ok: false, text: error.message } : { ok: true, text: "Password saved. You can now also sign in with your email and password." });
    if (!error) setPw({ a: "", b: "" });
  }

  // phone
  const [phone, setPhone] = useState(props.phone);
  const [phoneMsg, setPhoneMsg] = useState<{ ok: boolean; text: string } | null>(null);
  async function savePhone(e: React.FormEvent) {
    e.preventDefault();
    const v = phone.replace(/[\s-]/g, "");
    const res = await fetch("/api/me/phone", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: v }) });
    setPhoneMsg(res.ok ? { ok: true, text: v ? "Number saved." : "Number removed." } : { ok: false, text: (await res.json().catch(() => null))?.error ?? "Could not save." });
  }

  // two-step (TOTP)
  const [factors, setFactors] = useState<Factor[] | null>(null);
  const [enroll, setEnroll] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [mfaMsg, setMfaMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const loadFactors = async () => { const { data } = await sb.auth.mfa.listFactors(); setFactors(data?.totp ?? []); };
  useEffect(() => { let live = true; sb.auth.mfa.listFactors().then(({ data }) => { if (live) setFactors(data?.totp ?? []); }); return () => { live = false; }; }, [sb]);
  async function startEnroll() {
    setMfaMsg(null);
    const { data, error } = await sb.auth.mfa.enroll({ factorType: "totp", friendlyName: `Authenticator ${new Date().toISOString().slice(0, 10)}` });
    if (error || !data) return setMfaMsg({ ok: false, text: error?.message ?? "Could not start." });
    setEnroll({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  }
  async function confirmEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!enroll) return;
    const { error } = await sb.auth.mfa.challengeAndVerify({ factorId: enroll.id, code: code.trim() });
    if (error) return setMfaMsg({ ok: false, text: "That code didn't work. Check the time on your phone and try the newest code." });
    setEnroll(null); setCode(""); setMfaMsg({ ok: true, text: "Two-step verification is on. You'll enter a code from your app when you sign in." });
    loadFactors();
  }
  async function cancelEnroll() { if (enroll) await sb.auth.mfa.unenroll({ factorId: enroll.id }); setEnroll(null); setCode(""); }
  async function removeFactor(id: string) {
    if (!window.confirm("Turn off two-step verification?")) return;
    const { error } = await sb.auth.mfa.unenroll({ factorId: id });
    if (error) setMfaMsg({ ok: false, text: /aal2/i.test(error.message) ? "Sign out and back in with your code first, then try again." : error.message }); else { setMfaMsg({ ok: true, text: "Two-step verification is off." }); loadFactors(); }
  }
  const verified = (factors ?? []).filter((f) => f.status === "verified");

  async function signOutEverywhere() {
    if (!window.confirm("Sign out on all devices, including this one?")) return;
    await sb.auth.signOut({ scope: "global" });
    window.location.href = "/login";
  }

  return (
    <div className="space-y-6">
      <Box title="Email" desc="Used to sign in and for job applications you send.">
        <dl className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-[160px_1fr]">
          <dt className="text-muted">Primary email</dt><dd className="font-medium">{props.email || "—"}</dd>
          {props.newEmail && <><dt className="text-muted">Pending change</dt><dd>{props.newEmail} (waiting for confirmation)</dd></>}
          <dt className="text-muted">Account created</dt><dd>{fmt(props.joined)}</dd>
          <dt className="text-muted">Last sign-in</dt><dd>{fmt(props.lastSignIn)}</dd>
        </dl>
        <form onSubmit={changeEmail} className="mt-4 flex flex-wrap gap-2">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="New email address" aria-label="New email address" className={`${input} max-w-xs`} />
          <button className={btn}>Change email</button>
        </form>
        <Msg m={emailMsg} />
      </Box>

      <Box title="Sign-in methods" desc="Ways you can sign in to this account.">
        <ul className="divide-y divide-line rounded-md border border-line">
          {props.identities.map((i) => (
            <li key={i.id} className="flex items-center gap-3 px-4 py-3 text-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {LOGO[i.provider] ? <img src={LOGO[i.provider]} alt="" className="h-5 w-5" /> : <span aria-hidden="true" className="grid h-5 w-5 place-items-center">✉</span>}
              <div className="flex-1"><b>{LABEL[i.provider] ?? i.provider}</b>{i.email && <span className="ms-2 text-muted">{i.email}</span>}<p className="text-xs text-muted">Connected {fmt(i.created)}</p></div>
              {props.identities.length > 1 && <button type="button" onClick={() => unlink(i)} className={`${btn} text-bad`}>Remove</button>}
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          {props.providers.filter((p) => !linked.has(p.id)).map((p) => (
            <button key={p.id} type="button" onClick={() => link(p.id)} className={`${btn} flex items-center gap-2`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {LOGO[p.id] && <img src={LOGO[p.id]} alt="" className="h-4 w-4" />} Connect {p.label}
            </button>
          ))}
        </div>
        <Msg m={idMsg} />
      </Box>

      <Box title="Password" desc="Optional. Lets you sign in with email and password as well.">
        <form onSubmit={setPassword} className="grid max-w-md gap-3">
          <input type="password" autoComplete="new-password" value={pw.a} onChange={(e) => setPw({ ...pw, a: e.target.value })} placeholder="New password (8+ characters)" aria-label="New password" className={input} />
          <input type="password" autoComplete="new-password" value={pw.b} onChange={(e) => setPw({ ...pw, b: e.target.value })} placeholder="Repeat new password" aria-label="Repeat new password" className={input} />
          <button className={`${primary} justify-self-start`}>Save password</button>
        </form>
        <Msg m={pwMsg} />
      </Box>

      <Box title="Two-step verification" desc="Ask for a 6-digit code from an authenticator app (Google Authenticator, Microsoft Authenticator, 2FAS…) when you sign in.">
        {factors === null ? <p className="text-sm text-muted">Loading…</p> : verified.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full border border-accent px-2 py-0.5 text-xs text-accent">On</span>
            <span>{verified[0].friendly_name ?? "Authenticator app"}</span>
            <button type="button" onClick={() => removeFactor(verified[0].id)} className={`${btn} text-bad`}>Turn off</button>
          </div>
        ) : enroll ? (
          <form onSubmit={confirmEnroll} className="flex flex-wrap gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={enroll.qr} alt="QR code for your authenticator app" className="h-44 w-44 rounded-md border border-line bg-white p-2" />
            <div className="min-w-0 flex-1 space-y-3 text-sm">
              <p>1. Scan this QR code with your authenticator app.<br />Can&apos;t scan? Enter this key: <code className="break-all rounded bg-subtle px-1 font-mono text-xs">{enroll.secret}</code></p>
              <label className="block">2. Enter the 6-digit code it shows:
                <input inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} className={`${input} mt-1 max-w-[10rem] font-mono tracking-widest`} required minLength={6} /></label>
              <div className="flex gap-2"><button className={primary}>Turn on</button><button type="button" onClick={cancelEnroll} className={btn}>Cancel</button></div>
            </div>
          </form>
        ) : (
          <button type="button" onClick={startEnroll} className={primary}>Set up two-step verification</button>
        )}
        <Msg m={mfaMsg} />
      </Box>

      <Box title="Phone number" desc="Private. Only used if we need to reach you; never shown on your profile.">
        <form onSubmit={savePhone} className="flex flex-wrap gap-2">
          <input type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" aria-label="Phone number" className={`${input} max-w-xs`} />
          <button className={btn}>Save number</button>
        </form>
        <Msg m={phoneMsg} />
      </Box>

      <section className="rounded-md border border-bad">
        <div className="border-b border-bad px-5 py-3"><h2 className="font-semibold text-bad">Sessions</h2></div>
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 text-sm">
          <p>Lost a phone or used a shared computer? Sign out of SkillPath AI on every device.</p>
          <button type="button" onClick={signOutEverywhere} className={`${btn} border-bad text-bad`}>Sign out everywhere</button>
        </div>
      </section>
    </div>
  );
}
