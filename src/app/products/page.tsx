import Link from "next/link";
import { ArrowUpRight, Bell, Search } from "lucide-react";

import { MarqueeStrip } from "@/components/marquee-strip";
import { ProductCard } from "@/components/product-card";
import { ProductLiveSearch } from "@/components/product-live-search";
import { SiteHeader } from "@/components/site-header";
import { getProductCatalog, type ProductCatalogFilters } from "@/lib/products/catalog";

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const filterGroups = [
  {
    key: "type",
    label: "유형",
    options: [
      { value: "web", label: "웹" },
      { value: "app", label: "앱" },
      { value: "web_app", label: "웹+앱" },
    ],
  },
  {
    key: "pricing",
    label: "가격",
    options: [
      { value: "free", label: "무료" },
      { value: "paid", label: "유료" },
      { value: "freemium", label: "프리미엄" },
      { value: "subscription", label: "구독" },
    ],
  },
] as const;

const sortOptions = [
  { value: "newest", label: "최신순" },
  { value: "popular", label: "추천순" },
  { value: "comments", label: "댓글순" },
  { value: "views", label: "조회순" },
];

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const filters = normalizeFilters(params);
  const catalog = await getProductCatalog(filters);
  const selectedSort = filters.sort ?? "newest";

  const hasActiveFilters = filters.category || filters.productType || filters.pricing;
  const resultLabel = filters.query
    ? `"${filters.query}" 검색 결과`
    : "전체 제품";

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />
      <MarqueeStrip />

      {/* ── Hero search area ── */}
      <section className="border-b border-hairline-soft">
        <div className="container-page space-y-6 py-8 md:py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-eyebrow">Product Search</p>
              <h1 className="text-display-lg mt-1">제품 탐색</h1>
            </div>
            <Link className="btn-primary shrink-0" href="/submit">
              제품 등록
              <ArrowUpRight size={18} strokeWidth={1.8} />
            </Link>
          </div>

          <ProductLiveSearch filters={filters} />

          {/* ── Categories — horizontal scroll ── */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <CategoryChip
              href={buildHref(filters, { category: undefined })}
              selected={!filters.category}
            >
              전체
            </CategoryChip>
            {catalog.categories.map((category) => (
              <CategoryChip
                key={category.slug}
                href={buildHref(filters, { category: category.slug })}
                selected={filters.category === category.slug}
              >
                {category.name}
              </CategoryChip>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Layout ── */}
      <section className="container-page grid gap-8 py-8 md:grid-cols-[220px_1fr] md:py-10">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block">
          <div className="sticky top-24 space-y-8 border-r border-hairline-soft pr-6">
            <FilterGroup title="제품 유형">
              {filterGroups[0].options.map((option) => (
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
              {filterGroups[1].options.map((option) => (
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

        {/* Content Area */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline-soft pb-4">
            {/* Result Label + Mobile Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-headline shrink-0">
                {resultLabel}
                <span className="ml-2 text-body-sm font-normal opacity-50">
                  {catalog.products.length}개
                </span>
              </h2>

              {/* Mobile Filter: visible only below md */}
              <div className="flex w-full items-center gap-2 overflow-x-auto pb-1 scrollbar-hide md:hidden">
                <span className="mx-1 h-4 w-px shrink-0 bg-hairline" />
                {filterGroups.map((group) => (
                  <FilterDropdown
                    key={group.key}
                    label={group.label}
                    options={group.options}
                    filters={filters}
                    filterKey={group.key}
                  />
                ))}
              </div>
            </div>

            {/* Right: Sort Options */}
            <div className="flex items-center gap-1">
              {sortOptions.map((option) => (
                <SortChip
                  key={option.value}
                  href={buildHref(filters, { sort: option.value })}
                  selected={selectedSort === option.value}
                >
                  {option.label}
                </SortChip>
              ))}
            </div>
          </div>

          {/* Active filters display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-caption opacity-50">필터:</span>
              {filters.category && (
                <ActiveFilter
                  label={catalog.categories.find((c) => c.slug === filters.category)?.name ?? filters.category}
                  href={buildHref(filters, { category: undefined })}
                />
              )}
              {filters.productType && (
                <ActiveFilter
                  label={filterGroups[0].options.find((o) => o.value === filters.productType)?.label ?? filters.productType}
                  href={buildHref(filters, { productType: undefined })}
                />
              )}
              {filters.pricing && (
                <ActiveFilter
                  label={filterGroups[1].options.find((o) => o.value === filters.pricing)?.label ?? filters.pricing}
                  href={buildHref(filters, { pricing: undefined })}
                />
              )}
              <Link
                className="text-caption text-accent-magenta transition-opacity hover:opacity-70"
                href="/products"
              >
                전체 해제
              </Link>
            </div>
          )}

          {/* Product results */}
          {catalog.products.length > 0 ? (
            <div className="space-y-3">
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

/* ── Helpers ── */

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

/* ── UI Components ── */

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-caption font-bold tracking-wider text-ink/40 uppercase">{title}</h3>
      <div className="flex flex-col gap-2">{children}</div>
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
      className={`group flex items-center gap-2.5 py-1 text-body-sm transition-all duration-200 ${
        selected
          ? "font-bold text-ink"
          : "text-ink/50 hover:text-ink"
      }`}
      href={href}
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border transition-all duration-200 ${
          selected
            ? "border-primary bg-primary text-on-primary"
            : "border-hairline bg-transparent group-hover:border-ink/40"
        }`}
      >
        {selected && (
          <svg
            className="h-2.5 w-2.5 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      <span>{children}</span>
    </Link>
  );
}

function CategoryChip({
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
          ? "category-chip-selected"
          : "category-chip"
      }
      href={href}
    >
      {children}
    </Link>
  );
}

function SortChip({
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
          ? "sort-chip-selected"
          : "sort-chip"
      }
      href={href}
    >
      {children}
    </Link>
  );
}

function FilterDropdown({
  label,
  options,
  filters,
  filterKey,
}: {
  label: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  filters: ProductCatalogFilters;
  filterKey: string;
}) {
  const currentValue = filterKey === "type" ? filters.productType : filters.pricing;

  return (
    <div className="flex shrink-0 items-center gap-1">
      <span className="text-caption opacity-50">{label}</span>
      {options.map((option) => {
        const isActive = currentValue === option.value;
        const patch =
          filterKey === "type"
            ? { productType: isActive ? undefined : option.value }
            : { pricing: isActive ? undefined : option.value };

        return (
          <Link
            key={option.value}
            className={isActive ? "filter-chip-active" : "filter-chip"}
            href={buildHref(filters, patch)}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}

function ActiveFilter({ label, href }: { label: string; href: string }) {
  return (
    <Link
      className="inline-flex items-center gap-1.5 rounded-[var(--radius-full)] bg-block-lilac/30 px-3 py-1 text-caption transition-colors hover:bg-block-lilac/50"
      href={href}
    >
      {label}
      <span aria-hidden="true">×</span>
    </Link>
  );
}

function ZeroResultPanel({ query }: { query?: string }) {
  return (
    <div className="color-block bg-block-cream">
      <div className="mx-auto max-w-xl space-y-5 text-center">
        <Search size={48} strokeWidth={1.2} className="mx-auto opacity-30" />
        <h2 className="text-headline">
          조건에 맞는 제품을 찾지 못했어요.
        </h2>
        <p className="text-body-sm">
          {query
            ? `"${query}"와 비슷한 제품이 등록되면 알려드릴 수 있습니다.`
            : "검색어를 조금 넓히거나 카테고리를 둘러보세요."}
        </p>
        <Link className="btn-primary mx-auto" href={`/alerts/new${query ? `?q=${encodeURIComponent(query)}` : ""}`}>
          <Bell size={18} strokeWidth={1.8} />
          알림 받기
        </Link>
      </div>
    </div>
  );
}
