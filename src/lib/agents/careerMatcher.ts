import { z } from "zod";
import { GENERIC_REQUIREMENTS, ROLE_REQUIREMENTS, normalizeSkill } from "../catalog";
import { askGemini } from "../gemini";
import { matchPercent, skillStatus } from "../scoring";
import type { Emit } from "../stream";
import type { CareerMatch, Profile, RequiredSkill, SkillAnalysis } from "../types";
import { sanitizeForPrompt } from "../validation";
import { DATA_RULE, dataBlock, runAgent } from "./runAgent";

type Requirement = Pick<RequiredSkill, "name" | "importance">;

const schema = z.object({
  requiredSkills: z
    .array(z.object({ name: z.string().min(1).max(40), importance: z.enum(["core", "useful"]) }))
    .min(3)
    .max(10),
});

const SYSTEM = `You are the Career Matcher agent in a multi-agent learning platform.
List the skills an entry-level candidate needs for the target role: 4 to 6 "core" skills and 2 to 4 "useful" skills.
Use short, standard skill names (for example "JavaScript", "React", "SQL").
If the role appears in the reference list, use those skills.
${DATA_RULE}
Schema: {"requiredSkills":[{"name":string,"importance":"core"|"useful"}]}`;

/** Rule engine: look the role up in the catalog, or use general software fundamentals. */
export function requirementsFromCatalog(role: string): Requirement[] {
  const key = Object.keys(ROLE_REQUIREMENTS).find((r) => r.toLowerCase() === role.trim().toLowerCase());
  const { core, useful } = key ? ROLE_REQUIREMENTS[key] : GENERIC_REQUIREMENTS;
  return [
    ...core.map((name) => ({ name, importance: "core" as const })),
    ...useful.map((name) => ({ name, importance: "useful" as const })),
  ];
}

/**
 * Compares requirements with the learner's profile. Status and score are always computed in code,
 * so the match percentage is reproducible and never depends on model arithmetic.
 */
export function buildMatch(profile: Profile, requirements: Requirement[]): CareerMatch {
  const seen = new Set<string>();
  const requiredSkills: RequiredSkill[] = [];
  for (const req of requirements) {
    const key = normalizeSkill(req.name);
    if (seen.has(key)) continue;
    seen.add(key);
    requiredSkills.push({ ...req, status: skillStatus(req.name, profile) });
  }
  const missingSkills = requiredSkills.filter((s) => s.status === "missing").map((s) => s.name);
  const percent = matchPercent(requiredSkills);
  const summary =
    missingSkills.length === 0
      ? `You cover every skill listed for ${profile.targetRole}. Strengthen the partial ones to be job-ready.`
      : `You match ${percent}% of the ${profile.targetRole} profile. Missing: ${missingSkills.join(", ")}.`;
  return { role: profile.targetRole, requiredSkills, missingSkills, matchPercent: percent, summary };
}

export async function runCareerMatcher(profile: Profile, analysis: SkillAnalysis, emit: Emit): Promise<CareerMatch> {
  const data = {
    targetRole: sanitizeForPrompt(profile.targetRole),
    analystSummary: analysis.summary,
    referenceRoles: ROLE_REQUIREMENTS,
  };
  return runAgent({
    agent: "Career Matcher",
    emit,
    start: `Comparing the analyst's findings with ${profile.targetRole} requirements`,
    ai: async () => buildMatch(profile, (await askGemini(SYSTEM, dataBlock(data), schema)).requiredSkills),
    rules: () => buildMatch(profile, requirementsFromCatalog(profile.targetRole)),
    describe: (m) =>
      `${m.matchPercent}% match; ${m.missingSkills.length} missing skill(s) sent to Learning Planner${
        m.missingSkills.length ? `: ${m.missingSkills.join(", ")}` : ""
      }`,
  });
}
