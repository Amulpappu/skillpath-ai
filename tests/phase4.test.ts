import { describe, expect, it } from "vitest";
import { ALL_SKILLS } from "@/lib/catalog";
import { jobSiteLinks, matches } from "@/lib/jobs/scout";
import { ALL_LABS, labsFor } from "@/lib/labs";

describe("Job Scout", () => {
  it("matches titles on the role's key words", () => {
    expect(matches("Senior Full Stack Developer (React/Node)", "Full Stack Developer")).toBe(true);
    expect(matches("Sales Manager", "Full Stack Developer")).toBe(false);
    expect(matches("Data Analyst Intern", "Data Analyst")).toBe(true);
  });
  it("builds https job-site searches and adds Indian sites only for India", () => {
    const india = jobSiteLinks("Data Analyst", "IN").map((l) => l.site);
    expect(india).toEqual(expect.arrayContaining(["LinkedIn Jobs", "Indeed", "Naukri", "foundit"]));
    expect(jobSiteLinks("Data Analyst", "DE").map((l) => l.site)).not.toContain("Naukri");
    for (const l of jobSiteLinks("C# Developer & Lead", "IN")) expect(l.url).toMatch(/^https:\/\/[^\s]+$/);
  });
});

describe("Hands-on labs", () => {
  it("gives every skill at least one https lab", () => {
    for (const s of ALL_SKILLS) { const labs = labsFor(s); expect(labs.length, s).toBeGreaterThan(0); }
    for (const l of ALL_LABS) expect(l.url).toMatch(/^https:\/\//);
  });
});
