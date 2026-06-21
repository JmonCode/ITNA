"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { hasPublicSupabaseEnv } from "@/lib/env.client";
import { recountProductEngagement } from "@/lib/products/engagement";
import { isUuid } from "@/lib/search/normalize-query";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const commentSchema = z.object({
  productId: z.string().uuid(),
  content: z.string().trim().min(2).max(1000),
});

const reportSchema = z.object({
  productId: z.string().uuid(),
  reason: z.enum([
    "spam",
    "false_information",
    "inappropriate_image",
    "abusive_comment",
    "duplicate_product",
    "broken_link",
    "other",
  ]),
  description: z.string().trim().max(1000).optional(),
});

export async function toggleRecommendationAction(formData: FormData) {
  const productId = getProductId(formData);
  const next = `/products/${productId}`;
  const userId = await requireUserId(next);

  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase
    .from("recommendations")
    .select("id")
    .eq("product_id", productId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .maybeSingle();

  const { error } = existing
    ? await supabase.from("recommendations").delete().eq("id", existing.id)
    : await supabase.from("recommendations").insert({
        product_id: productId,
        user_id: userId,
      });

  if (error) {
    redirect(`${next}?communityError=recommendation`);
  }

  await recountProductEngagement(productId);
  revalidatePath(next);
  revalidatePath("/products");
}

export async function createCommentAction(formData: FormData) {
  const parsed = commentSchema.safeParse({
    productId: formData.get("productId")?.toString(),
    content: formData.get("content")?.toString(),
  });

  if (!parsed.success) {
    redirect(`/products/${getProductId(formData)}?communityError=comment-validation`);
  }

  const next = `/products/${parsed.data.productId}`;
  const userId = await requireUserId(next);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("comments").insert({
    product_id: parsed.data.productId,
    user_id: userId,
    content: parsed.data.content,
    status: "visible",
  });

  if (error) {
    redirect(`${next}?communityError=comment`);
  }

  await recountProductEngagement(parsed.data.productId);
  revalidatePath(next);
  revalidatePath("/products");
}

export async function reportProductAction(formData: FormData) {
  const parsed = reportSchema.safeParse({
    productId: formData.get("productId")?.toString(),
    reason: formData.get("reason")?.toString(),
    description: formData.get("description")?.toString(),
  });

  if (!parsed.success) {
    redirect(`/products/${getProductId(formData)}?communityError=report-validation`);
  }

  const next = `/products/${parsed.data.productId}`;
  const userId = await requireUserId(next);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("reports").insert({
    target_type: "product",
    target_id: parsed.data.productId,
    reporter_id: userId,
    reason: parsed.data.reason,
    description: parsed.data.description,
  });

  if (error) {
    redirect(`${next}?communityError=report`);
  }

  revalidatePath(next);
  redirect(`${next}?reported=1`);
}

async function requireUserId(next: string) {
  if (!hasPublicSupabaseEnv()) {
    redirect(`${next}?communityError=supabase-env`);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  return user.id;
}

function getProductId(formData: FormData) {
  const productId = formData.get("productId")?.toString() ?? "";

  if (!isUuid(productId)) {
    redirect("/products");
  }

  return productId;
}
