import "server-only";

/**
 * Job Scout agent. No API keys and no card: it reads two free public job feeds (Arbeitnow and Remotive)
 * and builds ready-made searches on the big job sites for the learner's role and country.
 */
export interface Job { id: string; title: string; company: string; location: string; remote: boolean; url: string; source: "Arbeitnow" | "Remotive"; posted: string | null }

export const COUNTRIES = [
  { code: "IN", name: "India", indeed: "https://in.indeed.com" },
  { code: "US", name: "United States", indeed: "https://www.indeed.com" },
  { code: "GB", name: "United Kingdom", indeed: "https://uk.indeed.com" },
  { code: "CA", name: "Canada", indeed: "https://ca.indeed.com" },
  { code: "DE", name: "Germany", indeed: "https://de.indeed.com" },
  { code: "SG", name: "Singapore", indeed: "https://sg.indeed.com" },
  { code: "AE", name: "United Arab Emirates", indeed: "https://ae.indeed.com" },
  { code: "AU", name: "Australia", indeed: "https://au.indeed.com" },
] as const;

/** Search links on the main job sites; India-focused sites only appear for India. */
export function jobSiteLinks(role: string, countryCode: string) {
  const c = COUNTRIES.find((x) => x.code === countryCode) ?? COUNTRIES[0];
  const q = encodeURIComponent(role);
  const links = [
    { site: "LinkedIn Jobs", url: `https://www.linkedin.com/jobs/search/?keywords=${q}&location=${encodeURIComponent(c.name)}` },
    { site: "Indeed", url: `${c.indeed}/jobs?q=${q}&l=${encodeURIComponent(c.name)}` },
    { site: "Wellfound (startups)", url: "https://wellfound.com/jobs" },
  ];
  if (c.code === "IN") {
    const slug = role.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    links.push(
      { site: "Naukri", url: `https://www.naukri.com/${slug}-jobs` },
      { site: "foundit", url: `https://www.foundit.in/srp/results?query=${q}` },
      { site: "Internshala (internships)", url: "https://internshala.com/internships/" },
    );
  }
  return links;
}

const words = (role: string) => role.toLowerCase().replace(/\(.*?\)/g, " ").split(/[^a-z0-9+#.]+/).filter((w) => w.length > 2 && !["and", "the", "for"].includes(w));

/** Keep jobs whose title shares the role's key words (e.g. "full stack developer" → full, stack, developer). */
export function matches(title: string, role: string) {
  const t = title.toLowerCase();
  const ws = words(role);
  const hits = ws.filter((w) => t.includes(w)).length;
  return ws.length <= 1 ? hits === 1 : hits >= Math.min(2, ws.length);
}

async function getJson(url: string) {
  const res = await fetch(url, { signal: AbortSignal.timeout(8000), next: { revalidate: 3600 }, headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

/** Live listings from the free feeds, filtered to the role. Never throws: a failing feed just returns nothing. */
export async function liveJobs(role: string): Promise<Job[]> {
  const [arbeit, remotive] = await Promise.allSettled([
    getJson("https://www.arbeitnow.com/api/job-board-api"),
    getJson(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(words(role).slice(0, 2).join(" "))}&limit=50`),
  ]);
  const out: Job[] = [];
  if (arbeit.status === "fulfilled") {
    for (const j of (arbeit.value?.data ?? []) as Record<string, unknown>[]) {
      out.push({ id: `an-${j.slug}`, title: String(j.title ?? ""), company: String(j.company_name ?? ""), location: String(j.location ?? ""),
        remote: Boolean(j.remote), url: String(j.url ?? ""), source: "Arbeitnow", posted: j.created_at ? new Date(Number(j.created_at) * 1000).toISOString() : null });
    }
  }
  if (remotive.status === "fulfilled") {
    for (const j of (remotive.value?.jobs ?? []) as Record<string, unknown>[]) {
      out.push({ id: `rm-${j.id}`, title: String(j.title ?? ""), company: String(j.company_name ?? ""), location: String(j.candidate_required_location ?? "Remote"),
        remote: true, url: String(j.url ?? ""), source: "Remotive", posted: j.publication_date ? String(j.publication_date) : null });
    }
  }
  return out.filter((j) => j.url.startsWith("https://") && matches(j.title, role)).slice(0, 30);
}
