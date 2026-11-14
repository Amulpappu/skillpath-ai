import { z } from "zod";
import { askGemini } from "../gemini";
import type { Emit } from "../stream";
import type { AdaptResult, AnalysisResult, CareerMatch, MentorNote, Profile, QuizResult, RoadmapStep } from "../types";
import { sanitizeForPrompt } from "../validation";
import { runAssessmentReview } from "./assessmentAgent";
import { runCareerMatcher } from "./careerMatcher";
import { runLearningPlanner, runRemedialPlanner } from "./learningPlanner";
import { DATA_RULE, dataBlock, runAgent } from "./runAgent";
import { runSkillAnalyst } from "./skillAnalyst";

const schema = z.object({ message: z.string().min(1).max(600), nextAction: z.string().min(1).max(240) });

const SYSTEM = `You are the AI Mentor, the lead agent in a multi-agent learning platform.
You receive the outputs of the Skill Analyst, Career Matcher, Learning Planner and Assessment Agent.
Write a short, encouraging and honest message to the learner (2 to 3 sentences) that explains what the plan is and why,
then one specific next action. If an event is given (goal change or weak quiz), explain how the plan changed because of it.
Use only the facts provided.
${DATA_RULE}
Schema: {"message":string,"nextAction":string}`;

/** The parts of a career match the Mentor needs. */
export type MatchSummary = Pick<CareerMatch, "role" | "matchPercent" | "missingSkills">;

type MentorEvent =
  | { kind: "initial" }
  | { kind: "goal_change"; from: string }
  | { kind: "weak_quiz"; quiz: QuizResult };

/** Rule engine for the mentor's guidance. */
export function mentorFromRules(name: string, match: MatchSummary, roadmap: RoadmapStep[], event: MentorEvent): MentorNote {
  const first = roadmap[0];
  const nextAction = `Start "${first.skill}": open the first resource, then do the exercise.`;
  if (event.kind === "weak_quiz") {
    return {
      message: `${name}, ${event.quiz.scorePercent}% on ${event.quiz.skill} tells us the basics need another pass, and that is normal. I added a revision step before you continue so the next topics have a solid base.`,
      nextAction: `Work through the ${event.quiz.skill} revision step, then retake the quiz.`,
    };
  }
  if (event.kind === "goal_change") {
    return {
      message: `${name}, you switched from ${event.from} to ${match.role}, so I rebuilt your plan. Skills you already completed still count: you are at ${match.matchPercent}% for the new role, with ${roadmap.length} step(s) to go.`,
      nextAction,
    };
  }
  return {
    message: `${name}, you already match ${match.matchPercent}% of what a ${match.role} needs. Your roadmap has ${roadmap.length} step(s), ordered so each one builds on the last.`,
    nextAction,
  };
}

function runMentor(profile: Profile, match: MatchSummary, roadmap: RoadmapStep[], event: MentorEvent, emit: Emit): Promise<MentorNote> {
  const name = sanitizeForPrompt(profile.name);
  const data = {
    learnerName: name,
    targetRole: sanitizeForPrompt(match.role),
    matchPercent: match.matchPercent,
    missingSkills: match.missingSkills,
    roadmap: roadmap.map((s) => ({ week: s.week, skill: s.skill, revision: Boolean(s.remedial) })),
    event:
      event.kind === "weak_quiz"
        ? { kind: event.kind, skill: sanitizeForPrompt(event.quiz.skill), scorePercent: event.quiz.scorePercent }
        : event.kind === "goal_change"
          ? { kind: event.kind, previousRole: sanitizeForPrompt(event.from) }
          : event,
  };
  return runAgent({
    agent: "AI Mentor",
    emit,
    start: "Reviewing every agent's output and writing guidance",
    ai: () => askGemini(SYSTEM, dataBlock(data), schema),
    rules: () => mentorFromRules(name, match, roadmap, event),
    describe: (m) => `Guidance ready. Next: ${m.nextAction}`,
  });
}

/**
 * Full pipeline: Skill Analyst -> Career Matcher -> Learning Planner -> AI Mentor.
 * Each agent receives the previous agent's output. A changed career goal re-runs the whole chain.
 */
export async function runAnalysis(profile: Profile, previousRole: string | undefined, emit: Emit): Promise<AnalysisResult> {
  const analysis = await runSkillAnalyst(profile, emit);
  const match = await runCareerMatcher(profile, analysis, emit);
  const roadmap = await runLearningPlanner(match, emit);
  const changed = previousRole && previousRole.toLowerCase() !== profile.targetRole.toLowerCase();
  const event: MentorEvent = changed ? { kind: "goal_change", from: previousRole } : { kind: "initial" };
  const mentor = await runMentor(profile, match, roadmap, event, emit);
  return { analysis, match, roadmap, mentor };
}

/**
 * Adaptation pipeline after a weak assessment:
 * Assessment Agent -> Learning Planner (revision step) -> AI Mentor.
 */
export async function runAdaptation(profile: Profile, match: MatchSummary, roadmap: RoadmapStep[], quiz: QuizResult, emit: Emit): Promise<AdaptResult> {
  runAssessmentReview(quiz, emit);
  const revised = await runRemedialPlanner(roadmap, quiz, emit);
  const mentor = await runMentor(profile, match, revised, { kind: "weak_quiz", quiz }, emit);
  return { roadmap: revised, mentor };
}
