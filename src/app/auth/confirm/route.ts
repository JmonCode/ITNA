import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { ensureUserProfile } from "@/lib/auth/super-admin";
import { hasPublicSupabaseEnv } from "@/lib/env.client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const next = sanitizeNextPath(requestUrl.searchParams.get("next"));
  const providerError = requestUrl.searchParams.get("error");

  if (providerError) {
    return redirectToLogin(requestUrl, next, "cancelled");
  }

  if (!hasPublicSupabaseEnv()) {
    return redirectToLogin(requestUrl, next, "supabase-env");
  }

  const supabase = await createSupabaseServerClient();
  const { error } =
    tokenHash && type
      ? await supabase.auth.verifyOtp({
          type,
          token_hash: tokenHash,
        })
      : code
        ? await supabase.auth.exchangeCodeForSession(code)
        : { error: new Error("Missing confirmation token.") };

  if (error) {
    return redirectToLogin(requestUrl, next, "callback");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await ensureUserProfile(user);
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}

function redirectToLogin(requestUrl: URL, next: string, error: string) {
  return NextResponse.redirect(
    new URL(`/login?next=${encodeURIComponent(next)}&error=${error}`, requestUrl.origin),
  );
}

function sanitizeNextPath(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }

  return next;
}
