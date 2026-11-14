import type { Profile } from "@/lib/types";

/** The sample scenario from the problem statement. */
export const sampleProfile: Profile = {
  name: "Asha",
  skills: [
    { name: "Python", level: "intermediate" },
    { name: "SQL", level: "intermediate" },
    { name: "Basic HTML", level: "beginner" },
  ],
  certifications: [],
  projects: ["Marks analyser"],
  targetRole: "Full Stack Developer",
  learnedSkills: [],
};
