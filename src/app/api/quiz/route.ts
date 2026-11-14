import { QuizUnavailableError, generateQuiz } from "@/lib/agents/assessmentAgent";
import { parseRequest } from "@/lib/request";
import { jsonError } from "@/lib/stream";
import { quizRequestSchema } from "@/lib/validation";

export const maxDuration = 30;

/** Returns a five-question quiz for one skill from the Assessment Agent. */
export async function POST(request: Request): Promise<Response> {
  const parsed = await parseRequest(request, quizRequestSchema, 15);
  if (!parsed.ok) return parsed.response;
  try {
    const quiz = await generateQuiz(parsed.data.skill, parsed.data.level);
    return Response.json(quiz, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof QuizUnavailableError) {
      return jsonError("The quiz service is unavailable for this skill right now. Please try again shortly.", 503);
    }
    console.error("Quiz generation failed", error);
    return jsonError("Could not create the quiz. Please try again.", 500);
  }
}
