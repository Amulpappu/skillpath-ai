import { z } from "zod";
import { ALL_SKILLS } from "../catalog";
import { levelSchema } from "../validation";

export const categorySchema = z.enum(["skill", "aptitude", "english", "problem-understanding"]);
const skill = z.string().min(1).max(60).refine((s) => ALL_SKILLS.includes(s) || /^[\p{L}\p{N} .&+#/()-]{1,60}$/u.test(s), "Unknown skill");

export const quizQuerySchema = z.object({
  skill, level: levelSchema, category: categorySchema.default("skill"),
  company: z.string().max(60).nullish(), n: z.coerce.number().int().min(1).max(30).default(10),
});

export const gradeSchema = z.object({
  skill, level: levelSchema, category: categorySchema.default("skill"), company: z.string().max(60).nullish(),
  ids: z.array(z.string().uuid()).min(1).max(30),
  answers: z.array(z.number().int().min(-1).max(3)).min(1).max(30),
  seconds: z.number().int().min(0).max(36_000).optional(),
}).refine((v) => v.ids.length === v.answers.length, "ids and answers must match");

export const growSchema = z.object({
  skill: z.string().max(60).optional(), level: levelSchema.optional(), category: categorySchema.default("skill"),
  company: z.string().max(60).nullish(),
});
