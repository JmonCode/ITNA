import Link from "next/link";
import { ArrowUpRight, Bell, Filter, Search } from "lucide-react";

import { MarqueeStrip } from "@/components/marquee-strip";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { getProductCatalog, type ProductCatalogFilters } from "@/lib/products/catalog";

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const productTypeOptions = [
  { value: "web", label: "웹" },
  { value: "app", label: "앱" },
  { value: "web_app", label: "웹 + 앱" },
];

const pricingOptions = [
  { value: "free", label: "무료" },
  { value: "paid", label: "유료" },
  { value: "freemium", label: "부분 유료" },
  { value: "subscription", label: "구독형" },
];

const sortOptions = [
  { value: "newest", label: "최신순" },
  { value: "popular", label: "추천 많은 순" },
  { value: "comments", label: "댓글 많은 순" },
  { value: "views", label: "조회 많은 순" },
];

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const filters = normalizeFilters(params);
  const catalog = await getProductCatalog(filters);
  const selectedSort = filters.sort ?? "newest";
  const resultLabel = filters.query
    ? `"${filters.query}" 검색 결과 ${catalog.products.length}개`
    : `전체 제품 ${catalog.products.length}개`;

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />
      <MarqueeStrip />

      <section className="container-page space-y-6 py-10 md:py-12">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-3">
            <p className="text-eyebrow">Product Search</p>
            <h1 className="text-display-lg">제품 탐색</h1>
            <p className="max-w-2xl text-body">
              필요한 기능, 상황, 문제를 문장으로 입력하고 관련 제품을 바로 비교하세요.
            </p>
          </div>
          <Link className="btn-secondary border border-hairline" href="/submit">
            제품 등록
            <ArrowUpRight size={20} strokeWidth={1.8} />
          </Link>
        </div>

        <form className="operational-card flex flex-col gap-3 p-3 md:flex-row" action="/products">
          <label className="sr-only" htmlFor="q">
            제품 검색
          </label>
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[var(--radius-md)] bg-surface-soft px-4">
            <Search size={22} strokeWidth={1.8} />
            <input
              id="q"
              name="q"
              className="min-h-14 min-w-0 flex-1 bg-transparent text-body outline-none placeholder:text-ink"
              placeholder="예: 앱 출시 전에 랜딩페이지 만들 수 있는 서비스"
              defaultValue={filters.query}
            />
          </div>
          <input type="hidden" name="category" value={filters.category ?? ""} />
          <input type="hidden" name="type" value={filters.productType ?? ""} />
          <input type="hidden" name="pricing" value={filters.pricing ?? ""} />
          <button className="btn-primary" type="submit">
            검색
            <ArrowUpRight size={20} strokeWidth={1.8} />
          </button>
        </form>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <Filter className="mt-2 shrink-0 md:hidden" size={20} strokeWidth={1.8} />
          <FilterChip href={buildHref(filters, { category: undefined })} selected={!filters.category}>
            전체
          </FilterChip>
          {catalog.categories.map((category) => (
            <FilterChip
              key={category.slug}
              href={buildHref(filters, { category: category.slug })}
              selected={filters.category === category.slug}
            >
              {category.name}
            </FilterChip>
          ))}
        </div>
      </section>

      <section className="container-page grid gap-6 pb-16 md:grid-cols-[240px_1fr]">
        <aside className="hidden md:block">
          <div className="sticky top-24 space-y-6 border-r border-hairline-soft pr-6">
            <FilterGroup title="제품 유형">
              {productTypeOptions.map((option) => (
                <FilterLink
                  key={option.value}
                  href={buildHref(filters, {
                    productType: filters.productType === option.value ? undefined : option.value,
                  })}
                  selected={filters.productType === option.value}
                >
                  {option.label}
                </FilterLink>
              ))}
            </FilterGroup>

            <FilterGroup title="가격">
              {pricingOptions.map((option) => (
                <FilterLink
                  key={option.value}
                  href={buildHref(filters, {
                    pricing: filters.pricing === option.value ? undefined : option.value,
                  })}
                  selected={filters.pricing === option.value}
                >
                  {option.label}
                </FilterLink>
              ))}
            </FilterGroup>
          </div>
        </aside>

        <div className="space-y-5">
          <div className="flex flex-col gap-3 border-b border-hairline-soft pb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-caption">{catalog.source === "demo" ? "Demo Catalog" : "Live Catalog"}</p>
              <h2 className="text-headline">{resultLabel}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => (
                <FilterChip
                  key={option.value}
                  href={buildHref(filters, { sort: option.value })}
                  selected={selectedSort === option.value}
                >
                  {option.label}
                </FilterChip>
              ))}
            </div>
          </div>

          {catalog.products.length > 0 ? (
            <div className="grid items-stretch gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {catalog.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <ZeroResultPanel query={filters.query} />
          )}
        </div>
      </section>
    </main>
  );
}

function normalizeFilters(params: Record<string, string | string[] | undefined>): ProductCatalogFilters {
  return {
    query: getSingleParam(params.q),
    category: getSingleParam(params.category),
    productType: getSingleParam(params.type),
    pricing: getSingleParam(params.pricing),
    sort: getSingleParam(params.sort) ?? "newest",
  };
}

function getSingleParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value?.trim() || undefined;
}

function buildHref(filters: ProductCatalogFilters, patch: Partial<ProductCatalogFilters>) {
  const nextFilters = { ...filters, ...patch };
  const params = new URLSearchParams();

  if (nextFilters.query) params.set("q", nextFilters.query);
  if (nextFilters.category) params.set("category", nextFilters.category);
  if (nextFilters.productType) params.set("type", nextFilters.productType);
  if (nextFilters.pricing) params.set("pricing", nextFilters.pricing);
  if (nextFilters.sort && nextFilters.sort !== "newest") params.set("sort", nextFilters.sort);

  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

function FilterChip({
  href,
  selected,
  children,
}: {
  href: string;
  selected: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      className={
        selected
          ? "whitespace-nowrap rounded-[var(--radius-full)] bg-primary px-4 py-2 text-body-sm text-on-primary"
          : "whitespace-nowrap rounded-[var(--radius-full)] border border-hairline px-4 py-2 text-body-sm"
      }
      href={href}
    >
      {children}
    </Link>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-caption">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function FilterLink({
  href,
  selected,
  children,
}: {
  href: string;
  selected: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      className={
        selected
          ? "flex min-h-10 items-center justify-between rounded-[var(--radius-pill)] bg-primary px-4 text-body-sm text-on-primary"
          : "flex min-h-10 items-center justify-between rounded-[var(--radius-pill)] bg-surface-soft px-4 text-body-sm"
      }
      href={href}
    >
      {children}
    </Link>
  );
}

function ZeroResultPanel({ query }: { query?: string }) {
  return (
    <div className="color-block bg-block-lime">
      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div className="space-y-3">
          <p className="text-eyebrow">Zero Result</p>
          <h2 className="text-headline">아직 조건에 맞는 제품을 찾지 못했어요.</h2>
          <p className="max-w-2xl text-body-sm">
            {query ? `"${query}"와 비슷한 제품이 등록되면 알려드릴 수 있습니다.` : "검색어를 조금 넓히거나 카테고리를 둘러보세요."}
          </p>
        </div>
        <Link className="btn-primary" href={`/alerts/new${query ? `?q=${encodeURIComponent(query)}` : ""}`}>
          <Bell size={20} strokeWidth={1.8} />
          알림 받기
        </Link>
      </div>
    </div>
  );
}
