import "server-only";

import { hasPublicSupabaseEnv } from "@/lib/env.client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const adminProductStatuses = ["pending", "approved", "rejected", "hidden"] as const;

export type AdminProductStatus = (typeof adminProductStatuses)[number];

export type AdminProductItem = {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  status: AdminProductStatus;
  productType: string;
  pricingType: string;
  launchStatus: string;
  websiteUrl: string | null;
  androidUrl: string | null;
  iosUrl: string | null;
  makerName: string | null;
  contactEmail: string | null;
  categoryName: string;
  submitterEmail: string | null;
  submitterNickname: string | null;
  rejectionReason: string | null;
  createdAt: string;
  approvedAt: string | null;
  rejectedAt: string | null;
};

export function normalizeAdminProductStatus(status?: string | null): AdminProductStatus {
  return adminProductStatuses.includes(status as AdminProductStatus)
    ? (status as AdminProductStatus)
    : "pending";
}

export async function getAdminProducts(status: AdminProductStatus): Promise<AdminProductItem[]> {
  if (!hasPublicSupabaseEnv()) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      short_description,
      description,
      status,
      product_type,
      pricing_type,
      launch_status,
      website_url,
      android_url,
      ios_url,
      maker_name,
      contact_email,
      rejection_reason,
      created_at,
      approved_at,
      rejected_at,
      categories(name),
      profiles!products_maker_id_fkey(email,nickname)
    `,
    )
    .eq("status", status)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapAdminProductRow);
}

function mapAdminProductRow(row: unknown): AdminProductItem {
  const product = row as Record<string, unknown>;
  const category = getJoinedObject(product.categories);
  const profile = getJoinedObject(product.profiles);

  return {
    id: String(product.id),
    name: String(product.name ?? ""),
    shortDescription: String(product.short_description ?? ""),
    description: String(product.description ?? ""),
    status: normalizeAdminProductStatus(String(product.status ?? "pending")),
    productType: String(product.product_type ?? ""),
    pricingType: String(product.pricing_type ?? ""),
    launchStatus: String(product.launch_status ?? ""),
    websiteUrl: toNullableString(product.website_url),
    androidUrl: toNullableString(product.android_url),
    iosUrl: toNullableString(product.ios_url),
    makerName: toNullableString(product.maker_name),
    contactEmail: toNullableString(product.contact_email),
    categoryName: toNullableString(category?.name) ?? "미분류",
    submitterEmail: toNullableString(profile?.email),
    submitterNickname: toNullableString(profile?.nickname),
    rejectionReason: toNullableString(product.rejection_reason),
    createdAt: String(product.created_at ?? ""),
    approvedAt: toNullableString(product.approved_at),
    rejectedAt: toNullableString(product.rejected_at),
  };
}

function getJoinedObject(value: unknown) {
  if (Array.isArray(value)) {
    return value[0] as Record<string, unknown> | undefined;
  }

  return value as Record<string, unknown> | null | undefined;
}

function toNullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}
