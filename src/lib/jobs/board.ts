import { z } from "zod";

export const WORK_MODES = { onsite: "On-site", remote: "Remote", hybrid: "Hybrid" } as const;
export const JOB_TYPES = { "full-time": "Full-time", internship: "Internship", "part-time": "Part-time", contract: "Contract" } as const;
export const APP_STATUS = { applied: "Applied", shortlisted: "Shortlisted", rejected: "Not selected" } as const;

const https = z.string().trim().max(300).refine((v) => v === "" || /^https:\/\/\S{3,300}$/.test(v), "Links must start with https://");

export const jobPostSchema = z.object({
  title: z.string().trim().min(3).max(120),
  company: z.string().trim().min(1).max(120),
  location: z.string().trim().min(1).max(120),
  work_mode: z.enum(["onsite", "remote", "hybrid"]),
  job_type: z.enum(["full-time", "internship", "part-time", "contract"]),
  description: z.string().trim().min(20).max(4000),
  skills: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
  apply_url: https.default(""),
  apply_by: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")).default(""),
});

export const applicationSchema = z.object({
  note: z.string().trim().min(10).max(1000),
  contact_email: z.string().trim().email().max(200),
  resume_url: https.default(""),
});

