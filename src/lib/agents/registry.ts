/**
 * The v2 agent team. Each agent has one job, a stage in the pipeline and the agents it hands off to.
 * The activity timeline and the "How it works" page are generated from this list.
 */
export type AgentId =
  | "profile-analyst" | "career-matcher" | "learning-planner" | "course-curator" | "question-smith"
  | "assessment" | "practice-coach" | "company-prep" | "placement-readiness" | "job-scout"
  | "progress-tracker" | "mentor";

export interface AgentInfo {
  id: AgentId;
  name: string;
  /** One-line job description shown in the UI. */
  job: string;
  stage: "understand" | "plan" | "learn" | "prove" | "place";
  handsOffTo: AgentId[];
}

export const AGENTS: AgentInfo[] = [
  { id: "profile-analyst", name: "Profile Analyst", stage: "understand", handsOffTo: ["career-matcher"],
    job: "Reads your skills, projects, interests and weekly time, and estimates how fast you learn." },
  { id: "career-matcher", name: "Career Matcher", stage: "understand", handsOffTo: ["learning-planner", "company-prep"],
    job: "Scores your fit for 44 roles worldwide and lists the exact skills you are missing." },
  { id: "learning-planner", name: "Learning Planner", stage: "plan", handsOffTo: ["course-curator", "practice-coach"],
    job: "Orders your skill gaps into a week-by-week roadmap sized to your pace and hours." },
  { id: "course-curator", name: "Course Curator", stage: "plan", handsOffTo: ["mentor"],
    job: "Attaches free, trusted courses and docs to every step. Links come from a fixed list, never invented." },
  { id: "question-smith", name: "Question Smith", stage: "learn", handsOffTo: ["assessment"],
    job: "Writes levelled questions with Gemini, checks each one and grows every skill's bank past 465." },
  { id: "assessment", name: "Assessment Agent", stage: "prove", handsOffTo: ["progress-tracker", "learning-planner"],
    job: "Runs adaptive quizzes, grades them and adds revision when you score under 60%." },
  { id: "practice-coach", name: "Practice Coach", stage: "learn", handsOffTo: ["progress-tracker"],
    job: "Gives you coding problems one at a time from LeetCode, GeeksforGeeks, CodeChef and HackerRank, easiest first." },
  { id: "company-prep", name: "Company Prep Agent", stage: "prove", handsOffTo: ["placement-readiness"],
    job: "Prepares you for your dream company's rounds: aptitude, English, problem understanding and technical." },
  { id: "placement-readiness", name: "Placement Readiness", stage: "place", handsOffTo: ["job-scout", "mentor"],
    job: "Combines quiz, practice and company-test results into one profile-strength score." },
  { id: "job-scout", name: "Job Scout", stage: "place", handsOffTo: ["mentor"],
    job: "Finds open jobs for your role and country and links the best job sites to search next." },
  { id: "progress-tracker", name: "Progress Tracker", stage: "prove", handsOffTo: ["learning-planner", "mentor"],
    job: "Measures your real pace and mastery, and asks the planner to speed up or slow down." },
  { id: "mentor", name: "AI Mentor", stage: "place", handsOffTo: [],
    job: "Reviews every agent's output and tells you the single next thing to do." },
];

export const agentById = (id: AgentId) => AGENTS.find((a) => a.id === id)!;
