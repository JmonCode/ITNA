import "server-only";

import type { User } from "@supabase/supabase-js";
import { notFound, redirect } from "next/navigation";

import { hasPublicSupabaseEnv } from "@/lib/env.client";
import { hasSupabaseAdminEnv } from "@/lib/env.server";
import { getConfiguredAdminEmails, isConfiguredAdminEmail } from "@/lib/auth/admin-emails";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProfileRole = "user" | "maker" | "admin";

export type SuperAdminState = {
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  user: User | null;
  profile:
    | {
        id: string;
        email: string;
        nickname: string | null;
        role: ProfileRole;
      }
    | null;
};

export async function getCurrentSuperAdminState(): Promise<SuperAdminState> {
  if (!hasPublicSupabaseEnv()) {
    return emptySuperAdminState();
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return emptySuperAdminState();
  }

  if (isConfiguredAdminEmail(user.email)) {
    await ensureUserProfile(user);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,email,nickname,role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role as ProfileRole | undefined;
  const isSuperAdmin = isConfiguredAdminEmail(user.email) && role === "admin";

  return {
    isAuthenticated: true,
    isSuperAdmin,
    user,
    profile: profile
      ? {
          id: profile.id,
          email: profile.email,
          nickname: profile.nickname,
          role: role ?? "user",
        }
      : null,
  };
}

export async function requireSuperAdmin(nextPath = "/admin/products") {
  const state = await getCurrentSuperAdminState();

  if (!state.isAuthenticated) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  if (!state.isSuperAdmin) {
    notFound();
  }

  return state;
}

export async function assertSuperAdmin() {
  const state = await getCurrentSuperAdminState();

  if (!state.isSuperAdmin) {
    throw new Error("승인 권한이 없습니다.");
  }

  return state;
}

export async function ensureUserProfile(user: User) {
  if (!user.email || !hasSupabaseAdminEnv()) {
    return;
  }

  const admin = createSupabaseAdminClient();
  const isAdminEmail = isConfiguredAdminEmail(user.email);
  const profile: {
    id: string;
    email: string;
    nickname: string;
    role?: "admin";
  } = {
    id: user.id,
    email: user.email,
    nickname:
      getUserMetadataName(user) ??
      user.email.split("@")[0] ??
      "사용자",
  };

  if (isAdminEmail) {
    profile.role = "admin";
  }

  await admin.from("profiles").upsert(profile, { onConflict: "id" });
}

export { getConfiguredAdminEmails };

function emptySuperAdminState(): SuperAdminState {
  return {
    isAuthenticated: false,
    isSuperAdmin: false,
    user: null,
    profile: null,
  };
}

function getUserMetadataName(user: User) {
  const metadata = user.user_metadata;
  const name = metadata?.name ?? metadata?.full_name ?? metadata?.preferred_username;

  return typeof name === "string" && name.trim() ? name.trim() : null;
}
