import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { authEnabled } from "@/lib/supabase/config";

export async function POST(request: NextRequest) {
  if (authEnabled()) await (await supabaseServer()).auth.signOut();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
