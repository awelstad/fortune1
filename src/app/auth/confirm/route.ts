import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Completes email-link auth (password recovery / invites / magic links).
 * Supports both `token_hash` links and PKCE `code` links.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/admin";
  // only allow same-site relative redirects
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/admin";

  const supabase = await createClient();
  let error: { message: string } | null = null;

  if (tokenHash && type) {
    ({ error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash }));
  } else if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else {
    error = { message: "Missing token" };
  }

  if (error) {
    return NextResponse.redirect(new URL(`/admin/login?error=link`, origin));
  }
  return NextResponse.redirect(new URL(next, origin));
}
