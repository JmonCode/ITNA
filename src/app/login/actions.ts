"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { hasPublicSupabaseEnv } from "@/lib/env.client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type OAuthProvider = "google" | "kakao";

export async function signInWithEmail(formData: FormData) {
  if (!hasPublicSupabaseEnv()) {
    redirect("/login?error=supabase-env");
  }

  const email = formData.get("email")?.toString().trim().toLowerCase();
  const next = sanitizeNextPath(formData.get("next")?.toString());

  if (!email) {
    redirect(`/login?next=${encodeURIComponent(next)}&error=email-required`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: await buildAuthCallbackUrl(next),
    },
  });

  if (error) {
    redirect(`/login?next=${encodeURIComponent(next)}&error=signin-failed`);
  }

  redirect(`/login?next=${encodeURIComponent(next)}&sent=1`);
}

export async function signInWithOAuth(formData: FormData) {
  if (!hasPublicSupabaseEnv()) {
    redirect("/login?error=supabase-env");
  }

  const provider = formData.get("provider")?.toString();
  const next = sanitizeNextPath(formData.get("next")?.toString());

  if (!isOAuthProvider(provider)) {
    redirect(`/login?next=${encodeURIComponent(next)}&error=provider`);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: await buildAuthCallbackUrl(next),
    },
  });

  if (error || !data.url) {
    redirect(`/login?next=${encodeURIComponent(next)}&error=signin-failed`);
  }

  redirect(data.url);
}

function isOAuthProvider(provider: string | undefined): provider is OAuthProvider {
  return provider === "google" || provider === "kakao";
}

function sanitizeNextPath(next: string | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }

  return next;
}

async function buildAuthCallbackUrl(next: string) {
  const headerStore = await headers();
  const origin =
    headerStore.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}
