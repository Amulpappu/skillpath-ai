import { beforeEach, describe, expect, it, vi } from "vitest";
import { type Draft, fingerprint, normalise, problems, rebalance, screen } from "@/lib/bank/quality";
import { gradeSchema, quizQuerySchema } from "@/lib/bank/schemas";

const good: Draft = {
  question: "What does `Array.prototype.map` return when called on [1, 2, 3] with x => x * 2?",
  options: ["[2, 4, 6]", "[1, 2, 3]", "6", "undefined"],
  answerIndex: 0,
  explanation: "map returns a new array with the callback applied to every element.",
};

describe("Question Smith quality gate", () => {
  it("accepts a well-formed question", () => {
    expect(problems(good)).toEqual([]);
  });

  it("rejects all/none-of-the-above, duplicate options and wrong option counts", () => {
    expect(problems({ ...good, options: ["[2, 4, 6]", "None of the above", "6", "x"] })).toContain("uses all/none/both-of-the-above style option");
    expect(problems({ ...good, options: ["A", "a", "B", "C"] })).toContain("duplicate options");
    expect(problems({ ...good, options: ["A", "B", "C"] })).toContain("needs exactly 4 options");
    expect(problems({ ...good, answerIndex: 4 })).toContain("answer index out of range");
  });

  it("rejects a correct option that gives itself away by length", () => {
    const giveaway = { ...good, options: ["It returns a brand new array containing the result of calling the callback on every element", "A", "B", "C"] };
    expect(problems(giveaway)).toContain("correct option is a length give-away");
  });

  it("fingerprints ignore case, spacing and punctuation", () => {
    expect(normalise("What is  `let`?")).toBe("what is let");
    expect(fingerprint("JavaScript", "beginner", "What is let?")).toBe(fingerprint("javascript", "beginner", "what is LET ?!"));
    expect(fingerprint("JavaScript", "beginner", "What is let?")).not.toBe(fingerprint("JavaScript", "advanced", "What is let?"));
  });

  it("screen() drops duplicates within a batch and against the existing bank", () => {
    const seen = new Set([fingerprint("JS", "beginner", "Existing question about closures?")]);
    const { accepted, rejected } = screen("JS", "beginner", [good, { ...good }, { ...good, question: "Existing question about closures?" }], seen);
    expect(accepted).toHaveLength(1);
    expect(rejected.map((r) => r.reasons)).toEqual([["duplicate"], ["duplicate"]]);
  });

  it("rebalance() moves the answer but keeps it the same option", () => {
    const d = { ...good, fingerprint: "c3" + "0".repeat(30) }; // 0xc3 % 4 = 3
    const r = rebalance(d);
    expect(r.answerIndex).toBe(3);
    expect(r.options[r.answerIndex]).toBe(good.options[good.answerIndex]);
    expect(new Set(r.options)).toEqual(new Set(good.options));
  });
});

describe("bank API schemas", () => {
  it("rejects mismatched ids/answers and non-uuid ids", () => {
    const id = "6f1c1b7e-2a5b-4c9d-8e3f-1a2b3c4d5e6f";
    expect(gradeSchema.safeParse({ skill: "Java", level: "beginner", ids: [id], answers: [1] }).success).toBe(true);
    expect(gradeSchema.safeParse({ skill: "Java", level: "beginner", ids: [id], answers: [1, 2] }).success).toBe(false);
    expect(gradeSchema.safeParse({ skill: "Java", level: "beginner", ids: ["1 or 1=1"], answers: [1] }).success).toBe(false);
  });
  it("caps quiz size and defaults the category", () => {
    expect(quizQuerySchema.parse({ skill: "Java", level: "advanced" })).toMatchObject({ n: 10, category: "skill" });
    expect(quizQuerySchema.safeParse({ skill: "Java", level: "advanced", n: "500" }).success).toBe(false);
  });
});

// ---------- growOnce with Gemini and Supabase faked ----------
const gemini = vi.hoisted(() => ({ calls: [] as string[], blind: [] as number[] }));
vi.mock("@/lib/gemini", () => ({
  geminiAvailable: () => true,
  askGemini: async (system: string) => {
    if (system.includes("assessment syllabi")) { gemini.calls.push("syllabus"); return { topics: ["Closures", "Promises", "Array methods", "Scope", "Events", "Modules", "Errors", "Types"] }; }
    if (system.includes("Question Smith")) {
      gemini.calls.push("write");
      return { questions: [good, { ...good, question: "Which keyword declares a block-scoped variable that cannot be reassigned?", options: ["const", "var", "let", "static"], answerIndex: 0 }, { ...good, options: ["1", "2", "3"] }] };
    }
    gemini.calls.push("blind");
    return { answers: gemini.blind };
  },
}));

function fakeDb() {
  const tables: Record<string, Record<string, unknown>[]> = { bank_topics: [], questions: [] };
  const builder = (table: string) => {
    const filters: [string, unknown][] = [];
    const rows = () => tables[table].filter((r) => filters.every(([k, v]) => (v === null ? r[k] == null : r[k] === v)));
    const api: Record<string, unknown> = {
      select: () => api, order: () => api,
      eq: (k: string, v: unknown) => { filters.push([k, v]); return api; },
      is: (k: string, v: unknown) => { filters.push([k, v]); return api; },
      insert: async (r: Record<string, unknown>[]) => { tables[table].push(...r.map((x) => ({ generated: 0, ...x }))); return { error: null }; },
      upsert: async (r: Record<string, unknown>[]) => { tables[table].push(...r); return { error: null }; },
      update: (patch: Record<string, unknown>) => ({ eq: function eqChain(k: string, v: unknown) { filters.push([k, v]); if (filters.length >= 4) rows().forEach((r) => Object.assign(r, patch)); return { eq: eqChain }; } }),
      then: (res: (v: unknown) => void) => res({ data: rows(), error: null }),
    };
    return api;
  };
  return { tables, client: { from: builder } as never };
}

describe("Question Smith growOnce (Gemini + DB faked)", () => {
  beforeEach(() => { gemini.calls = []; });

  it("builds a syllabus once, screens, blind-checks and stores only verified questions", async () => {
    const { growOnce } = await import("@/lib/bank/smith");
    const db = fakeDb();
    gemini.blind = [0, 2]; // checker agrees on the first question only
    const r1 = await growOnce(db.client, { skill: "JavaScript", level: "beginner" });
    expect(gemini.calls).toEqual(["syllabus", "write", "blind"]);
    expect(r1).toMatchObject({ added: 1, rejected: 1, disagreed: 1 });
    expect(db.tables.questions).toHaveLength(1);
    expect(db.tables.questions[0]).toMatchObject({ skill: "JavaScript", level: "beginner", verified: true, topic: "Closures" });
    expect(db.tables.bank_topics).toHaveLength(8);

    gemini.calls = []; gemini.blind = [0];
    const r2 = await growOnce(db.client, { skill: "JavaScript", level: "beginner" });
    expect(gemini.calls).toEqual(["write", "blind"]); // syllabus reused
    expect(r2.rejected).toBeGreaterThanOrEqual(2); // the stored question is now a duplicate
  });
});
