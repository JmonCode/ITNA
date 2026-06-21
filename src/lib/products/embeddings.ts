import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { hasOpenAIEnv } from "@/lib/env.server";
import { createTextEmbedding } from "@/lib/openai/embeddings";
import { buildProductSearchText } from "@/lib/products/search-text";

export async function refreshProductSearchEmbedding(supabase: SupabaseClient, productId: string) {
  if (!hasOpenAIEnv()) {
    return;
  }

  const { data: product, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      short_description,
      description,
      problem_solved,
      target_users,
      main_features,
      is_ai_built,
      has_ai_feature,
      ai_tools_used,
      categories(name),
      product_tags(tags(name))
    `,
    )
    .eq("id", productId)
    .maybeSingle();

  if (error || !product) {
    throw error ?? new Error("제품을 찾지 못했습니다.");
  }

  const category = getJoinedObject(product.categories);
  const tags =
    product.product_tags
      ?.map((tagJoin: unknown) => {
        const tag = getJoinedObject((tagJoin as { tags?: unknown }).tags);
        return typeof tag?.name === "string" ? tag.name : null;
      })
      .filter((tag): tag is string => Boolean(tag)) ?? [];

  const searchText = buildProductSearchText({
    name: product.name,
    shortDescription: product.short_description,
    description: product.description,
    problemSolved: product.problem_solved,
    targetUsers: product.target_users,
    mainFeatures: product.main_features,
    categoryName: typeof category?.name === "string" ? category.name : null,
    tags,
    isAiBuilt: product.is_ai_built,
    hasAiFeature: product.has_ai_feature,
    aiToolsUsed: product.ai_tools_used,
  });
  const embedding = await createTextEmbedding(searchText);

  if (!embedding.length) {
    return;
  }

  const { error: updateError } = await supabase
    .from("products")
    .update({
      search_text: searchText,
      embedding_vector: `[${embedding.join(",")}]`,
    })
    .eq("id", productId);

  if (updateError) {
    throw updateError;
  }
}

function getJoinedObject(value: unknown) {
  if (Array.isArray(value)) {
    return value[0] as Record<string, unknown> | undefined;
  }

  return value as Record<string, unknown> | null | undefined;
}
