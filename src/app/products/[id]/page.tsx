import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, MessageCircle, ThumbsUp } from "lucide-react";

import { MarqueeStrip } from "@/components/marquee-strip";
import { SiteHeader } from "@/components/site-header";
import { getProductById } from "@/lib/products/catalog";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getProductById(decodeURIComponent(id));

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />
      <MarqueeStrip />

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

          <div className="color-block bg-block-cream">
            <p className="text-headline">
              상세 설명, 스크린샷, 댓글, 신고, 외부 링크 클릭 로그는 다음 구현 단계에서 이 페이지에
              연결됩니다.
            </p>
          </div>
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
            <button className="btn-primary w-full" type="button">
              웹사이트 방문
              <ArrowUpRight size={20} strokeWidth={1.8} />
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}
