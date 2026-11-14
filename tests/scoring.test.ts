import { describe, expect, it } from "vitest";
import { PASS_MARK, gradeQuiz, matchPercent, passed, skillStatus, statusFromLevel } from "@/lib/scoring";
import type { QuizQuestion } from "@/lib/types";
import { sampleProfile } from "./fixtures";

const question = (answerIndex: number): QuizQuestion => ({
  question: `Q${answerIndex}`,
  options: ["a", "b", "c", "d"],
  answerIndex,
  explanation: "because",
});

describe("statusFromLevel", () => {
  it("treats beginner as partial and higher levels as have", () => {
    expect(statusFromLevel(undefined)).toBe("missing");
    expect(statusFromLevel("beginner")).toBe("partial");
    expect(statusFromLevel("intermediate")).toBe("have");
    expect(statusFromLevel("advanced")).toBe("have");
  });
});

describe("skillStatus", () => {
  it("matches skills regardless of case and qualifiers", () => {
    expect(skillStatus("html", sampleProfile)).toBe("partial");
    expect(skillStatus("SQL", sampleProfile)).toBe("have");
    expect(skillStatus("React", sampleProfile)).toBe("missing");
  });

  it("counts skills completed on the platform as have", () => {
    expect(skillStatus("React", { ...sampleProfile, learnedSkills: ["react"] })).toBe("have");
  });
});

describe("matchPercent", () => {
  it("weights core skills double and partial skills half", () => {
    const percent = matchPercent([
      { name: "A", importance: "core", status: "have" },
      { name: "B", importance: "core", status: "partial" },
      { name: "C", importance: "useful", status: "missing" },
    ]);
    expect(percent).toBe(60);
  });

  it("returns 0 for an empty list instead of dividing by zero", () => {
    expect(matchPercent([])).toBe(0);
  });
});

describe("gradeQuiz", () => {
  const questions = [question(0), question(1), question(2), question(3), question(0)];

  it("scores correct answers and lists missed questions", () => {
    const result = gradeQuiz("React", questions, [0, 1, 0, -1, 0]);
    expect(result.scorePercent).toBe(60);
    expect(result.missed).toEqual(["Q2", "Q3"]);
    expect(passed(result)).toBe(true);
  });

  it("fails below the pass mark", () => {
    const result = gradeQuiz("React", questions, [0, 0, 0, 0, 1]);
    expect(result.scorePercent).toBeLessThan(PASS_MARK);
    expect(passed(result)).toBe(false);
  });

  it("handles an empty quiz", () => {
    expect(gradeQuiz("React", [], []).scorePercent).toBe(0);
  });
});
