import { normalizeSkill } from "./catalog";
import type { Level, Profile, QuizQuestion, QuizResult, RequiredSkill, SkillStatus } from "./types";

/** Scores below this trigger the Mentor to adapt the roadmap. */
export const PASS_MARK = 60;

/** How a learner's stated level maps to readiness for a required skill. */
export function statusFromLevel(level: Level | undefined): SkillStatus {
  if (!level) return "missing";
  return level === "beginner" ? "partial" : "have";
}

/** Status of one required skill given the learner's profile and skills completed in the app. */
export function skillStatus(required: string, profile: Pick<Profile, "skills" | "learnedSkills">): SkillStatus {
  const key = normalizeSkill(required);
  if (profile.learnedSkills.some((s) => normalizeSkill(s) === key)) return "have";
  const owned = profile.skills.find((s) => normalizeSkill(s.name) === key);
  return statusFromLevel(owned?.level);
}

/**
 * Weighted match score from 0 to 100. Core skills count double.
 * A skill the learner fully has earns full weight, a partial skill earns half.
 */
export function matchPercent(skills: RequiredSkill[]): number {
  let earned = 0;
  let total = 0;
  for (const s of skills) {
    const weight = s.importance === "core" ? 2 : 1;
    total += weight;
    if (s.status === "have") earned += weight;
    else if (s.status === "partial") earned += weight / 2;
  }
  return total === 0 ? 0 : Math.round((earned / total) * 100);
}

/** Grades a quiz. `answers[i]` is the chosen option index for question i, or -1 when skipped. */
export function gradeQuiz(skill: string, questions: QuizQuestion[], answers: number[]): QuizResult {
  const missed = questions.filter((q, i) => answers[i] !== q.answerIndex).map((q) => q.question);
  const correct = questions.length - missed.length;
  const scorePercent = questions.length === 0 ? 0 : Math.round((correct / questions.length) * 100);
  return { skill, scorePercent, missed };
}

export function passed(result: QuizResult): boolean {
  return result.scorePercent >= PASS_MARK;
}
