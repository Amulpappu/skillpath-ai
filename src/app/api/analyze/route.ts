import { runAnalysis } from "@/lib/agents/mentor";
import { parseRequest } from "@/lib/request";
import { ndjsonResponse } from "@/lib/stream";
import { analyzeRequestSchema } from "@/lib/validation";

export const maxDuration = 60;

/** Runs the full agent pipeline for a learner profile and streams each agent's progress. */
export async function POST(request: Request): Promise<Response> {
  const parsed = await parseRequest(request, analyzeRequestSchema, 10);
  if (!parsed.ok) return parsed.response;
  const { profile, previousRole } = parsed.data;
  return ndjsonResponse((emit) => runAnalysis(profile, previousRole, emit));
}
