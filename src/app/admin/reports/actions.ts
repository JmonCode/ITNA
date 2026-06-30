"use server";

import { revalidatePath } from "next/cache";

import { assertSuperAdmin } from "@/lib/auth/super-admin";
import { recountProductEngagement } from "@/lib/products/engagement";
import { isUuid } from "@/lib/search/normalize-query";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ReportTarget = {
  id: string;
  targetType: "product" | "comment" | "user";
  targetId: string;
};

export async function resolveReportAction(formData: FormData) {
  const reportId = getRequiredReportId(formData);
  await assertSuperAdmin();
  await updateReportStatus(reportId, "resolved");
}

export async function rejectReportAction(formData: FormData) {
  const reportId = getRequiredReportId(formData);
  await assertSuperAdmin();
  await updateReportStatus(reportId, "rejected");
}

export async function hideReportedTargetAction(formData: FormData) {
  const reportId = getRequiredReportId(formData);
  await assertSuperAdmin();

  const supabase = await createSupabaseServerClient();
  const report = await getReportTarget(supabase, reportId);

  if (report.targetType === "product") {
    const { error } = await supabase
      .from("products")
      .update({ status: "hidden" })
      .eq("id", report.targetId);

    if (error) {
      throw new Error(error.message);
    }

    await updateReportStatus(report.id, "resolved");
    revalidatePath(`/products/${report.targetId}`);
    revalidatePath("/products");
    revalidatePath("/admin/products");
    return;
  }

  if (report.targetType === "comment") {
    const { data: comment, error: readError } = await supabase
      .from("comments")
      .select("id,product_id")
      .eq("id", report.targetId)
      .maybeSingle();

    if (readError) {
      throw new Error(readError.message);
    }

    const { error } = await supabase
      .from("comments")
      .update({ status: "hidden" })
      .eq("id", report.targetId);

    if (error) {
      throw new Error(error.message);
    }

    const productId = comment?.product_id;
    if (productId) {
      await recountProductEngagement(productId);
      revalidatePath(`/products/${productId}`);
    }

    await updateReportStatus(report.id, "resolved");
    revalidatePath("/products");
    return;
  }

  throw new Error("사용자 신고는 숨김 처리 대상이 아닙니다.");
}

async function updateReportStatus(reportId: string, status: "resolved" | "rejected") {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("reports").update({ status }).eq("id", reportId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/reports");
}

async function getReportTarget(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  reportId: string,
): Promise<ReportTarget> {
  const { data, error } = await supabase
    .from("reports")
    .select("id,target_type,target_id")
    .eq("id", reportId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("신고를 찾을 수 없습니다.");
  }

  return {
    id: data.id,
    targetType: normalizeTargetType(data.target_type),
    targetId: data.target_id,
  };
}

function getRequiredReportId(formData: FormData) {
  const reportId = formData.get("reportId")?.toString();

  if (!reportId || !isUuid(reportId)) {
    throw new Error("신고 ID가 올바르지 않습니다.");
  }

  return reportId;
}

function normalizeTargetType(value: string): ReportTarget["targetType"] {
  if (value === "comment" || value === "user") {
    return value;
  }

  return "product";
}
