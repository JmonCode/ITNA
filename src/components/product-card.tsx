import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Eye, MessageCircle, ThumbsUp } from "lucide-react";

import type { ProductListItem } from "@/lib/products/catalog";

const fallbackProductImageSrc = "/images/product-fallback.png";

export function ProductCard({ product }: { product: ProductListItem }) {
  const imageSrc = product.imageUrl ?? fallbackProductImageSrc;
  const isFallbackImage = !product.imageUrl;
  const imageAlt = isFallbackImage
    ? `${product.name} 제품 기본 이미지`
    : `${product.name} 제품 이미지`;

  return (
    <Link
      className="group block h-full rounded-[var(--radius-md)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
      href={`/products/${product.id}`}
      aria-label={`${product.name} 상세 보기`}
    >
      <article className="operational-card flex h-full flex-col gap-4 p-3 transition-colors group-hover:border-primary">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-md)] bg-surface-soft">
          <Image
            className={isFallbackImage ? "object-contain p-3" : "object-cover"}
            src={imageSrc}
            alt={imageAlt}
            fill
            loading="lazy"
            sizes="(min-width: 1280px) 300px, (min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw"
            unoptimized
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4 px-1 pb-1">
          <div className="space-y-3">
            <span className="inline-flex w-fit rounded-[var(--radius-full)] border border-hairline px-3 py-1 text-caption">
              {product.category.name}
            </span>

            <div className="flex items-start justify-between gap-3">
              <h3 className="text-card-title text-clamp-2">{product.name}</h3>
              <span
                className="btn-icon h-11 w-11 shrink-0 transition-colors group-hover:bg-primary group-hover:text-on-primary"
                aria-hidden="true"
              >
                <ArrowUpRight size={20} strokeWidth={1.8} />
              </span>
            </div>

            <p className="text-body-sm text-clamp-2">{product.shortDescription}</p>
          </div>

          <div className="mt-auto grid grid-cols-3 gap-2 border-t border-hairline-soft pt-3 text-caption">
            <Metric icon={<ThumbsUp size={12} strokeWidth={1.8} />} label="추천" value={product.recommendationCount} />
            <Metric icon={<MessageCircle size={12} strokeWidth={1.8} />} label="댓글" value={product.commentCount} />
            <Metric icon={<Eye size={12} strokeWidth={1.8} />} label="조회" value={product.viewCount} />
          </div>
        </div>
      </article>
    </Link>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap">
      <span aria-hidden="true">{icon}</span>
      <span>
        {label} {value.toLocaleString("ko-KR")}
      </span>
    </span>
  );
}
