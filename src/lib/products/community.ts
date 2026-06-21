import "server-only";

import { hasPublicSupabaseEnv } from "@/lib/env.client";
import { isUuid } from "@/lib/search/normalize-query";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ProductCommentItem = {
  id: string;
  content: string;
  createdAt: string;
  authorName: string;
};

export type ProductCommunityState = {
  userId: string | null;
  hasRecommended: boolean;
  comments: ProductCommentItem[];
};

export async function getProductCommunityState(productId: string): Promise<ProductCommunityState> {
  if (!hasPublicSupabaseEnv() || !isUuid(productId)) {
    return {
      userId: null,
      hasRecommended: false,
      comments: [],
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: comments }, { data: recommendation }] = await Promise.all([
    supabase
      .from("comments")
      .select("id,content,created_at,profiles(nickname,email)")
      .eq("product_id", productId)
      .eq("status", "visible")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(30),
    user
      ? supabase
          .from("recommendations")
          .select("id")
          .eq("product_id", productId)
          .eq("user_id", user.id)
          .is("deleted_at", null)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    userId: user?.id ?? null,
    hasRecommended: Boolean(recommendation),
    comments: (comments ?? []).map(mapCommentRow),
  };
}

function mapCommentRow(row: unknown): ProductCommentItem {
  const comment = row as Record<string, unknown>;
  const profile = getJoinedObject(comment.profiles);
  const nickname = profile?.nickname;
  const email = profile?.email;

  return {
    id: String(comment.id),
    content: String(comment.content ?? ""),
    createdAt: String(comment.created_at ?? ""),
    authorName:
      (typeof nickname === "string" && nickname.trim()) ||
      (typeof email === "string" && email.split("@")[0]) ||
      "사용자",
  };
}

function getJoinedObject(value: unknown) {
  if (Array.isArray(value)) {
    return value[0] as Record<string, unknown> | undefined;
  }

  return value as Record<string, unknown> | null | undefined;
}
