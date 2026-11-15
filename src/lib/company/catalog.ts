/**
 * Company Prep Agent catalogue. Hiring patterns change every season, so this describes the TYPICAL
 * round types for each kind of company and always links to the official careers page for the current pattern.
 */

export type Section = { skill: string; category: "aptitude" | "english" | "problem-understanding" | "skill"; label: string };

/** Placement-test sections; their questions come from the shared bank (grown by the Question Smith). */
export const SECTIONS: Record<string, Section> = {
  quant: { skill: "Quantitative Aptitude", category: "aptitude", label: "Quantitative aptitude" },
  logical: { skill: "Logical Reasoning", category: "aptitude", label: "Logical reasoning" },
  verbal: { skill: "Verbal Ability", category: "english", label: "English: grammar and vocabulary" },
  reading: { skill: "Reading Comprehension", category: "english", label: "English: reading comprehension" },
  problem: { skill: "Problem Understanding", category: "problem-understanding", label: "Understanding the problem" },
  dsa: { skill: "Data Structures & Algorithms", category: "skill", label: "Data structures and algorithms" },
  cs: { skill: "DBMS", category: "skill", label: "CS fundamentals (DBMS)" },
};

/** Bank targets for the placement sections (the grow script fills these too). */
export const PLACEMENT_SKILLS = Object.values(SECTIONS).filter((s) => s.category !== "skill");

export type CompanyKind = "IT services" | "Product" | "Consulting";
export interface Company { name: string; kind: CompanyKind; careers: string; sections: (keyof typeof SECTIONS)[]; rounds: string[] }

const SERVICE_ROUNDS = ["Online test: aptitude, reasoning and English", "Coding test (1–2 problems)", "Technical interview", "HR interview"];
const PRODUCT_ROUNDS = ["Online assessment: data structures and algorithms", "Technical interviews (problem solving, CS fundamentals)", "System design or project discussion (experienced roles)", "Behavioural / hiring manager interview"];
const CONSULTING_ROUNDS = ["Online test: aptitude, reasoning and English", "Group discussion or case discussion", "Technical interview", "HR interview"];

const service = (name: string, careers: string): Company => ({ name, kind: "IT services", careers, rounds: SERVICE_ROUNDS, sections: ["quant", "logical", "verbal", "reading", "problem", "dsa"] });
const product = (name: string, careers: string): Company => ({ name, kind: "Product", careers, rounds: PRODUCT_ROUNDS, sections: ["problem", "dsa", "cs", "logical"] });
const consulting = (name: string, careers: string): Company => ({ name, kind: "Consulting", careers, rounds: CONSULTING_ROUNDS, sections: ["quant", "logical", "verbal", "reading", "problem"] });

export const COMPANIES: Company[] = [
  service("TCS", "https://www.tcs.com/careers"),
  service("Infosys", "https://www.infosys.com/careers.html"),
  service("Wipro", "https://careers.wipro.com"),
  service("Cognizant", "https://careers.cognizant.com"),
  service("HCLTech", "https://www.hcltech.com/careers"),
  service("Tech Mahindra", "https://careers.techmahindra.com"),
  service("Capgemini", "https://www.capgemini.com/careers/"),
  consulting("Accenture", "https://www.accenture.com/in-en/careers"),
  consulting("Deloitte", "https://www.deloitte.com/global/en/careers.html"),
  product("Zoho", "https://www.zoho.com/careers/"),
  product("Google", "https://www.google.com/about/careers/applications/"),
  product("Microsoft", "https://careers.microsoft.com"),
  product("Amazon", "https://www.amazon.jobs"),
  product("Flipkart", "https://www.flipkartcareers.com"),
];

/**
 * Placement Readiness score (0–100) from four evidence groups. Missing evidence counts as 0 so the
 * score only rises with real work.
 */
export function readiness(input: {
  coreSkillMastery: number[];      // latest quiz % per core skill of the target role
  practiceSolved: number; practiceTotal: number;
  placementScores: number[];       // latest % per aptitude / English / problem-understanding section
  profileFields: { targetRole: boolean; dreamCompany: boolean; codingHandle: boolean; skills: boolean };
}) {
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
  const skills = avg(input.coreSkillMastery);
  const practice = input.practiceTotal ? Math.min(100, (input.practiceSolved / input.practiceTotal) * 100) : 0;
  const tests = avg(input.placementScores);
  const f = input.profileFields;
  const profile = ([f.targetRole, f.dreamCompany, f.codingHandle, f.skills].filter(Boolean).length / 4) * 100;
  const parts = { skills: Math.round(skills), practice: Math.round(practice), tests: Math.round(tests), profile: Math.round(profile) };
  const score = Math.round(skills * 0.4 + practice * 0.3 + tests * 0.2 + profile * 0.1);
  const band = score >= 80 ? "Interview ready" : score >= 60 ? "Almost there" : score >= 35 ? "Building up" : "Getting started";
  const weakest = (Object.entries(parts) as [keyof typeof parts, number][]).sort((a, b) => a[1] - b[1])[0][0];
  const advice = { skills: "Take quizzes on your target role's core skills.", practice: "Solve your next coding problems in the Practice ladder.", tests: "Take the aptitude and English tests in Company prep.", profile: "Complete your profile: role, dream company and a coding handle." }[weakest];
  return { score, band, parts, advice };
}
