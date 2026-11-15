"use client";

import { useEffect, useState } from "react";

interface Job { id: string; title: string; company: string; location: string; remote: boolean; url: string; source: string; posted: string | null }
interface Data { jobs: Job[]; sites: { site: string; url: string }[] }

export function JobScout({ roles, countries }: { roles: string[]; countries: { code: string; name: string }[] }) {
  const [role, setRole] = useState("Full Stack Developer");
  const [country, setCountry] = useState("IN");
  const [data, setData] = useState<Data | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const key = `${role}|${country}`;
  const loading = loadedKey !== key;

  useEffect(() => {
    let live = true;
    fetch(`/api/jobs?${new URLSearchParams({ role, country })}`).then((r) => r.json())
      .then((d) => { if (live) { setData(d); setLoadedKey(`${role}|${country}`); } })
      .catch(() => { if (live) setLoadedKey(`${role}|${country}`); });
    return () => { live = false; };
  }, [role, country]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 rounded-md border border-line bg-card p-5">
        <label className="text-sm font-medium">Role
          <select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 block w-72 rounded-md border border-line bg-card px-3 py-2">{roles.map((r) => <option key={r}>{r}</option>)}</select>
        </label>
        <label className="text-sm font-medium">Country
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="mt-1 block w-56 rounded-md border border-line bg-card px-3 py-2">{countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}</select>
        </label>
      </div>

      <section aria-labelledby="sites" className="rounded-md border border-line bg-card p-5">
        <h2 id="sites" className="font-semibold">Search the job sites</h2>
        <p className="mt-1 text-sm text-muted">Ready-made searches for {role} in {countries.find((c) => c.code === country)?.name}.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(data?.sites ?? []).map((s) => (
            <a key={s.site} href={s.url} target="_blank" rel="noopener noreferrer" className="rounded-md border border-line bg-card px-4 py-2 text-sm font-medium hover:border-ink">{s.site} ↗</a>
          ))}
        </div>
      </section>

      <section aria-labelledby="live" aria-busy={loading} className="rounded-md border border-line bg-card p-5">
        <div className="flex items-baseline justify-between"><h2 id="live" className="font-semibold">Live openings</h2><span className="text-xs text-muted">via Arbeitnow and Remotive (remote and international)</span></div>
        {loading ? <p className="mt-4 text-sm text-muted">The Job Scout is checking the feeds…</p> : (data?.jobs.length ?? 0) === 0 ? (
          <p className="mt-4 text-sm text-muted">No matching openings in the free feeds right now. Use the job-site searches above; they cover far more listings.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {data!.jobs.map((j) => (
              <li key={j.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-medium">{j.title}</p>
                  <p className="text-sm text-muted">{j.company} · {j.location}{j.remote ? " · Remote" : ""} · {j.source}</p>
                </div>
                <a href={j.url} target="_blank" rel="noopener noreferrer" className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover">View and apply ↗</a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
