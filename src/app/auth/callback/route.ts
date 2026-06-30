import { NextResponse } from "next/server";

import { ensureUserProfile } from "@/lib/auth/super-admin";
import { hasPublicSupabaseEnv } from "@/lib/env.client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = sanitizeNextPath(requestUrl.searchParams.get("next"));
  const providerError = requestUrl.searchParams.get("error");

  if (providerError) {
    return NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(next)}&error=cancelled`, requestUrl.origin),
    );
  }

  if (code) {
    if (!hasPublicSupabaseEnv()) {
      return NextResponse.redirect(
        new URL(`/login?next=${encodeURIComponent(next)}&error=supabase-env`, requestUrl.origin),
      );
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        new URL(`/login?next=${encodeURIComponent(next)}&error=callback`, requestUrl.origin),
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await ensureUserProfile(user);
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}

function sanitizeNextPath(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }

  return next;
}
