import { z } from "zod";
import { exerciseFor, normalizeSkill, resourcesFor } from "../catalog";
import { askGemini } from "../gemini";
import type { Emit } from "../stream";
import type { CareerMatch, QuizResult, RoadmapStep } from "../types";
import { sanitizeForPrompt } from "../validation";
import { DATA_RULE, dataBlock, runAgent } from "./runAgent";

const planSchema = z.object({
  steps: z
    .array(
      z.object({
        skill: z.string().min(1).max(40),
        goal: z.string().min(1).max(300),
        exercise: z.string().min(1).max(400),
      }),
    )
    .max(12),
});

const remedialSchema = z.object({ goal: z.string().min(1).max(300), exercise: z.string().min(1).max(400) });

const PLAN_SYSTEM = `You are the Learning Planner agent in a multi-agent learning platform.
Order the given skill gaps into a learning roadmap, prerequisites first. Use every gap exactly once and add no other skills.
For each, write a one-sentence goal tied to the target role and one concrete practical exercise.
Do not include links; the platform attaches vetted resources itself.
${DATA_RULE}
Schema: {"steps":[{"skill":string,"goal":string,"exercise":string}]}`;

const REMEDIAL_SYSTEM = `You are the Learning Planner agent. The learner scored poorly on an assessment.
Write one focused revision step that targets the questions they missed: a one-sentence goal and one small practical exercise.
${DATA_RULE}
Schema: {"goal":string,"exercise":string}`;

export function stepId(skill: string, remedial = false): string {
  const slug = normalizeSkill(skill).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${remedial ? "revise" : "step"}-${slug || "skill"}`;
}

/** Skills to learn, core before useful, keeping the role's own order so prerequisites come first. */
export function gapsFrom(match: CareerMatch): string[] {
  const gaps = match.requiredSkills.filter((s) => s.status !== "have");
  return [...gaps.filter((s) => s.importance === "core"), ...gaps.filter((s) => s.importance !== "core")].map((s) => s.name);
}

type Draft = { skill: string; goal: string; exercise: string };

/** Turns drafts into roadmap steps, keeping only real gaps and attaching curated resources. */
export function buildRoadmap(match: CareerMatch, drafts: Draft[]): RoadmapStep[] {
  const gaps = gapsFrom(match);
  const byKey = new Map(drafts.map((d) => [normalizeSkill(d.skill), d]));
  const ordered = [
    ...drafts.map((d) => gaps.find((g) => normalizeSkill(g) === normalizeSkill(d.skill))),
    ...gaps,
  ].filter((g): g is string => Boolean(g));
  const unique = [...new Set(ordered)];

  if (unique.length === 0) {
    return [
      {
        id: "step-capstone",
        week: 1,
        skill: "Capstone project",
        goal: `Prove your ${match.role} skills with one complete, deployed project.`,
        resources: resourcesFor("Git"),
        exercise: `Plan, build and deploy a project that uses every core ${match.role} skill, then write a README for it.`,
      },
    ];
  }

  return unique.map((skill, index) => {
    const draft = byKey.get(normalizeSkill(skill));
    return {
      id: stepId(skill),
      week: index + 1,
      skill,
      goal: draft?.goal ?? `Learn ${skill} to the level expected of a ${match.role}.`,
      resources: resourcesFor(skill),
      exercise: draft?.exercise ?? exerciseFor(skill),
    };
  });
}

export function runLearningPlanner(match: CareerMatch, emit: Emit): Promise<RoadmapStep[]> {
  const gaps = gapsFrom(match);
  const data = { targetRole: sanitizeForPrompt(match.role), skillGaps: gaps };
  return runAgent({
    agent: "Learning Planner",
    emit,
    start: gaps.length ? `Sequencing ${gaps.length} skill gap(s) into a weekly roadmap` : "No gaps left; planning a capstone",
    ai: async () => buildRoadmap(match, (await askGemini(PLAN_SYSTEM, dataBlock(data), planSchema)).steps),
    rules: () => buildRoadmap(match, []),
    describe: (r) => `Built a ${r.length}-step roadmap starting with ${r[0].skill}; passed to AI Mentor`,
  });
}

/** Inserts (or refreshes) a revision step directly before the step the learner struggled with. */
export function insertRemedialStep(roadmap: RoadmapStep[], quiz: QuizResult, draft: Omit<Draft, "skill">): RoadmapStep[] {
  const id = stepId(quiz.skill, true);
  const cleaned = roadmap.filter((s) => s.id !== id);
  const target = cleaned.findIndex((s) => normalizeSkill(s.skill) === normalizeSkill(quiz.skill) && !s.remedial);
  const at = target === -1 ? 0 : target;
  const remedial: RoadmapStep = {
    id,
    week: cleaned[at]?.week ?? 1,
    skill: quiz.skill,
    goal: draft.goal,
    resources: resourcesFor(quiz.skill),
    exercise: draft.exercise,
    remedial: true,
  };
  return [...cleaned.slice(0, at), remedial, ...cleaned.slice(at)];
}

export function remedialDraftFromRules(quiz: QuizResult): Omit<Draft, "skill"> {
  return {
    goal: `Revisit ${quiz.skill} fundamentals before moving on; you scored ${quiz.scorePercent}%.`,
    exercise:
      quiz.missed.length > 0
        ? `Re-read the material behind the ${quiz.missed.length} question(s) you missed, write a short note explaining each answer, then retake the quiz.`
        : `Redo the ${quiz.skill} exercise from scratch without looking at your earlier solution, then retake the quiz.`,
  };
}

export function runRemedialPlanner(roadmap: RoadmapStep[], quiz: QuizResult, emit: Emit): Promise<RoadmapStep[]> {
  const data = {
    skill: sanitizeForPrompt(quiz.skill),
    scorePercent: quiz.scorePercent,
    missedQuestions: quiz.missed.map(sanitizeForPrompt),
  };
  return runAgent({
    agent: "Learning Planner",
    emit,
    start: `Re-planning around ${quiz.skill} after a ${quiz.scorePercent}% score`,
    ai: async () => insertRemedialStep(roadmap, quiz, await askGemini(REMEDIAL_SYSTEM, dataBlock(data), remedialSchema)),
    rules: () => insertRemedialStep(roadmap, quiz, remedialDraftFromRules(quiz)),
    describe: () => `Added a ${quiz.skill} revision step before the main step; passed to AI Mentor`,
  });
}
