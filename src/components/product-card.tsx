"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Eye, MessageCircle, ThumbsUp } from "lucide-react";

type ProductCardItem = {
  id: string;
  name: string;
  shortDescription: string;
  recommendationCount: number;
  commentCount: number;
  viewCount: number;
  imageUrl?: string | null;
  category: {
    name: string;
  };
  tags: string[];
};

const accentColors = [
  "bg-block-lime",
  "bg-block-lilac",
  "bg-block-coral",
  "bg-block-mint",
  "bg-block-cream",
  "bg-block-pink",
];

function getAccentColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return accentColors[Math.abs(hash) % accentColors.length];
}

export function ProductCard({
  product,
  rank,
  shouldLogSearchClick = false,
}: {
  product: ProductCardItem;
  rank?: number;
  shouldLogSearchClick?: boolean;
}) {
  const accent = getAccentColor(product.id);

  function logSearchClick() {
    if (!shouldLogSearchClick || !rank) {
      return;
    }

    const body = JSON.stringify({
      productId: product.id,
      rankPosition: rank,
    });

    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/search/click", blob);
      return;
    }

    void fetch("/api/search/click", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
      keepalive: true,
    });
  }

  return (
    <Link
      className="group block rounded-[var(--radius-md)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
      href={`/products/${product.id}`}
      aria-label={`${product.name} 상세 보기`}
      onClick={logSearchClick}
    >
      <article className="product-card grid grid-cols-[84px_1fr] gap-3 p-3 sm:grid-cols-[112px_1fr_auto] sm:items-center sm:gap-4 sm:p-4">
        <div className={`relative row-span-2 aspect-square overflow-hidden rounded-[var(--radius-sm)] sm:row-span-1 sm:aspect-[4/3] ${accent}`}>
          {product.imageUrl ? (
            <Image
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              src={product.imageUrl}
              alt={`${product.name} 제품 이미지`}
              fill
              loading="lazy"
              sizes="112px"
              unoptimized
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-headline">
              {product.name.slice(0, 1)}
            </span>
          )}
        </div>

        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-[var(--radius-sm)] bg-surface-soft px-2 py-1 text-caption">
              {product.category.name}
            </span>
            {product.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-caption opacity-50">
                #{tag}
              </span>
            ))}
          </div>
          <h3 className="text-card-title text-clamp-2">{product.name}</h3>
          <p className="text-body-sm text-clamp-2 opacity-70">
            {product.shortDescription}
          </p>
        </div>

        <div className="col-start-2 flex items-center justify-between gap-4 sm:col-start-auto sm:flex-col sm:items-end">
          <div className="flex items-center gap-3 text-caption opacity-50 sm:flex-col sm:items-end sm:gap-2">
            <Metric icon={<ThumbsUp size={11} strokeWidth={2} />} value={product.recommendationCount} />
            <Metric icon={<MessageCircle size={11} strokeWidth={2} />} value={product.commentCount} />
            <Metric icon={<Eye size={11} strokeWidth={2} />} value={product.viewCount} />
          </div>
          <span className="btn-icon h-9 w-9" aria-hidden="true">
            <ArrowUpRight size={16} strokeWidth={1.8} />
          </span>
        </div>
      </article>
    </Link>
  );
}

function Metric({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: number;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <span aria-hidden="true">{icon}</span>
      <span>{value.toLocaleString("ko-KR")}</span>
    </span>
  );
}
