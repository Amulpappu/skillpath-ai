import { runAdaptation } from "@/lib/agents/mentor";
import { parseRequest } from "@/lib/request";
import { ndjsonResponse } from "@/lib/stream";
import { adaptRequestSchema } from "@/lib/validation";

export const maxDuration = 60;

/** Adapts the roadmap after a weak assessment and streams each agent's progress. */
export async function POST(request: Request): Promise<Response> {
  const parsed = await parseRequest(request, adaptRequestSchema, 10);
  if (!parsed.ok) return parsed.response;
  const { profile, match, roadmap, quiz } = parsed.data;
  return ndjsonResponse((emit) => runAdaptation(profile, match, roadmap, quiz, emit));
}
