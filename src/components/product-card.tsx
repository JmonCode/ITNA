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
  "bg-block-sky",
  "bg-block-yellow",
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
      className="group block rounded-[var(--radius-lg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
      href={`/products/${product.id}`}
      aria-label={`${product.name} 상세 보기`}
      onClick={logSearchClick}
    >
      <article className="product-card">
        <header className="product-card-chrome">
          <div className="flex min-w-0 items-center gap-3">
            <span className={`product-card-avatar ${accent}`} aria-hidden="true">
              {product.name.slice(0, 1)}
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-body-sm font-semibold">{product.name}</h3>
              <p className="mt-1 truncate text-caption opacity-50">
                {product.category.name}
              </p>
            </div>
          </div>
          <span className="product-card-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </header>

        <div className={`product-card-media ${accent}`}>
          {product.imageUrl ? (
            <Image
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              src={product.imageUrl}
              alt={`${product.name} 제품 이미지`}
              fill
              loading="lazy"
              sizes="(min-width: 1280px) 320px, (min-width: 640px) 50vw, 100vw"
              unoptimized
            />
          ) : (
            <ProductFallbackArt />
          )}
        </div>

        <div className="space-y-4 p-4">
          <p className="min-h-[46px] text-body-sm text-clamp-2">
            {product.shortDescription}
          </p>
          <div className="flex min-h-6 flex-wrap gap-2">
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-[var(--radius-full)] bg-surface-soft px-3 py-1 text-caption"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <footer className="flex items-center justify-between gap-4 border-t border-hairline-soft px-4 py-3">
          <div className="flex items-center gap-3 text-caption opacity-60">
            <Metric icon={<ThumbsUp size={12} strokeWidth={2} />} value={product.recommendationCount} />
            <Metric icon={<MessageCircle size={12} strokeWidth={2} />} value={product.commentCount} />
            <Metric icon={<Eye size={12} strokeWidth={2} />} value={product.viewCount} />
          </div>
          <span className="btn-icon h-9 w-9" aria-hidden="true">
            <ArrowUpRight size={16} strokeWidth={1.8} />
          </span>
        </footer>
      </article>
    </Link>
  );
}

function ProductFallbackArt() {
  return (
    <div className="product-card-fallback-scene" aria-hidden="true">
      <span className="scene-sky" />
      <span className="scene-hill-a" />
      <span className="scene-hill-b" />
      <span className="scene-path" />
      <span className="scene-tile scene-tile-a" />
      <span className="scene-tile scene-tile-b" />
      <span className="scene-tile scene-tile-c" />
      <span className="scene-lens" />
    </div>
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
