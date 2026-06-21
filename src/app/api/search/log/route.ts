import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getAnonymousId, persistAnonymousId } from "@/lib/analytics/anonymous-id";
import { hasPublicSupabaseEnv } from "@/lib/env.client";
import { normalizeSearchQuery } from "@/lib/search/normalize-query";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const searchLogSchema = z.object({
  query: z.string().trim().min(1).max(500),
  resultCount: z.number().int().min(0).max(10000),
  searchType: z.enum(["keyword", "semantic", "hybrid"]).default("keyword"),
  filters: z
    .object({
      category: z.string().optional(),
      productType: z.string().optional(),
      pricing: z.string().optional(),
    })
    .default({}),
  sortOption: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const parsed = searchLogSchema.safeParse(await request.json().catch(() => null));
  const response = NextResponse.json({ ok: true });

  if (!parsed.success || !hasPublicSupabaseEnv()) {
    return response;
  }

  const anonymousId = getAnonymousId(request);
  persistAnonymousId(response, anonymousId);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const normalizedQuery = normalizeSearchQuery(parsed.data.query);

  const { error } = await supabase.from("search_logs").insert({
    user_id: user?.id ?? null,
    anonymous_id: user ? null : anonymousId,
    query: parsed.data.query.trim(),
    normalized_query: normalizedQuery,
    result_count: parsed.data.resultCount,
    filters: parsed.data.filters,
    sort_option: parsed.data.sortOption,
    is_zero_result: parsed.data.resultCount === 0,
    search_type: parsed.data.searchType,
  });

  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return response;
}
