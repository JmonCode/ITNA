import "server-only";

import { hasOpenAIEnv } from "@/lib/env.server";
import { createTextEmbedding } from "@/lib/openai/embeddings";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  count: number;
};

export type ProductListItem = {
  id: string;
  name: string;
  shortDescription: string;
  productType: "web" | "app" | "web_app";
  category: ProductCategory;
  pricingType: "free" | "paid" | "freemium" | "subscription";
  launchStatus: "developing" | "beta" | "launched";
  isAiBuilt: boolean;
  hasAiFeature: boolean;
  recommendationCount: number;
  commentCount: number;
  viewCount: number;
  imageUrl?: string | null;
  websiteUrl?: string | null;
  androidUrl?: string | null;
  iosUrl?: string | null;
  tags: string[];
  thumbnailColor: "lime" | "lilac" | "cream" | "pink" | "mint" | "coral";
  createdAt: string;
};

export type ProductCatalogFilters = {
  query?: string;
  category?: string;
  productType?: string;
  pricing?: string;
  sort?: string;
};

type ProductCatalog = {
  categories: ProductCategory[];
  products: ProductListItem[];
  source: "supabase" | "demo";
  searchType: "none" | "keyword" | "hybrid" | "demo";
};

const demoCategories: ProductCategory[] = [
  {
    id: "ai-tools",
    name: "AI 도구",
    slug: "ai-tools",
    description: "AI 기능이 포함된 제품과 AI 제작 도구",
    count: 2,
  },
  {
    id: "productivity",
    name: "생산성",
    slug: "productivity",
    description: "업무와 개인 생산성을 높이는 도구",
    count: 2,
  },
  {
    id: "design",
    name: "디자인",
    slug: "design",
    description: "디자인 제작, 협업, 피드백 도구",
    count: 1,
  },
  {
    id: "development",
    name: "개발",
    slug: "development",
    description: "개발자와 소프트웨어 제작자를 위한 도구",
    count: 2,
  },
  {
    id: "health-fitness",
    name: "운동/건강",
    slug: "health-fitness",
    description: "운동, 건강, 루틴 관리 도구",
    count: 1,
  },
  {
    id: "life",
    name: "생활",
    slug: "life",
    description: "일상생활 문제를 해결하는 도구",
    count: 1,
  },
];

const categoryBySlug = new Map(demoCategories.map((category) => [category.slug, category]));
const productCatalogLimit = 9;

const demoProducts: ProductListItem[] = [
  {
    id: "routine-fit",
    name: "루틴핏",
    shortDescription: "혼자 운동하는 사람을 위한 루틴 생성과 기록 관리 앱",
    productType: "app",
    category: categoryBySlug.get("health-fitness")!,
    pricingType: "freemium",
    launchStatus: "beta",
    isAiBuilt: true,
    hasAiFeature: true,
    recommendationCount: 42,
    commentCount: 8,
    viewCount: 821,
    websiteUrl: "https://example.com/routine-fit",
    tags: ["루틴", "기록", "모바일"],
    thumbnailColor: "lime",
    createdAt: "2026-06-10",
  },
  {
    id: "portfolio-reviewer",
    name: "포트폴리오 리뷰어",
    shortDescription: "디자이너 포트폴리오를 AI와 동료 피드백으로 점검하는 웹서비스",
    productType: "web",
    category: categoryBySlug.get("design")!,
    pricingType: "subscription",
    launchStatus: "launched",
    isAiBuilt: false,
    hasAiFeature: true,
    recommendationCount: 31,
    commentCount: 12,
    viewCount: 612,
    websiteUrl: "https://example.com/portfolio-reviewer",
    tags: ["피드백", "디자인", "AI 기능"],
    thumbnailColor: "lilac",
    createdAt: "2026-06-08",
  },
  {
    id: "booking-note",
    name: "예약노트",
    shortDescription: "소상공인이 예약, 알림, 고객 메모를 한 번에 관리하는 도구",
    productType: "web_app",
    category: categoryBySlug.get("life")!,
    pricingType: "paid",
    launchStatus: "beta",
    isAiBuilt: false,
    hasAiFeature: false,
    recommendationCount: 19,
    commentCount: 5,
    viewCount: 433,
    websiteUrl: "https://example.com/booking-note",
    tags: ["예약", "고객관리", "웹앱"],
    thumbnailColor: "coral",
    createdAt: "2026-06-04",
  },
  {
    id: "bug-scout",
    name: "버그스카우트",
    shortDescription: "AI 코딩 중 놓치기 쉬운 회귀와 예외 케이스를 점검하는 개발 도구",
    productType: "web",
    category: categoryBySlug.get("development")!,
    pricingType: "freemium",
    launchStatus: "beta",
    isAiBuilt: true,
    hasAiFeature: true,
    recommendationCount: 58,
    commentCount: 15,
    viewCount: 1044,
    websiteUrl: "https://example.com/bug-scout",
    tags: ["개발", "테스트", "AI"],
    thumbnailColor: "mint",
    createdAt: "2026-06-12",
  },
  {
    id: "write-mate",
    name: "라이트메이트",
    shortDescription: "긴 글의 구조, 문장 톤, 다음 초안을 함께 잡아주는 글쓰기 도구",
    productType: "web",
    category: categoryBySlug.get("ai-tools")!,
    pricingType: "subscription",
    launchStatus: "launched",
    isAiBuilt: false,
    hasAiFeature: true,
    recommendationCount: 73,
    commentCount: 21,
    viewCount: 1442,
    websiteUrl: "https://example.com/write-mate",
    tags: ["글쓰기", "초안", "AI"],
    thumbnailColor: "cream",
    createdAt: "2026-06-01",
  },
  {
    id: "focus-loop",
    name: "포커스루프",
    shortDescription: "혼자 공부할 때 집중 시간, 방해 요소, 회고를 관리하는 생산성 앱",
    productType: "app",
    category: categoryBySlug.get("productivity")!,
    pricingType: "free",
    launchStatus: "developing",
    isAiBuilt: true,
    hasAiFeature: false,
    recommendationCount: 24,
    commentCount: 3,
    viewCount: 389,
    iosUrl: "https://example.com/focus-loop",
    tags: ["집중", "공부", "회고"],
    thumbnailColor: "pink",
    createdAt: "2026-05-28",
  },
  {
    id: "landing-pad",
    name: "랜딩패드",
    shortDescription: "앱 출시 전에 검증용 랜딩페이지와 대기자 명단을 빠르게 만드는 웹 도구",
    productType: "web",
    category: categoryBySlug.get("ai-tools")!,
    pricingType: "freemium",
    launchStatus: "launched",
    isAiBuilt: true,
    hasAiFeature: true,
    recommendationCount: 47,
    commentCount: 10,
    viewCount: 936,
    websiteUrl: "https://example.com/landing-pad",
    tags: ["랜딩페이지", "출시", "검증"],
    thumbnailColor: "lime",
    createdAt: "2026-06-14",
  },
  {
    id: "team-pulse",
    name: "팀펄스",
    shortDescription: "작은 팀의 주간 목표, 회고, 진행 상황을 한 화면에서 정리하는 협업 도구",
    productType: "web_app",
    category: categoryBySlug.get("productivity")!,
    pricingType: "subscription",
    launchStatus: "beta",
    isAiBuilt: false,
    hasAiFeature: true,
    recommendationCount: 36,
    commentCount: 7,
    viewCount: 704,
    websiteUrl: "https://example.com/team-pulse",
    tags: ["협업", "회고", "목표"],
    thumbnailColor: "lilac",
    createdAt: "2026-06-13",
  },
  {
    id: "api-mock-studio",
    name: "API 목업 스튜디오",
    shortDescription: "프론트엔드 개발자가 백엔드 없이 API 응답과 에러 케이스를 구성하는 개발 도구",
    productType: "web",
    category: categoryBySlug.get("development")!,
    pricingType: "free",
    launchStatus: "launched",
    isAiBuilt: false,
    hasAiFeature: false,
    recommendationCount: 28,
    commentCount: 6,
    viewCount: 588,
    websiteUrl: "https://example.com/api-mock-studio",
    tags: ["API", "목업", "개발"],
    thumbnailColor: "mint",
    createdAt: "2026-06-11",
  },
];

export async function getProductCatalog(filters: ProductCatalogFilters): Promise<ProductCatalog> {
  if (!hasSupabaseReadEnv()) {
    return filterDemoCatalog(filters);
  }

  try {
    const catalog = await getSupabaseCatalog(filters);
    return catalog;
  } catch {
    return filterDemoCatalog(filters);
  }
}

export async function getProductById(id: string) {
  if (!hasSupabaseReadEnv()) {
    return demoProducts.find((product) => product.id === id) ?? null;
  }

  try {
    return await getSupabaseProductById(id);
  } catch {
    return demoProducts.find((product) => product.id === id) ?? null;
  }
}

function hasSupabaseReadEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function filterDemoCatalog(filters: ProductCatalogFilters): ProductCatalog {
  const normalizedQuery = normalize(filters.query);
  const queryTokens = tokenizeQuery(filters.query);
  const selectedCategory = filters.category;

  let products = demoProducts.filter((product) => {
    const searchText = normalize(
      [
        product.name,
        product.shortDescription,
        product.category.name,
        product.tags.join(" "),
        product.hasAiFeature ? "AI" : "",
      ].join(" "),
    );
    const matchesQuery =
      !normalizedQuery ||
      searchText.includes(normalizedQuery) ||
      queryTokens.some((token) => searchText.includes(token));
    const matchesCategory = !selectedCategory || product.category.slug === selectedCategory;
    const matchesType = !filters.productType || product.productType === filters.productType;
    const matchesPricing = !filters.pricing || product.pricingType === filters.pricing;

    return matchesQuery && matchesCategory && matchesType && matchesPricing;
  });

  products = sortProducts(products, filters.sort).slice(0, productCatalogLimit);

  return {
    categories: demoCategories,
    products,
    source: "demo",
    searchType: filters.query ? "demo" : "none",
  };
}

async function getSupabaseCatalog(filters: ProductCatalogFilters): Promise<ProductCatalog> {
  const supabase = await createSupabaseServerClient();
  const categoryRows = await getSupabaseCategoryRows(supabase);
  const normalizedQuery = normalize(filters.query);

  if (normalizedQuery && hasOpenAIEnv() && shouldUseHybridSearch(filters.sort)) {
    try {
      const products = await getSupabaseHybridProducts({
        supabase,
        filters,
        categoryRows,
        normalizedQuery,
      });

      return {
        categories: mapCategoryRows(categoryRows, products),
        products,
        source: "supabase",
        searchType: "hybrid",
      };
    } catch {
      // Keep the UI usable if embeddings or the RPC are not ready yet.
    }
  }

  const products = await getSupabaseKeywordProducts({ supabase, filters, categoryRows });

  return {
    categories: mapCategoryRows(categoryRows, products),
    products,
    source: "supabase",
    searchType: normalizedQuery ? "keyword" : "none",
  };
}

async function getSupabaseCategoryRows(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
) {
  const { data: categoryRows, error: categoryError } = await supabase
    .from("categories")
    .select("id,name,slug,description")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (categoryError) {
    throw categoryError;
  }

  return categoryRows ?? [];
}

async function getSupabaseKeywordProducts({
  supabase,
  filters,
  categoryRows,
}: {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  filters: ProductCatalogFilters;
  categoryRows: Array<{ id: string; name: string; slug: string; description: string | null }>;
}) {
  let query = supabase
    .from("products")
    .select(
      `
      id,
      name,
      short_description,
      product_type,
      pricing_type,
      launch_status,
      is_ai_built,
      has_ai_feature,
      recommendation_count,
      comment_count,
      view_count,
      website_url,
      android_url,
      ios_url,
      created_at,
      categories(id,name,slug,description),
      product_images(image_url,image_type,sort_order,deleted_at),
      product_tags(tags(name))
    `,
    )
    .eq("status", "approved")
    .is("deleted_at", null)
    .limit(productCatalogLimit);

  if (filters.category) {
    const category = categoryRows?.find((row) => row.slug === filters.category);
    if (category) {
      query = query.eq("category_id", category.id);
    }
  }

  if (filters.productType) {
    query = query.eq("product_type", filters.productType);
  }

  if (filters.pricing) {
    query = query.eq("pricing_type", filters.pricing);
  }

  const normalizedQuery = normalize(filters.query);
  if (normalizedQuery) {
    query = query.or(
      `name.ilike.%${escapeIlike(normalizedQuery)}%,short_description.ilike.%${escapeIlike(
        normalizedQuery,
      )}%,search_text.ilike.%${escapeIlike(normalizedQuery)}%`,
    );
  }

  query = applySupabaseSort(query, filters.sort);

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return (data ?? []).map((row, index) => mapProductRow(row, index));
}

async function getSupabaseHybridProducts({
  supabase,
  filters,
  categoryRows,
  normalizedQuery,
}: {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  filters: ProductCatalogFilters;
  categoryRows: Array<{ id: string; name: string; slug: string; description: string | null }>;
  normalizedQuery: string;
}) {
  const categoryId = filters.category
    ? categoryRows.find((row) => row.slug === filters.category)?.id ?? null
    : null;
  const embedding = await createTextEmbedding(normalizedQuery);

  if (!embedding.length) {
    throw new Error("Embedding creation returned no vector.");
  }

  const { data: rankedRows, error: rankError } = await supabase.rpc("search_products_hybrid", {
    query_text: normalizedQuery,
    query_embedding: `[${embedding.join(",")}]`,
    match_count: productCatalogLimit * 3,
    category_filter: categoryId,
  });

  if (rankError) {
    throw rankError;
  }

  const rankedIds = ((rankedRows ?? []) as Array<{ id: string }>).map((row) => row.id);

  if (!rankedIds.length) {
    return [];
  }

  let productQuery = supabase
    .from("products")
    .select(
      `
      id,
      name,
      short_description,
      product_type,
      pricing_type,
      launch_status,
      is_ai_built,
      has_ai_feature,
      recommendation_count,
      comment_count,
      view_count,
      website_url,
      android_url,
      ios_url,
      created_at,
      categories(id,name,slug,description),
      product_images(image_url,image_type,sort_order,deleted_at),
      product_tags(tags(name))
    `,
    )
    .in("id", rankedIds)
    .eq("status", "approved")
    .is("deleted_at", null);

  if (filters.productType) {
    productQuery = productQuery.eq("product_type", filters.productType);
  }

  if (filters.pricing) {
    productQuery = productQuery.eq("pricing_type", filters.pricing);
  }

  const { data: productRows, error: productError } = await productQuery;

  if (productError) {
    throw productError;
  }

  const rowById = new Map((productRows ?? []).map((row) => [row.id, row]));

  return rankedIds
    .map((id, index) => {
      const row = rowById.get(id);
      return row ? mapProductRow(row, index) : null;
    })
    .filter((product): product is ProductListItem => Boolean(product))
    .slice(0, productCatalogLimit);
}

async function getSupabaseProductById(id: string): Promise<ProductListItem | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      short_description,
      product_type,
      pricing_type,
      launch_status,
      is_ai_built,
      has_ai_feature,
      recommendation_count,
      comment_count,
      view_count,
      website_url,
      android_url,
      ios_url,
      created_at,
      categories(id,name,slug,description),
      product_images(image_url,image_type,sort_order,deleted_at),
      product_tags(tags(name))
    `,
    )
    .eq("id", id)
    .eq("status", "approved")
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapProductRow(data, 0) : null;
}

function mapProductRow(row: unknown, index: number): ProductListItem {
  const product = row as {
    id: string;
    name: string;
    short_description: string;
    product_type: ProductListItem["productType"];
    pricing_type: ProductListItem["pricingType"];
    launch_status: ProductListItem["launchStatus"];
    is_ai_built: boolean;
    has_ai_feature: boolean;
    recommendation_count: number;
    comment_count: number;
    view_count: number;
    website_url?: string | null;
    android_url?: string | null;
    ios_url?: string | null;
    created_at: string;
    product_tags?: unknown[];
  };
  const category = getJoinedCategory(row);

  return {
    id: product.id,
    name: product.name,
    shortDescription: product.short_description,
    productType: product.product_type,
    category: {
      id: category?.id ?? "uncategorized",
      name: category?.name ?? "기타",
      slug: category?.slug ?? "other",
      description: category?.description ?? "",
      count: 0,
    },
    pricingType: product.pricing_type,
    launchStatus: product.launch_status,
    isAiBuilt: product.is_ai_built,
    hasAiFeature: product.has_ai_feature,
    recommendationCount: product.recommendation_count,
    commentCount: product.comment_count,
    viewCount: product.view_count,
    imageUrl: getProductImageUrl(row),
    websiteUrl: product.website_url,
    androidUrl: product.android_url,
    iosUrl: product.ios_url,
    tags:
      product.product_tags
        ?.map((tagJoin) => getJoinedTagName(tagJoin))
        .filter((tag): tag is string => Boolean(tag)) ?? [],
    thumbnailColor: pickThumbnailColor(index),
    createdAt: product.created_at,
  };
}

function applySupabaseSort<T extends { order: (column: string, options?: { ascending?: boolean }) => T }>(
  query: T,
  sort?: string,
) {
  switch (sort) {
    case "popular":
      return query.order("recommendation_count", { ascending: false });
    case "comments":
      return query.order("comment_count", { ascending: false });
    case "views":
      return query.order("view_count", { ascending: false });
    case "newest":
    default:
      return query.order("created_at", { ascending: false });
  }
}

function sortProducts(products: ProductListItem[], sort?: string) {
  return [...products].sort((a, b) => {
    switch (sort) {
      case "popular":
        return b.recommendationCount - a.recommendationCount;
      case "comments":
        return b.commentCount - a.commentCount;
      case "views":
        return b.viewCount - a.viewCount;
      case "newest":
      default:
        return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    }
  });
}

function mapCategoryRows(
  categoryRows: Array<{ id: string; name: string; slug: string; description: string | null }>,
  products: ProductListItem[],
) {
  return categoryRows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    count: products.filter((product) => product.category.id === row.id).length,
  }));
}

function shouldUseHybridSearch(sort?: string) {
  return !sort || sort === "newest" || sort === "relevance";
}

function normalize(value?: string) {
  return value?.trim().toLowerCase().replace(/\s+/g, " ") ?? "";
}

function tokenizeQuery(value?: string) {
  return normalize(value)
    .split(" ")
    .map((token) => token.replace(/(으로|로|을|를|은|는|이|가|에|의|과|와)$/u, ""))
    .filter((token) => token.length >= 2);
}

function escapeIlike(value: string) {
  return value.replaceAll("%", "\\%").replaceAll("_", "\\_").replaceAll(",", "\\,");
}

function pickThumbnailColor(index: number): ProductListItem["thumbnailColor"] {
  const colors: ProductListItem["thumbnailColor"][] = [
    "lime",
    "lilac",
    "coral",
    "mint",
    "cream",
    "pink",
  ];
  return colors[index % colors.length];
}

function getJoinedCategory(row: unknown) {
  const category = (row as { categories?: unknown }).categories;
  if (Array.isArray(category)) {
    return category[0] as
      | { id: string; name: string; slug: string; description: string | null }
      | undefined;
  }
  return category as { id: string; name: string; slug: string; description: string | null } | null;
}

function getJoinedTagName(row: unknown) {
  const tag = (row as { tags?: unknown }).tags;
  if (Array.isArray(tag)) {
    return (tag[0] as { name?: string } | undefined)?.name;
  }
  return (tag as { name?: string } | null)?.name;
}

function getProductImageUrl(row: unknown) {
  const images = (row as { product_images?: unknown }).product_images;
  const imageRows = Array.isArray(images) ? images : images ? [images] : [];

  return imageRows
    .map(
      (image) =>
        image as {
          image_url?: string | null;
          image_type?: string | null;
          sort_order?: number | null;
          deleted_at?: string | null;
        },
    )
    .filter((image) => image.image_url && !image.deleted_at)
    .sort((a, b) => {
      const aTypeRank = a.image_type === "thumbnail" ? 0 : 1;
      const bTypeRank = b.image_type === "thumbnail" ? 0 : 1;

      return aTypeRank - bTypeRank || (a.sort_order ?? 0) - (b.sort_order ?? 0);
    })[0]?.image_url ?? null;
}
