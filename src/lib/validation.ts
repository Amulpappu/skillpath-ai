import { z } from "zod";

const text = (max: number) => z.string().trim().min(1).max(max);

export const levelSchema = z.enum(["beginner", "intermediate", "advanced"]);

export const profileSchema = z.object({
  name: text(60),
  skills: z.array(z.object({ name: text(40), level: levelSchema })).max(30),
  certifications: z.array(text(100)).max(15),
  projects: z.array(text(160)).max(15),
  targetRole: text(60),
  learnedSkills: z.array(text(40)).max(40),
});

const resourceSchema = z.object({
  title: text(160),
  type: z.enum(["course", "tutorial", "exercise"]),
  provider: text(60),
  url: z.url().max(400),
});

export const roadmapStepSchema = z.object({
  id: text(60),
  week: z.number().int().min(1).max(104),
  skill: text(40),
  goal: text(300),
  resources: z.array(resourceSchema).max(6),
  exercise: text(400),
  remedial: z.boolean().optional(),
});

export const analyzeRequestSchema = z.object({
  profile: profileSchema,
  previousRole: z.string().trim().max(60).optional(),
});

export const quizRequestSchema = z.object({
  skill: text(40),
  level: levelSchema,
});

export const adaptRequestSchema = z.object({
  profile: profileSchema,
  roadmap: z.array(roadmapStepSchema).min(1).max(30),
  match: z.object({
    role: text(60),
    matchPercent: z.number().min(0).max(100),
    missingSkills: z.array(text(40)).max(12),
  }),
  quiz: z.object({
    skill: text(40),
    scorePercent: z.number().min(0).max(100),
    missed: z.array(z.string().trim().max(400)).max(10),
  }),
});

/**
 * Removes characters that could break out of the delimited data block in a prompt.
 * User text is always sent to the model as data, never as instructions.
 */
export function sanitizeForPrompt(value: string): string {
  return value.replace(/[<>`]/g, "").replace(/\s+/g, " ").trim();
}
