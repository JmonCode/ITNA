import Link from "next/link";
import { ArrowUpRight, Check, EyeOff, X } from "lucide-react";

import {
  hideReportedTargetAction,
  rejectReportAction,
  resolveReportAction,
} from "@/app/admin/reports/actions";
import { MarqueeStrip } from "@/components/marquee-strip";
import { SiteHeader } from "@/components/site-header";
import {
  adminReportStatuses,
  getAdminReports,
  normalizeAdminReportStatus,
  type AdminReportItem,
  type AdminReportReason,
  type AdminReportStatus,
  type AdminReportTargetType,
} from "@/lib/admin/reports";
import { requireSuperAdmin } from "@/lib/auth/super-admin";

type AdminReportsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const statusLabels: Record<AdminReportStatus, string> = {
  pending: "검토 대기",
  resolved: "처리 완료",
  rejected: "기각됨",
};

const targetLabels: Record<AdminReportTargetType, string> = {
  product: "제품",
  comment: "댓글",
  user: "사용자",
};

const reasonLabels: Record<AdminReportReason, string> = {
  spam: "스팸",
  false_information: "잘못된 정보",
  inappropriate_image: "부적절한 이미지",
  abusive_comment: "공격적인 댓글",
  duplicate_product: "중복 제품",
  broken_link: "링크 문제",
  other: "기타",
};

export default async function AdminReportsPage({ searchParams }: AdminReportsPageProps) {
  const params = await searchParams;
  const status = normalizeAdminReportStatus(getSingleParam(params.status));
  await requireSuperAdmin(`/admin/reports?status=${status}`);

  const reports = await getAdminReports(status);

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />
      <MarqueeStrip />

      <section className="container-page space-y-7 py-8 md:py-12">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-eyebrow">Admin Reports</p>
            <h1 className="text-display-lg mt-1">신고 관리</h1>
          </div>
          <p className="max-w-xl text-body-sm opacity-70">
            접수된 신고를 검토하고 제품 또는 댓글을 숨김 처리합니다.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-hairline-soft pb-4">
          {adminReportStatuses.map((option) => (
            <Link
              key={option}
              className={status === option ? "category-chip-selected" : "category-chip"}
              href={`/admin/reports?status=${option}`}
            >
              {statusLabels[option]}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-headline">
            {statusLabels[status]}
            <span className="ml-2 text-body-sm font-normal opacity-50">
              {reports.length}개
            </span>
          </h2>
          <div className="flex flex-wrap gap-2">
            <Link className="btn-secondary border border-hairline" href="/admin/products">
              승인 관리
            </Link>
            <Link className="btn-secondary border border-hairline" href="/admin/search-alerts/export">
              알림 CSV
            </Link>
          </div>
        </div>

        {reports.length ? (
          <div className="space-y-3">
            {reports.map((report) => (
              <AdminReportRow key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <div className="color-block bg-block-cream">
            <p className="text-headline">현재 {statusLabels[status]} 신고가 없습니다.</p>
          </div>
        )}
      </section>
    </main>
  );
}

function AdminReportRow({ report }: { report: AdminReportItem }) {
  const canHideTarget =
    report.status === "pending" &&
    (report.targetType === "product" || report.targetType === "comment") &&
    report.targetStatus !== "hidden" &&
    report.targetStatus !== "deleted";

  return (
    <article className="operational-card grid gap-4 p-4 lg:grid-cols-[1fr_280px]">
      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={report.status} />
          <span className="rounded-[var(--radius-sm)] bg-surface-soft px-2 py-1 text-caption">
            {targetLabels[report.targetType]}
          </span>
          <span className="rounded-[var(--radius-sm)] bg-block-lilac px-2 py-1 text-caption">
            {reasonLabels[report.reason]}
          </span>
          <span className="text-caption opacity-50">
            {formatDate(report.createdAt)}
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="text-card-title">{report.targetTitle}</h3>
          {report.targetSubtitle ? (
            <p className="text-body-sm opacity-70">{report.targetSubtitle}</p>
          ) : null}
          {report.description ? (
            <p className="text-body-sm text-clamp-2">{report.description}</p>
          ) : (
            <p className="text-body-sm opacity-50">상세 설명 없음</p>
          )}
        </div>

        <dl className="grid gap-2 text-body-sm md:grid-cols-3">
          <Info label="신고자" value={report.reporterNickname ?? "미입력"} />
          <Info label="이메일" value={report.reporterEmail ?? "미입력"} />
          <Info label="대상 상태" value={report.targetStatus ?? "확인 불가"} />
        </dl>
      </div>

      <div className="flex flex-col justify-between gap-3">
        <div className="flex flex-wrap gap-2 lg:justify-end">
          {report.targetHref ? (
            <Link
              className="btn-icon"
              href={report.targetHref}
              target="_blank"
              rel="noreferrer"
              aria-label="신고 대상 열기"
            >
              <ArrowUpRight size={18} strokeWidth={1.8} />
            </Link>
          ) : null}

          {canHideTarget ? (
            <form action={hideReportedTargetAction}>
              <input type="hidden" name="reportId" value={report.id} />
              <button className="btn-primary min-h-10 px-4 py-2 text-body-sm" type="submit">
                <EyeOff size={16} strokeWidth={1.8} />
                숨김 처리
              </button>
            </form>
          ) : null}
        </div>

        {report.status === "pending" ? (
          <div className="grid gap-2">
            <form action={resolveReportAction}>
              <input type="hidden" name="reportId" value={report.id} />
              <button className="btn-secondary min-h-10 w-full border border-hairline px-4 py-2 text-body-sm" type="submit">
                <Check size={16} strokeWidth={1.8} />
                처리 완료
              </button>
            </form>
            <form action={rejectReportAction}>
              <input type="hidden" name="reportId" value={report.id} />
              <button className="btn-secondary min-h-10 w-full border border-hairline px-4 py-2 text-body-sm" type="submit">
                <X size={16} strokeWidth={1.8} />
                기각
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: AdminReportStatus }) {
  const className =
    status === "resolved"
      ? "bg-block-mint"
      : status === "rejected"
        ? "bg-block-pink"
        : "bg-block-lilac";

  return (
    <span className={`rounded-[var(--radius-sm)] px-2 py-1 text-caption ${className}`}>
      {statusLabels[status]}
    </span>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-caption opacity-50">{label}</dt>
      <dd className="mt-1 min-w-0 break-words">{value}</dd>
    </div>
  );
}

function formatDate(value: string) {
  if (!value) {
    return "날짜 없음";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function getSingleParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value?.trim() || undefined;
}
