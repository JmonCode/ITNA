import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, ArrowUpRight, MessageCircle, ThumbsUp } from "lucide-react";

import {
  createCommentAction,
  reportProductAction,
  toggleRecommendationAction,
} from "@/app/products/[id]/actions";
import { MarqueeStrip } from "@/components/marquee-strip";
import { ProductOutboundLink } from "@/components/product-outbound-link";
import { ProductViewLogger } from "@/components/product-view-logger";
import { SiteHeader } from "@/components/site-header";
import { getProductCommunityState } from "@/lib/products/community";
import { getProductById } from "@/lib/products/catalog";
import { isUuid } from "@/lib/search/normalize-query";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductDetailPage({ params, searchParams }: ProductDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const product = await getProductById(decodeURIComponent(id));

  if (!product) {
    notFound();
  }

  const productUrl = product.websiteUrl ?? product.androidUrl ?? product.iosUrl;
  const community = await getProductCommunityState(product.id);
  const canUseCommunity = isUuid(product.id);
  const reported = getSingleParam(query.reported) === "1";
  const communityError = getSingleParam(query.communityError);

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />
      <MarqueeStrip />
      <ProductViewLogger productId={product.id} />

      <section className="container-page grid gap-8 py-10 md:grid-cols-[1fr_360px] md:py-16">
        <div className="space-y-8">
          <Link className="inline-flex items-center gap-2 text-body-sm" href="/products">
            <ArrowLeft size={18} strokeWidth={1.8} />
            제품 목록
          </Link>

          <div className="space-y-4">
            <p className="text-eyebrow">{product.category.name}</p>
            <h1 className="text-display-lg">{product.name}</h1>
            <p className="max-w-3xl text-subhead">{product.shortDescription}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span key={tag} className="rounded-[var(--radius-full)] bg-surface-soft px-4 py-2 text-body-sm">
                #{tag}
              </span>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <InfoTile label="유형" value={product.productType} />
            <InfoTile label="가격" value={product.pricingType} />
            <InfoTile label="상태" value={product.launchStatus} />
          </div>

          <div className="color-block bg-block-cream space-y-4">
            <p className="text-eyebrow">Why It Matters</p>
            <p className="text-headline">{product.shortDescription}</p>
          </div>

          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-eyebrow">Comments</p>
                <h2 className="text-headline mt-1">사용자 댓글</h2>
              </div>
              <span className="text-caption opacity-50">{community.comments.length}개</span>
            </div>

            {communityError ? (
              <div className="rounded-[var(--radius-md)] bg-block-pink px-4 py-3 text-body-sm">
                요청을 처리하지 못했습니다. 로그인 상태와 입력값을 확인해주세요.
              </div>
            ) : null}

            {canUseCommunity ? (
              <form action={createCommentAction} className="operational-card space-y-3 p-4">
                <input type="hidden" name="productId" value={product.id} />
                <label className="block space-y-2">
                  <span className="text-caption">Comment</span>
                  <textarea
                    className="text-input min-h-28 w-full"
                    name="content"
                    minLength={2}
                    maxLength={1000}
                    placeholder="이 제품을 써본 느낌이나 기대되는 점을 남겨주세요."
                    required
                  />
                </label>
                <button className="btn-primary" type="submit">
                  <MessageCircle size={18} strokeWidth={1.8} />
                  댓글 등록
                </button>
              </form>
            ) : null}

            <div className="space-y-3">
              {community.comments.length ? (
                community.comments.map((comment) => (
                  <article key={comment.id} className="operational-card p-4">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <strong className="text-body-sm">{comment.authorName}</strong>
                      <span className="text-caption opacity-50">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-body-sm">{comment.content}</p>
                  </article>
                ))
              ) : (
                <div className="operational-card p-4 text-body-sm opacity-70">
                  아직 댓글이 없습니다.
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="operational-card space-y-5 p-5">
            <p className="text-caption">Product Metrics</p>
            <div className="grid grid-cols-2 gap-3 text-body-sm">
              <div className="template-card">
                <ThumbsUp className="mb-5" size={22} strokeWidth={1.8} />
                추천 {product.recommendationCount}
              </div>
              <div className="template-card">
                <MessageCircle className="mb-5" size={22} strokeWidth={1.8} />
                댓글 {product.commentCount}
              </div>
            </div>
            {productUrl ? (
              <ProductOutboundLink className="btn-primary w-full" productId={product.id} href={productUrl}>
                웹사이트 방문
                <ArrowUpRight size={20} strokeWidth={1.8} />
              </ProductOutboundLink>
            ) : (
              <button className="btn-secondary w-full border border-hairline" type="button" disabled>
                외부 링크 없음
              </button>
            )}
          </div>

          {canUseCommunity ? (
            <div className="operational-card space-y-4 p-5">
              <form action={toggleRecommendationAction}>
                <input type="hidden" name="productId" value={product.id} />
                <button className="btn-primary w-full" type="submit">
                  <ThumbsUp size={18} strokeWidth={1.8} />
                  {community.hasRecommended ? "추천 취소" : "추천하기"}
                </button>
              </form>

              {reported ? (
                <div className="rounded-[var(--radius-md)] bg-block-mint px-3 py-2 text-body-sm">
                  신고를 접수했습니다.
                </div>
              ) : null}

              <form action={reportProductAction} className="space-y-3">
                <input type="hidden" name="productId" value={product.id} />
                <label className="block space-y-2">
                  <span className="text-caption">Report Reason</span>
                  <select className="text-input w-full" name="reason" defaultValue="broken_link">
                    <option value="broken_link">링크 문제</option>
                    <option value="false_information">잘못된 정보</option>
                    <option value="duplicate_product">중복 제품</option>
                    <option value="spam">스팸</option>
                    <option value="other">기타</option>
                  </select>
                </label>
                <label className="block space-y-2">
                  <span className="text-caption">Details</span>
                  <textarea className="text-input min-h-24 w-full" name="description" maxLength={1000} />
                </label>
                <button className="btn-secondary w-full border border-hairline" type="submit">
                  <AlertTriangle size={18} strokeWidth={1.8} />
                  신고하기
                </button>
              </form>
            </div>
          ) : null}
        </aside>
      </section>
    </main>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="operational-card p-4">
      <p className="text-caption opacity-50">{label}</p>
      <p className="mt-3 text-body-sm">{value}</p>
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
