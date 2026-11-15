import { jsonError } from "@/lib/stream";
import { currentUser, supabaseServer } from "@/lib/supabase/server";

/** Search people by name, username or headline. Returns identity only, never progress. */
export async function GET(request: Request): Promise<Response> {
  const user = await currentUser();
  if (!user) return jsonError("Please sign in first.", 401);
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").slice(0, 60);
  const scope = ["all", "following", "followers"].includes(url.searchParams.get("scope") ?? "") ? url.searchParams.get("scope")! : "all";
  const { data, error } = await (await supabaseServer()).rpc("search_people", { p_query: q, p_scope: scope, p_limit: 30 });
  if (error) return jsonError("Could not load people.", 500);
  return Response.json(data ?? [], { headers: { "Cache-Control": "no-store" } });
}
