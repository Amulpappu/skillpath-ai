import { z } from "zod";
import { normalizeSkill } from "../catalog";
import { askGemini, geminiAvailable } from "../gemini";
import { PASS_MARK, passed } from "../scoring";
import type { Emit } from "../stream";
import type { Level, QuizQuestion, QuizResult } from "../types";
import { sanitizeForPrompt } from "../validation";
import { DATA_RULE, dataBlock } from "./runAgent";

const QUESTION_COUNT = 5;

const schema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string().min(1).max(400),
        options: z.array(z.string().min(1).max(200)).length(4),
        answerIndex: z.number().int().min(0).max(3),
        explanation: z.string().min(1).max(400),
      }),
    )
    .length(QUESTION_COUNT),
});

const SYSTEM = `You are the Assessment Agent in a multi-agent learning platform.
Write exactly ${QUESTION_COUNT} multiple-choice questions that test practical understanding of the skill at the given level.
Each question has exactly 4 options, one correct. Vary the position of the correct answer. Keep explanations to one sentence.
${DATA_RULE}
Schema: {"questions":[{"question":string,"options":[string,string,string,string],"answerIndex":0-3,"explanation":string}]}`;

const q = (question: string, options: string[], answerIndex: number, explanation: string): QuizQuestion => ({
  question,
  options,
  answerIndex,
  explanation,
});

/** Built-in question bank so the sample scenario works without the AI service. */
const QUESTION_BANK: Record<string, QuizQuestion[]> = {
  javascript: [
    q("Which keyword declares a variable that cannot be reassigned?", ["var", "let", "const", "static"], 2, "const creates a binding that cannot be reassigned."),
    q("What does [1, 2, 3].map(x => x * 2) return?", ["[1, 2, 3]", "[2, 4, 6]", "6", "undefined"], 1, "map returns a new array with the function applied to each item."),
    q("What does === compare?", ["Value only", "Type only", "Value and type", "Object references only"], 2, "Strict equality compares both value and type without coercion."),
    q("What does an async function always return?", ["A Promise", "A callback", "undefined", "A generator"], 0, "async functions wrap their return value in a Promise."),
    q("Which method turns a JSON string into an object?", ["JSON.stringify", "JSON.parse", "Object.from", "JSON.toObject"], 1, "JSON.parse reads a JSON string and returns the value."),
  ],
  react: [
    q("Which hook adds state to a function component?", ["useEffect", "useRef", "useState", "useMemo"], 2, "useState returns a state value and a setter."),
    q("Why do list items need a key prop?", ["For styling", "So React can track items between renders", "To make them clickable", "For accessibility"], 1, "Keys let React match items across renders and update efficiently."),
    q("How does data normally flow between React components?", ["Child to parent through props", "Parent to child through props", "Through global variables", "Through the DOM"], 1, "Props flow one way, from parent to child."),
    q("When does useEffect with an empty dependency array run?", ["On every render", "Only when state changes", "Once after the first render", "Never"], 2, "An empty array means the effect runs once after mount."),
    q("What should you never do with state?", ["Read it", "Pass it as a prop", "Mutate it directly", "Initialise it"], 2, "State must be replaced through its setter so React knows to re-render."),
  ],
  "node.js": [
    q("What is Node.js?", ["A browser", "A JavaScript runtime", "A database", "A CSS framework"], 1, "Node.js runs JavaScript outside the browser."),
    q("Which file lists a project's dependencies?", ["index.js", "node.config", "package.json", ".gitignore"], 2, "package.json records dependencies and scripts."),
    q("Why does Node.js handle many connections well?", ["One thread per request", "Non-blocking, event-driven I/O", "It compiles to C", "It caches every response"], 1, "The event loop handles I/O without blocking."),
    q("In Express, what does app.get('/users', handler) do?", ["Creates a database table", "Handles GET requests to /users", "Downloads a users file", "Starts the server"], 1, "It registers a handler for GET requests on that path."),
    q("Where should an API key be kept in a Node.js app?", ["In the source code", "In an environment variable", "In the README", "In the client bundle"], 1, "Secrets belong in environment variables, outside the code."),
  ],
};

export class QuizUnavailableError extends Error {}

export function quizFromBank(skill: string): QuizQuestion[] | undefined {
  return QUESTION_BANK[normalizeSkill(skill)];
}

/** Generates a quiz with Gemini, or serves the built-in bank when the model is unavailable. */
export async function generateQuiz(skill: string, level: Level): Promise<{ questions: QuizQuestion[]; source: "gemini" | "rules" }> {
  if (geminiAvailable()) {
    try {
      const data = { skill: sanitizeForPrompt(skill), level };
      const { questions } = await askGemini(SYSTEM, dataBlock(data), schema);
      return { questions, source: "gemini" };
    } catch (error) {
      console.warn("Assessment Agent: Gemini failed, using question bank", error);
    }
  }
  const banked = quizFromBank(skill);
  if (!banked) throw new QuizUnavailableError(`No offline quiz for ${skill}`);
  return { questions: banked, source: "rules" };
}

/** Evaluates a graded quiz and reports the verdict to the Mentor. */
export function runAssessmentReview(quiz: QuizResult, emit: Emit): boolean {
  const ok = passed(quiz);
  emit({ agent: "Assessment Agent", status: "running", detail: `Evaluating the ${quiz.skill} quiz` });
  emit({
    agent: "Assessment Agent",
    status: "done",
    detail: `${quiz.scorePercent}% (pass mark ${PASS_MARK}%), ${quiz.missed.length} missed; ${
      ok ? "passed" : "flagged as a weak area"
    } and reported to AI Mentor`,
    source: "rules",
  });
  return ok;
}
