/** Shared domain types for SkillPath AI. */

export type Level = "beginner" | "intermediate" | "advanced";

export interface Skill {
  name: string;
  level: Level;
}

export interface Profile {
  name: string;
  skills: Skill[];
  certifications: string[];
  projects: string[];
  targetRole: string;
  /** Skills the learner has already completed inside SkillPath (kept across goal changes). */
  learnedSkills: string[];
}

export interface SkillInsight {
  skill: string;
  reason: string;
}

export interface SkillAnalysis {
  strengths: SkillInsight[];
  weaknesses: SkillInsight[];
  summary: string;
}

export type SkillStatus = "have" | "partial" | "missing";

export interface RequiredSkill {
  name: string;
  importance: "core" | "useful";
  status: SkillStatus;
}

export interface CareerMatch {
  role: string;
  requiredSkills: RequiredSkill[];
  missingSkills: string[];
  matchPercent: number;
  summary: string;
}

export interface Resource {
  title: string;
  type: "course" | "tutorial" | "exercise";
  provider: string;
  url: string;
}

export interface RoadmapStep {
  id: string;
  week: number;
  skill: string;
  goal: string;
  resources: Resource[];
  exercise: string;
  /** True when the Mentor inserted this step after a weak assessment. */
  remedial?: boolean;
}

export interface MentorNote {
  message: string;
  nextAction: string;
}

export type AgentName =
  | "Skill Analyst"
  | "Career Matcher"
  | "Learning Planner"
  | "Assessment Agent"
  | "AI Mentor";

/** Where an agent's answer came from: the Gemini model or the built-in rule engine. */
export type AgentSource = "gemini" | "rules";

export interface AgentEvent {
  agent: AgentName;
  status: "running" | "done";
  detail: string;
  source?: AgentSource;
}

export interface AnalysisResult {
  analysis: SkillAnalysis;
  match: CareerMatch;
  roadmap: RoadmapStep[];
  mentor: MentorNote;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface QuizResult {
  skill: string;
  scorePercent: number;
  /** Question texts the learner got wrong. */
  missed: string[];
}

export interface AdaptResult {
  roadmap: RoadmapStep[];
  mentor: MentorNote;
}

/** One line of the NDJSON stream sent by the API routes. */
export type StreamMessage<T> =
  | { type: "agent"; event: AgentEvent }
  | { type: "result"; data: T }
  | { type: "error"; message: string };
