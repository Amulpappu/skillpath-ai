import { describe, expect, it } from "vitest";
import { COMPANIES, SECTIONS, readiness } from "@/lib/company/catalog";
import { ALL_PROBLEMS, LADDER, OPEN_PRACTICE, WARMUPS, dailyTarget, nextProblems, paceFrom } from "@/lib/practice/catalog";

describe("Practice Coach", () => {
  it("has unique problem ids and https links on the right platforms", () => {
    expect(new Set(ALL_PROBLEMS.map((p) => p.id)).size).toBe(ALL_PROBLEMS.length);
    expect(ALL_PROBLEMS.length).toBeGreaterThanOrEqual(70);
    for (const p of ALL_PROBLEMS) expect(p.url).toMatch(/^https:\/\/leetcode\.com\/problems\/[a-z0-9-]+\/$/);
    for (const w of Object.values(WARMUPS)) expect(w.url).toMatch(/^https:\/\/www\.hackerrank\.com\//);
    expect(OPEN_PRACTICE.map((o) => o.platform)).toEqual(expect.arrayContaining(["GeeksforGeeks", "CodeChef", "HackerRank", "LeetCode"]));
  });

  it("keeps problems easiest-first inside each topic", () => {
    const rank = { Easy: 0, Medium: 1, Hard: 2 };
    for (const t of LADDER) {
      const r = t.problems.map((p) => rank[p.difficulty]);
      expect(r, t.name).toEqual([...r].sort((a, b) => a - b));
    }
  });

  it("unlocks the next problems in the learner's topic order, skipping solved and skipped ones", () => {
    const first = nextProblems(["graphs"], {}, 2);
    expect(first.map((p) => p.id)).toEqual(["lc-number-of-islands", "lc-rotting-oranges"]);
    const after = nextProblems(["graphs"], { "lc-number-of-islands": "solved", "lc-rotting-oranges": "skipped" }, 1);
    expect(after[0].id).toBe("lc-clone-graph");
  });

  it("sizes the daily load from hours and pace (1 to 5)", () => {
    expect(dailyTarget(1)).toBe(1);
    expect(dailyTarget(14)).toBe(3);
    expect(dailyTarget(14, 2)).toBe(5);
    expect(dailyTarget(80, 2)).toBe(5);
  });

  it("measures pace only with enough evidence and clamps it", () => {
    expect(paceFrom([{ estimateMin: 20, actualMin: 10 }])).toBe(1);
    expect(paceFrom(Array(4).fill({ estimateMin: 20, actualMin: 10 }))).toBe(2);
    expect(paceFrom(Array(4).fill({ estimateMin: 20, actualMin: 80 }))).toBe(0.5);
  });
});

describe("Company prep and placement readiness", () => {
  it("every company links to an https careers page and uses known sections", () => {
    for (const c of COMPANIES) {
      expect(c.careers).toMatch(/^https:\/\//);
      for (const s of c.sections) expect(SECTIONS[s]).toBeDefined();
    }
  });

  it("weights evidence 40/30/20/10 and points at the weakest area", () => {
    const full = { targetRole: true, dreamCompany: true, codingHandle: true, skills: true };
    const r = readiness({ coreSkillMastery: [100, 100], practiceSolved: 0, practiceTotal: 80, placementScores: [100], profileFields: full });
    expect(r.score).toBe(70);
    expect(r.parts).toEqual({ skills: 100, practice: 0, tests: 100, profile: 100 });
    expect(r.advice).toMatch(/coding problems/);
    const empty = readiness({ coreSkillMastery: [], practiceSolved: 0, practiceTotal: 80, placementScores: [], profileFields: { targetRole: false, dreamCompany: false, codingHandle: false, skills: false } });
    expect(empty.score).toBe(0);
    expect(empty.band).toBe("Getting started");
  });
});
