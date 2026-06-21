import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getAnonymousId, persistAnonymousId } from "@/lib/analytics/anonymous-id";
import { hasPublicSupabaseEnv } from "@/lib/env.client";
import { isUuid } from "@/lib/search/normalize-query";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const productViewSchema = z.object({
  productId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const parsed = productViewSchema.safeParse(await request.json().catch(() => null));
  const response = NextResponse.json({ ok: true });

  if (!parsed.success || !hasPublicSupabaseEnv() || !isUuid(parsed.data.productId)) {
    return response;
  }

  const anonymousId = getAnonymousId(request);
  persistAnonymousId(response, anonymousId);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("product_view_logs").insert({
    product_id: parsed.data.productId,
    user_id: user?.id ?? null,
    anonymous_id: user ? null : anonymousId,
  });

  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return response;
}
