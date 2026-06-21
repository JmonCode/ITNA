import "server-only";

import { hasSupabaseAdminEnv } from "@/lib/env.server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function recountProductEngagement(productId: string) {
  if (!hasSupabaseAdminEnv()) {
    return;
  }

  const admin = createSupabaseAdminClient();
  const [{ count: recommendationCount }, { count: commentCount }] = await Promise.all([
    admin
      .from("recommendations")
      .select("id", { count: "exact", head: true })
      .eq("product_id", productId)
      .is("deleted_at", null),
    admin
      .from("comments")
      .select("id", { count: "exact", head: true })
      .eq("product_id", productId)
      .eq("status", "visible")
      .is("deleted_at", null),
  ]);

  await admin
    .from("products")
    .update({
      recommendation_count: recommendationCount ?? 0,
      comment_count: commentCount ?? 0,
    })
    .eq("id", productId);
}
