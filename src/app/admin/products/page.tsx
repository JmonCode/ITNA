import Link from "next/link";
import { ArrowUpRight, Check, EyeOff, X } from "lucide-react";

import {
  approveProductAction,
  hideProductAction,
  rejectProductAction,
} from "@/app/admin/products/actions";
import { MarqueeStrip } from "@/components/marquee-strip";
import { SiteHeader } from "@/components/site-header";
import {
  adminProductStatuses,
  getAdminProducts,
  normalizeAdminProductStatus,
  type AdminProductItem,
  type AdminProductStatus,
} from "@/lib/admin/products";
import { requireSuperAdmin } from "@/lib/auth/super-admin";

type AdminProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const statusLabels: Record<AdminProductStatus, string> = {
  pending: "승인 대기",
  approved: "승인됨",
  rejected: "반려됨",
  hidden: "숨김",
};

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const params = await searchParams;
  const status = normalizeAdminProductStatus(getSingleParam(params.status));
  await requireSuperAdmin(`/admin/products?status=${status}`);

  const products = await getAdminProducts(status);

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />
      <MarqueeStrip />

      <section className="container-page space-y-7 py-8 md:py-12">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-eyebrow">Admin Approval</p>
            <h1 className="text-display-lg mt-1">제품 승인 관리</h1>
          </div>
          <p className="max-w-xl text-body-sm opacity-70">
            `smily094@gmail.com` 슈퍼어드민만 접근할 수 있는 운영 화면입니다.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-hairline-soft pb-4">
          {adminProductStatuses.map((option) => (
            <Link
              key={option}
              className={status === option ? "category-chip-selected" : "category-chip"}
              href={`/admin/products?status=${option}`}
            >
              {statusLabels[option]}
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4">
          <h2 className="text-headline">
            {statusLabels[status]}
            <span className="ml-2 text-body-sm font-normal opacity-50">
              {products.length}개
            </span>
          </h2>
          <Link className="btn-secondary border border-hairline" href="/submit">
            등록 화면
          </Link>
          <Link className="btn-secondary border border-hairline" href="/admin/search-alerts/export">
            알림 CSV
          </Link>
        </div>

        {products.length ? (
          <div className="space-y-3">
            {products.map((product) => (
              <AdminProductRow key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="color-block bg-block-cream">
            <p className="text-headline">현재 {statusLabels[status]} 제품이 없습니다.</p>
          </div>
        )}
      </section>
    </main>
  );
}

function AdminProductRow({ product }: { product: AdminProductItem }) {
  const productUrl = product.websiteUrl ?? product.androidUrl ?? product.iosUrl;

  return (
    <article className="operational-card grid gap-4 p-4 lg:grid-cols-[1fr_280px]">
      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={product.status} />
          <span className="rounded-[var(--radius-sm)] bg-surface-soft px-2 py-1 text-caption">
            {product.categoryName}
          </span>
          <span className="text-caption opacity-50">
            {formatDate(product.createdAt)}
          </span>
        </div>
        <div className="space-y-2">
          <h3 className="text-card-title">{product.name}</h3>
          <p className="text-body-sm opacity-70">{product.shortDescription}</p>
          <p className="text-body-sm text-clamp-2">{product.description}</p>
        </div>
        <dl className="grid gap-2 text-body-sm md:grid-cols-3">
          <Info label="등록자" value={product.makerName ?? product.submitterNickname ?? "미입력"} />
          <Info label="이메일" value={product.contactEmail ?? product.submitterEmail ?? "미입력"} />
          <Info label="유형" value={`${product.productType} / ${product.pricingType} / ${product.launchStatus}`} />
        </dl>
        {product.rejectionReason ? (
          <p className="rounded-[var(--radius-md)] bg-block-pink px-3 py-2 text-body-sm">
            반려 사유: {product.rejectionReason}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col justify-between gap-3">
        <div className="flex flex-wrap gap-2 lg:justify-end">
          {productUrl ? (
            <Link className="btn-icon" href={productUrl} target="_blank" rel="noreferrer" aria-label="제품 URL 열기">
              <ArrowUpRight size={18} strokeWidth={1.8} />
            </Link>
          ) : null}
          {product.status !== "approved" ? (
            <form action={approveProductAction}>
              <input type="hidden" name="productId" value={product.id} />
              <button className="btn-primary min-h-10 px-4 py-2 text-body-sm" type="submit">
                <Check size={16} strokeWidth={1.8} />
                승인
              </button>
            </form>
          ) : null}
          {product.status !== "hidden" ? (
            <form action={hideProductAction}>
              <input type="hidden" name="productId" value={product.id} />
              <button className="btn-secondary min-h-10 border border-hairline px-4 py-2 text-body-sm" type="submit">
                <EyeOff size={16} strokeWidth={1.8} />
                숨김
              </button>
            </form>
          ) : null}
        </div>

        {product.status !== "rejected" ? (
          <form action={rejectProductAction} className="flex flex-col gap-2">
            <input type="hidden" name="productId" value={product.id} />
            <input
              className="text-input min-h-10 w-full text-body-sm"
              name="rejectionReason"
              placeholder="반려 사유"
            />
            <button className="btn-secondary min-h-10 border border-hairline px-4 py-2 text-body-sm" type="submit">
              <X size={16} strokeWidth={1.8} />
              반려
            </button>
          </form>
        ) : null}
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: AdminProductStatus }) {
  const className =
    status === "approved"
      ? "bg-block-mint"
      : status === "rejected"
        ? "bg-block-pink"
        : status === "hidden"
          ? "bg-surface-soft"
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
