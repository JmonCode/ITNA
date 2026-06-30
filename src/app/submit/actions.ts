"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { ensureUserProfile } from "@/lib/auth/super-admin";
import { buildProductSearchText } from "@/lib/products/search-text";
import { productSubmissionSchema } from "@/lib/products/validation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasPublicSupabaseEnv } from "@/lib/env.client";
import { hasSupabaseAdminEnv } from "@/lib/env.server";

const maxProductImageSize = 10 * 1024 * 1024;
const productImageExtensions: Record<string, string> = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function submitProductAction(formData: FormData) {
  if (!hasPublicSupabaseEnv()) {
    redirect("/submit?error=supabase-env");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/submit");
  }

  await ensureUserProfile(user);

  const rawInput = {
    name: getText(formData, "name"),
    shortDescription: getText(formData, "shortDescription"),
    description: getText(formData, "description"),
    productType: getText(formData, "productType"),
    websiteUrl: getText(formData, "websiteUrl"),
    androidUrl: getText(formData, "androidUrl"),
    iosUrl: getText(formData, "iosUrl"),
    categoryId: getText(formData, "categoryId"),
    targetUsers: getText(formData, "targetUsers"),
    problemSolved: getText(formData, "problemSolved"),
    mainFeatures: getText(formData, "mainFeatures"),
    pricingType: getText(formData, "pricingType"),
    launchStatus: getText(formData, "launchStatus"),
    isAiBuilt: formData.get("isAiBuilt") === "on",
    hasAiFeature: formData.get("hasAiFeature") === "on",
    aiToolsUsed: getText(formData, "aiToolsUsed"),
    makerName: getText(formData, "makerName"),
    contactEmail: getText(formData, "contactEmail"),
    tags: splitTags(getText(formData, "tags")),
  };

  const parsed = productSubmissionSchema.safeParse(rawInput);

  if (!parsed.success) {
    redirect("/submit?error=validation");
  }

  const productImage = getProductImage(formData.get("productImage"));
  if (productImage === false) {
    redirect("/submit?error=image");
  }
  if (productImage && !hasSupabaseAdminEnv()) {
    redirect("/submit?error=image-upload");
  }

  const { data: category } = await supabase
    .from("categories")
    .select("id,name")
    .eq("id", parsed.data.categoryId)
    .maybeSingle();

  const searchText = buildProductSearchText({
    ...parsed.data,
    categoryName: category?.name,
  });

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      name: parsed.data.name,
      short_description: parsed.data.shortDescription,
      description: parsed.data.description,
      product_type: parsed.data.productType,
      website_url: parsed.data.websiteUrl,
      android_url: parsed.data.androidUrl,
      ios_url: parsed.data.iosUrl,
      category_id: parsed.data.categoryId,
      target_users: parsed.data.targetUsers,
      problem_solved: parsed.data.problemSolved,
      main_features: parsed.data.mainFeatures,
      search_text: searchText,
      pricing_type: parsed.data.pricingType,
      launch_status: parsed.data.launchStatus,
      is_ai_built: parsed.data.isAiBuilt,
      has_ai_feature: parsed.data.hasAiFeature,
      ai_tools_used: parsed.data.aiToolsUsed,
      maker_id: user.id,
      maker_name: parsed.data.makerName,
      contact_email: parsed.data.contactEmail,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !product) {
    redirect("/submit?error=insert");
  }

  if (productImage) {
    const imageAttached = await attachProductImage(product.id, user.id, parsed.data.name, productImage);
    if (!imageAttached) {
      await deleteProduct(product.id);
      redirect("/submit?error=image-upload");
    }
  }

  await attachTags(product.id, parsed.data.tags);

  revalidatePath("/admin/products");
  redirect("/submit?submitted=1");
}

function getProductImage(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  if (value.size > maxProductImageSize || !productImageExtensions[value.type]) {
    return false;
  }

  return value;
}

function getText(formData: FormData, key: string) {
  return formData.get(key)?.toString().trim() ?? "";
}

function splitTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12);
}

async function attachTags(productId: string, tags: string[]) {
  if (!tags.length || !hasSupabaseAdminEnv()) {
    return;
  }

  const admin = createSupabaseAdminClient();

  for (const tag of tags) {
    const { data: tagRow, error } = await admin
      .from("tags")
      .upsert({ name: tag, slug: createTagSlug(tag) }, { onConflict: "name" })
      .select("id")
      .single();

    if (error || !tagRow) {
      continue;
    }

    await admin
      .from("product_tags")
      .upsert({ product_id: productId, tag_id: tagRow.id }, { onConflict: "product_id,tag_id" });
  }
}

async function attachProductImage(productId: string, makerId: string, productName: string, image: File) {
  const admin = createSupabaseAdminClient();
  const bucket = process.env.SUPABASE_STORAGE_PRODUCT_IMAGES_BUCKET ?? "product-images";
  const path = `${makerId}/${productId}/${crypto.randomUUID()}.${productImageExtensions[image.type]}`;
  const { error: uploadError } = await admin.storage.from(bucket).upload(path, image, {
    contentType: image.type,
    upsert: false,
  });

  if (uploadError) {
    return false;
  }

  const { data } = admin.storage.from(bucket).getPublicUrl(path);
  const { error: imageError } = await admin.from("product_images").insert({
    product_id: productId,
    image_url: data.publicUrl,
    image_type: "thumbnail",
    alt_text: productName,
    sort_order: 0,
  });

  if (imageError) {
    await admin.storage.from(bucket).remove([path]);
    return false;
  }

  return true;
}

async function deleteProduct(productId: string) {
  if (hasSupabaseAdminEnv()) {
    await createSupabaseAdminClient().from("products").delete().eq("id", productId);
  }
}

function createTagSlug(tag: string) {
  const slug = tag
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9가-힣_-]/g, "")
    .slice(0, 60);

  return slug || `tag-${crypto.randomUUID()}`;
}
