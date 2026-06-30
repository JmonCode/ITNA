import "server-only";

import { hasPublicSupabaseEnv } from "@/lib/env.client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const adminReportStatuses = ["pending", "resolved", "rejected"] as const;

export type AdminReportStatus = (typeof adminReportStatuses)[number];
export type AdminReportTargetType = "product" | "comment" | "user";
export type AdminReportReason =
  | "spam"
  | "false_information"
  | "inappropriate_image"
  | "abusive_comment"
  | "duplicate_product"
  | "broken_link"
  | "other";

export type AdminReportItem = {
  id: string;
  targetType: AdminReportTargetType;
  targetId: string;
  reason: AdminReportReason;
  description: string | null;
  status: AdminReportStatus;
  createdAt: string;
  updatedAt: string;
  reporterEmail: string | null;
  reporterNickname: string | null;
  targetTitle: string;
  targetSubtitle: string | null;
  targetStatus: string | null;
  targetHref: string | null;
  relatedProductId: string | null;
};

type BaseReport = {
  id: string;
  targetType: AdminReportTargetType;
  targetId: string;
  reason: AdminReportReason;
  description: string | null;
  status: AdminReportStatus;
  createdAt: string;
  updatedAt: string;
  reporterEmail: string | null;
  reporterNickname: string | null;
};

type ProductTarget = {
  id: string;
  name: string;
  shortDescription: string | null;
  status: string | null;
};

type CommentTarget = {
  id: string;
  content: string;
  status: string | null;
  productId: string | null;
  productName: string | null;
};

type UserTarget = {
  id: string;
  email: string | null;
  nickname: string | null;
  role: string | null;
};

export function normalizeAdminReportStatus(status?: string | null): AdminReportStatus {
  return adminReportStatuses.includes(status as AdminReportStatus)
    ? (status as AdminReportStatus)
    : "pending";
}

export async function getAdminReports(status: AdminReportStatus): Promise<AdminReportItem[]> {
  if (!hasPublicSupabaseEnv()) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reports")
    .select(
      `
      id,
      target_type,
      target_id,
      reason,
      description,
      status,
      created_at,
      updated_at,
      profiles!reports_reporter_id_fkey(email,nickname)
    `,
    )
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  const reports = (data ?? []).map(mapBaseReportRow);
  const targets = await getReportTargets(reports);

  return reports.map((report) => mapAdminReportItem(report, targets));
}

async function getReportTargets(reports: BaseReport[]) {
  const supabase = await createSupabaseServerClient();
  const productIds = reports
    .filter((report) => report.targetType === "product")
    .map((report) => report.targetId);
  const commentIds = reports
    .filter((report) => report.targetType === "comment")
    .map((report) => report.targetId);
  const userIds = reports
    .filter((report) => report.targetType === "user")
    .map((report) => report.targetId);

  const [products, comments, users] = await Promise.all([
    productIds.length
      ? supabase
          .from("products")
          .select("id,name,short_description,status")
          .in("id", productIds)
      : Promise.resolve({ data: [] }),
    commentIds.length
      ? supabase
          .from("comments")
          .select("id,content,status,product_id,products(name)")
          .in("id", commentIds)
      : Promise.resolve({ data: [] }),
    userIds.length
      ? supabase
          .from("profiles")
          .select("id,email,nickname,role")
          .in("id", userIds)
      : Promise.resolve({ data: [] }),
  ]);

  if ("error" in products && products.error) {
    throw new Error(products.error.message);
  }

  if ("error" in comments && comments.error) {
    throw new Error(comments.error.message);
  }

  if ("error" in users && users.error) {
    throw new Error(users.error.message);
  }

  return {
    products: new Map((products.data ?? []).map((row) => [row.id, mapProductTarget(row)])),
    comments: new Map((comments.data ?? []).map((row) => [row.id, mapCommentTarget(row)])),
    users: new Map((users.data ?? []).map((row) => [row.id, mapUserTarget(row)])),
  };
}

function mapAdminReportItem(
  report: BaseReport,
  targets: Awaited<ReturnType<typeof getReportTargets>>,
): AdminReportItem {
  if (report.targetType === "product") {
    const target = targets.products.get(report.targetId);

    return {
      ...report,
      targetTitle: target?.name ?? "삭제되었거나 접근할 수 없는 제품",
      targetSubtitle: target?.shortDescription ?? null,
      targetStatus: target?.status ?? null,
      targetHref: target?.status === "approved" ? `/products/${report.targetId}` : null,
      relatedProductId: target?.id ?? null,
    };
  }

  if (report.targetType === "comment") {
    const target = targets.comments.get(report.targetId);

    return {
      ...report,
      targetTitle: target?.content ?? "삭제되었거나 접근할 수 없는 댓글",
      targetSubtitle: target?.productName ? `제품: ${target.productName}` : null,
      targetStatus: target?.status ?? null,
      targetHref: target?.productId ? `/products/${target.productId}` : null,
      relatedProductId: target?.productId ?? null,
    };
  }

  const target = targets.users.get(report.targetId);

  return {
    ...report,
    targetTitle: target?.nickname ?? target?.email ?? "삭제되었거나 접근할 수 없는 사용자",
    targetSubtitle: target?.email ?? null,
    targetStatus: target?.role ?? null,
    targetHref: null,
    relatedProductId: null,
  };
}

function mapBaseReportRow(row: unknown): BaseReport {
  const report = row as Record<string, unknown>;
  const profile = getJoinedObject(report.profiles);

  return {
    id: String(report.id),
    targetType: normalizeTargetType(String(report.target_type ?? "product")),
    targetId: String(report.target_id),
    reason: normalizeReason(String(report.reason ?? "other")),
    description: toNullableString(report.description),
    status: normalizeAdminReportStatus(String(report.status ?? "pending")),
    createdAt: String(report.created_at ?? ""),
    updatedAt: String(report.updated_at ?? ""),
    reporterEmail: toNullableString(profile?.email),
    reporterNickname: toNullableString(profile?.nickname),
  };
}

function mapProductTarget(row: unknown): ProductTarget {
  const product = row as Record<string, unknown>;

  return {
    id: String(product.id),
    name: String(product.name ?? ""),
    shortDescription: toNullableString(product.short_description),
    status: toNullableString(product.status),
  };
}

function mapCommentTarget(row: unknown): CommentTarget {
  const comment = row as Record<string, unknown>;
  const product = getJoinedObject(comment.products);

  return {
    id: String(comment.id),
    content: String(comment.content ?? ""),
    status: toNullableString(comment.status),
    productId: toNullableString(comment.product_id),
    productName: toNullableString(product?.name),
  };
}

function mapUserTarget(row: unknown): UserTarget {
  const profile = row as Record<string, unknown>;

  return {
    id: String(profile.id),
    email: toNullableString(profile.email),
    nickname: toNullableString(profile.nickname),
    role: toNullableString(profile.role),
  };
}

function normalizeTargetType(value: string): AdminReportTargetType {
  if (value === "comment" || value === "user") {
    return value;
  }

  return "product";
}

function normalizeReason(value: string): AdminReportReason {
  const reasons: AdminReportReason[] = [
    "spam",
    "false_information",
    "inappropriate_image",
    "abusive_comment",
    "duplicate_product",
    "broken_link",
    "other",
  ];

  return reasons.includes(value as AdminReportReason) ? (value as AdminReportReason) : "other";
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
