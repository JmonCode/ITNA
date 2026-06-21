"use server";

import { revalidatePath } from "next/cache";

import { assertSuperAdmin } from "@/lib/auth/super-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function approveProductAction(formData: FormData) {
  const productId = getRequiredProductId(formData);
  await assertSuperAdmin();

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("products")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      rejected_at: null,
      rejection_reason: null,
    })
    .eq("id", productId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateProductPaths(productId);
}

export async function rejectProductAction(formData: FormData) {
  const productId = getRequiredProductId(formData);
  const rejectionReason =
    formData.get("rejectionReason")?.toString().trim() || "승인 기준에 맞지 않습니다.";

  await assertSuperAdmin();

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("products")
    .update({
      status: "rejected",
      rejected_at: new Date().toISOString(),
      rejection_reason: rejectionReason,
    })
    .eq("id", productId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateProductPaths(productId);
}

export async function hideProductAction(formData: FormData) {
  const productId = getRequiredProductId(formData);
  await assertSuperAdmin();

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("products")
    .update({
      status: "hidden",
    })
    .eq("id", productId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateProductPaths(productId);
}

function getRequiredProductId(formData: FormData) {
  const productId = formData.get("productId")?.toString();

  if (!productId) {
    throw new Error("제품 ID가 없습니다.");
  }

  return productId;
}

function revalidateProductPaths(productId: string) {
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
}
