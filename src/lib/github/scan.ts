import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

export type Repo = { name: string; description: string; url: string; pushed: string; languages: Record<string, number>; readme: string };
export type Scan = { username: string; repos: Repo[]; languages: { name: string; percent: number; repos: string[] }[] };

const USERNAME = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;
// Files GitHub counts as languages but that aren't skills to verify.
const IGNORE = new Set(["Jupyter Notebook", "Makefile", "Dockerfile", "Batchfile", "Procfile", "Shell", "PowerShell", "Roff", "SCSS", "Less"]);
const cache = new Map<string, { at: number; scan: Scan }>();

export function validUsername(u: string) { return USERNAME.test(u); }

async function gh(path: string, raw = false): Promise<Response> {
  const headers: Record<string, string> = { "User-Agent": "SkillPath-AI", Accept: raw ? "application/vnd.github.raw+json" : "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return fetch(`https://api.github.com${path}`, { headers, signal: AbortSignal.timeout(8000), cache: "no-store" });
}

/** Reads a learner's public repositories: languages per project plus the start of each README. */
export async function scanGitHub(username: string): Promise<Scan> {
  const key = username.toLowerCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < 60 * 60 * 1000) return hit.scan;

  const res = await gh(`/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed&type=owner`);
  if (res.status === 404) throw new Error("No GitHub user with that name.");
  if (res.status === 403 || res.status === 429) throw new Error("GitHub is busy right now. Please try again in a few minutes.");
  if (!res.ok) throw new Error("Could not reach GitHub. Please try again.");
  const all = (await res.json()) as { name: string; fork: boolean; archived: boolean; description: string | null; html_url: string; pushed_at: string; size: number }[];
  const own = all.filter((r) => !r.fork && r.size > 0).slice(0, 8);

  const repos: Repo[] = await Promise.all(own.map(async (r, i) => {
    const [langRes, readmeRes] = await Promise.all([
      gh(`/repos/${encodeURIComponent(username)}/${encodeURIComponent(r.name)}/languages`),
      i < 5 ? gh(`/repos/${encodeURIComponent(username)}/${encodeURIComponent(r.name)}/readme`, true) : Promise.resolve(null),
    ]);
    const bytes = langRes.ok ? ((await langRes.json()) as Record<string, number>) : {};
    const total = Object.values(bytes).reduce((a, b) => a + b, 0) || 1;
    const languages = Object.fromEntries(Object.entries(bytes).filter(([l]) => !IGNORE.has(l)).map(([l, b]) => [l, Math.round((b / total) * 100)]).filter(([, p]) => (p as number) >= 3));
    const readme = readmeRes?.ok ? (await readmeRes.text()).replace(/<[^>]+>/g, " ").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\s+/g, " ").slice(0, 1200) : "";
    return { name: r.name, description: (r.description ?? "").slice(0, 200), url: r.html_url, pushed: r.pushed_at, languages, readme };
  }));

  const byLang = new Map<string, { weight: number; repos: string[] }>();
  for (const r of repos) for (const [l, p] of Object.entries(r.languages)) {
    const e = byLang.get(l) ?? { weight: 0, repos: [] };
    e.weight += p; e.repos.push(r.name); byLang.set(l, e);
  }
  const sum = [...byLang.values()].reduce((a, b) => a + b.weight, 0) || 1;
  const languages = [...byLang.entries()].map(([name, e]) => ({ name, percent: Math.round((e.weight / sum) * 100), repos: e.repos })).sort((a, b) => b.percent - a.percent);
  const scan = { username, repos, languages };
  cache.set(key, { at: Date.now(), scan });
  return scan;
}

/** Answer keys travel encrypted so the browser can't read them; only the server can grade. */
function key() {
  return createHash("sha256").update(`skillpath-github-check:${process.env.GEMINI_API_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "dev-only"}`).digest();
}
export function sealAnswers(data: unknown): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const body = Buffer.concat([c.update(JSON.stringify({ data, at: Date.now() })), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), body]).toString("base64url");
}
export function openAnswers<T>(token: string, maxAgeMs = 2 * 60 * 60 * 1000): T | null {
  try {
    const buf = Buffer.from(token, "base64url");
    const d = createDecipheriv("aes-256-gcm", key(), buf.subarray(0, 12));
    d.setAuthTag(buf.subarray(12, 28));
    const parsed = JSON.parse(Buffer.concat([d.update(buf.subarray(28)), d.final()]).toString()) as { data: T; at: number };
    return Date.now() - parsed.at < maxAgeMs ? parsed.data : null;
  } catch { return null; }
}
