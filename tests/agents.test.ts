import { beforeEach, describe, expect, it } from "vitest";
import { QuizUnavailableError, generateQuiz, quizFromBank } from "@/lib/agents/assessmentAgent";
import { buildMatch, requirementsFromCatalog } from "@/lib/agents/careerMatcher";
import { buildRoadmap, gapsFrom, insertRemedialStep, remedialDraftFromRules, stepId } from "@/lib/agents/learningPlanner";
import { mentorFromRules, runAdaptation, runAnalysis } from "@/lib/agents/mentor";
import { analyseWithRules } from "@/lib/agents/skillAnalyst";
import type { AgentEvent, QuizResult } from "@/lib/types";
import { sampleProfile } from "./fixtures";

const sampleMatch = () => buildMatch(sampleProfile, requirementsFromCatalog("Full Stack Developer"));

beforeEach(() => {
  // No key: every agent must fall back to its rule engine.
  delete process.env.GEMINI_API_KEY;
});

describe("Skill Analyst rules", () => {
  it("separates confident skills from beginner ones", () => {
    const analysis = analyseWithRules(sampleProfile);
    expect(analysis.strengths.map((s) => s.skill)).toEqual(["Python", "SQL"]);
    expect(analysis.weaknesses.map((s) => s.skill)).toEqual(["Basic HTML"]);
  });

  it("flags missing practical experience", () => {
    const analysis = analyseWithRules({ ...sampleProfile, projects: [] });
    expect(analysis.weaknesses.some((w) => w.skill === "Practical experience")).toBe(true);
  });
});

describe("Career Matcher", () => {
  it("finds the gaps from the sample scenario", () => {
    const match = sampleMatch();
    expect(match.missingSkills).toEqual(expect.arrayContaining(["JavaScript", "React", "Node.js"]));
    expect(match.missingSkills).not.toContain("SQL");
    expect(match.matchPercent).toBeGreaterThan(0);
    expect(match.matchPercent).toBeLessThan(100);
  });

  it("uses general fundamentals for roles outside the catalog", () => {
    expect(requirementsFromCatalog("Astronaut").map((r) => r.name)).toContain("Git");
  });

  it("removes duplicate requirements", () => {
    const match = buildMatch(sampleProfile, [
      { name: "JavaScript", importance: "core" },
      { name: "JS", importance: "useful" },
    ]);
    expect(match.requiredSkills).toHaveLength(1);
  });

  it("raises the match when a skill has been learned", () => {
    const before = sampleMatch().matchPercent;
    const after = buildMatch({ ...sampleProfile, learnedSkills: ["React"] }, requirementsFromCatalog("Full Stack Developer")).matchPercent;
    expect(after).toBeGreaterThan(before);
  });
});

describe("Learning Planner", () => {
  it("puts core skills first, in prerequisite order, and attaches resources", () => {
    const match = sampleMatch();
    const roadmap = buildRoadmap(match, []);
    expect(roadmap[0].week).toBe(1);
    expect(roadmap.slice(0, 5).map((s) => s.skill)).toEqual(["HTML", "CSS", "JavaScript", "React", "Node.js"]);
    expect(roadmap.every((step) => step.resources.length > 0 && step.exercise.length > 0)).toBe(true);
    expect(roadmap.map((s) => s.skill)).not.toContain("SQL");
  });

  it("ignores skills the model adds that are not real gaps", () => {
    const roadmap = buildRoadmap(sampleMatch(), [{ skill: "Cobol", goal: "g", exercise: "e" }]);
    expect(roadmap.map((s) => s.skill)).not.toContain("Cobol");
    expect(roadmap).toHaveLength(gapsFrom(sampleMatch()).length);
  });

  it("follows the model's ordering and wording for real gaps", () => {
    const roadmap = buildRoadmap(sampleMatch(), [{ skill: "react", goal: "Custom goal", exercise: "Custom exercise" }]);
    expect(roadmap[0]).toMatchObject({ skill: "React", goal: "Custom goal", id: stepId("React") });
  });

  it("plans a capstone when no gaps remain", () => {
    const allLearned = { ...sampleProfile, learnedSkills: requirementsFromCatalog("Full Stack Developer").map((r) => r.name) };
    const roadmap = buildRoadmap(buildMatch(allLearned, requirementsFromCatalog("Full Stack Developer")), []);
    expect(roadmap).toHaveLength(1);
    expect(roadmap[0].skill).toBe("Capstone project");
  });

  it("inserts one revision step before the weak skill and does not duplicate it", () => {
    const quiz: QuizResult = { skill: "React", scorePercent: 20, missed: ["Q1"] };
    const roadmap = buildRoadmap(sampleMatch(), []);
    const once = insertRemedialStep(roadmap, quiz, remedialDraftFromRules(quiz));
    const twice = insertRemedialStep(once, quiz, remedialDraftFromRules(quiz));
    const index = once.findIndex((s) => s.remedial);
    expect(once[index + 1].skill).toBe("React");
    expect(once).toHaveLength(roadmap.length + 1);
    expect(twice.filter((s) => s.remedial)).toHaveLength(1);
  });
});

describe("Assessment Agent", () => {
  it("serves the built-in bank for the sample skills", async () => {
    const quiz = await generateQuiz("JS", "beginner");
    expect(quiz.source).toBe("rules");
    expect(quiz.questions).toHaveLength(5);
    for (const question of quiz.questions) {
      expect(question.options).toHaveLength(4);
      expect(question.answerIndex).toBeGreaterThanOrEqual(0);
      expect(question.answerIndex).toBeLessThan(4);
    }
  });

  it("reports when no offline quiz exists", async () => {
    expect(quizFromBank("Kubernetes")).toBeUndefined();
    await expect(generateQuiz("Kubernetes", "beginner")).rejects.toBeInstanceOf(QuizUnavailableError);
  });
});

describe("AI Mentor", () => {
  it("explains a goal change", () => {
    const match = sampleMatch();
    const note = mentorFromRules("Asha", match, buildRoadmap(match, []), { kind: "goal_change", from: "Data Analyst" });
    expect(note.message).toContain("Data Analyst");
    expect(note.message).toContain("Full Stack Developer");
  });
});

describe("agent pipelines", () => {
  it("runs the four analysis agents in order, each handing off to the next", async () => {
    const events: AgentEvent[] = [];
    const result = await runAnalysis(sampleProfile, undefined, (e) => events.push(e));
    const finished = events.filter((e) => e.status === "done").map((e) => e.agent);
    expect(finished).toEqual(["Skill Analyst", "Career Matcher", "Learning Planner", "AI Mentor"]);
    expect(events.every((e) => e.status === "running" || e.source === "rules")).toBe(true);
    expect(result.roadmap.length).toBeGreaterThan(0);
    expect(result.mentor.message).toContain("Asha");
  });

  it("adapts the plan when the career goal changes", async () => {
    const first = await runAnalysis(sampleProfile, undefined, () => {});
    const second = await runAnalysis({ ...sampleProfile, targetRole: "Data Analyst" }, first.match.role, () => {});
    expect(second.match.role).toBe("Data Analyst");
    expect(second.roadmap.map((s) => s.skill)).toContain("Pandas");
    expect(second.roadmap.map((s) => s.skill)).not.toContain("React");
    expect(second.mentor.message).toContain("Full Stack Developer");
  });

  it("adapts the plan after a weak assessment", async () => {
    const first = await runAnalysis(sampleProfile, undefined, () => {});
    const events: AgentEvent[] = [];
    const quiz: QuizResult = { skill: "JavaScript", scorePercent: 40, missed: ["Q1", "Q2", "Q3"] };
    const adapted = await runAdaptation(sampleProfile, first.match, first.roadmap, quiz, (e) => events.push(e));
    expect(adapted.roadmap.some((s) => s.remedial && s.skill === "JavaScript")).toBe(true);
    expect(adapted.mentor.message).toContain("40%");
    expect([...new Set(events.map((e) => e.agent))]).toEqual(["Assessment Agent", "Learning Planner", "AI Mentor"]);
  });
});
