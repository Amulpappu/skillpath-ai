import { z } from "zod";
import { scanGitHub, validUsername } from "@/lib/github/scan";
import { parseRequest } from "@/lib/request";
import { jsonError } from "@/lib/stream";

const schema = z.object({ username: z.string().trim().refine(validUsername, "Enter a GitHub username, e.g. Amulpappu") });

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseRequest(request, schema, 6);
  if (!parsed.ok) return parsed.response;
  try {
    const scan = await scanGitHub(parsed.data.username);
    if (!scan.repos.length) return jsonError("No public projects found on that GitHub account.", 404);
    return Response.json({ ...scan, repos: scan.repos.map(({ readme: _r, ...r }) => ({ ...r, hasReadme: Boolean(_r) })) });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Could not read GitHub.", 502);
  }
}
