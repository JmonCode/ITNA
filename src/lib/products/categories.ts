import "server-only";

import { hasPublicSupabaseEnv } from "@/lib/env.client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ProductCategoryOption = {
  id: string;
  name: string;
  slug: string;
};

export async function getProductCategoryOptions(): Promise<ProductCategoryOption[]> {
  if (!hasPublicSupabaseEnv()) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) {
    return [];
  }

  return data ?? [];
}
