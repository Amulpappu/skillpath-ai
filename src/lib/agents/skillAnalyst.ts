import { z } from "zod";
import { askGemini } from "../gemini";
import type { Emit } from "../stream";
import type { Profile, SkillAnalysis } from "../types";
import { sanitizeForPrompt } from "../validation";
import { DATA_RULE, dataBlock, runAgent, MARKET_CONTEXT } from "./runAgent";

const insight = z.object({ skill: z.string().min(1).max(60), reason: z.string().min(1).max(240) });
const schema = z.object({
  strengths: z.array(insight).max(8),
  weaknesses: z.array(insight).max(8),
  summary: z.string().min(1).max(400),
});

const SYSTEM = `You are the Skill Analyst agent in a multi-agent learning platform.
Assess the learner's strengths and weaknesses from their skills, levels, certifications and projects.
Base every point on the data given; do not invent skills. Keep each reason to one sentence.
${MARKET_CONTEXT}
${DATA_RULE}
Schema: {"strengths":[{"skill":string,"reason":string}],"weaknesses":[{"skill":string,"reason":string}],"summary":string}`;

/** Rule engine: confident skills are strengths; beginner skills and thin evidence are weaknesses. */
export function analyseWithRules(profile: Profile): SkillAnalysis {
  const strengths = profile.skills
    .filter((s) => s.level !== "beginner")
    .map((s) => ({ skill: s.name, reason: `Rated ${s.level} in your profile.` }));
  for (const learned of profile.learnedSkills) {
    strengths.push({ skill: learned, reason: "Completed on your SkillPath roadmap." });
  }
  const weaknesses = profile.skills
    .filter((s) => s.level === "beginner")
    .map((s) => ({ skill: s.name, reason: "Still at beginner level; needs practice before you can rely on it." }));
  if (profile.projects.length === 0) {
    weaknesses.push({ skill: "Practical experience", reason: "No projects listed yet to show applied skills." });
  }
  const summary =
    strengths.length > 0
      ? `Strongest in ${strengths.slice(0, 3).map((s) => s.skill).join(", ")}; ${weaknesses.length} area(s) need work.`
      : "No confident skills yet, so the roadmap starts from the fundamentals.";
  return { strengths, weaknesses, summary };
}

export function runSkillAnalyst(profile: Profile, emit: Emit): Promise<SkillAnalysis> {
  const data = {
    skills: profile.skills.map((s) => ({ name: sanitizeForPrompt(s.name), level: s.level })),
    completedOnPlatform: profile.learnedSkills.map(sanitizeForPrompt),
    certifications: profile.certifications.map(sanitizeForPrompt),
    projects: profile.projects.map(sanitizeForPrompt),
  };
  return runAgent({
    agent: "Skill Analyst",
    emit,
    start: `Reviewing ${profile.skills.length} skills, ${profile.certifications.length} certifications and ${profile.projects.length} projects`,
    ai: () => askGemini(SYSTEM, dataBlock(data), schema),
    rules: () => analyseWithRules(profile),
    describe: (a) => `Found ${a.strengths.length} strengths and ${a.weaknesses.length} weaknesses; passed to Career Matcher`,
  });
}
