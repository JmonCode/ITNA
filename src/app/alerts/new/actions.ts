"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { hasPublicSupabaseEnv } from "@/lib/env.client";
import { normalizeSearchQuery } from "@/lib/search/normalize-query";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const searchAlertSchema = z.object({
  query: z.string().trim().min(1).max(500),
  email: z
    .string()
    .trim()
    .email()
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export async function createSearchAlertAction(formData: FormData) {
  if (!hasPublicSupabaseEnv()) {
    redirect("/alerts/new?error=supabase-env");
  }

  const parsed = searchAlertSchema.safeParse({
    query: formData.get("query")?.toString(),
    email: formData.get("email")?.toString(),
  });

  if (!parsed.success) {
    redirect(`/alerts/new?q=${encodeURIComponent(formData.get("query")?.toString() ?? "")}&error=validation`);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !parsed.data.email) {
    redirect(`/alerts/new?q=${encodeURIComponent(parsed.data.query)}&error=email-required`);
  }

  const { error } = await supabase.from("search_alerts").insert({
    user_id: user?.id ?? null,
    email: user ? null : parsed.data.email,
    query: normalizeSearchQuery(parsed.data.query),
    is_active: true,
  });

  if (error) {
    redirect(`/alerts/new?q=${encodeURIComponent(parsed.data.query)}&error=insert`);
  }

  revalidatePath("/admin/search-alerts/export");
  redirect(`/alerts/new?q=${encodeURIComponent(parsed.data.query)}&saved=1`);
}
