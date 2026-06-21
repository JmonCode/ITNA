import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { hasPublicSupabaseEnv } from "@/lib/env.client";
import { isUuid } from "@/lib/search/normalize-query";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const searchClickSchema = z.object({
  productId: z.string().min(1),
  rankPosition: z.number().int().min(1).max(1000),
});

export async function POST(request: NextRequest) {
  const parsed = searchClickSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success || !hasPublicSupabaseEnv() || !isUuid(parsed.data.productId)) {
    return NextResponse.json({ ok: true });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("search_click_logs").insert({
    product_id: parsed.data.productId,
    rank_position: parsed.data.rankPosition,
  });

  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
