import { z } from "zod";

export const productTypeSchema = z.enum(["web", "app", "web_app"]);
export const pricingTypeSchema = z.enum(["free", "paid", "freemium", "subscription"]);
export const launchStatusSchema = z.enum(["developing", "beta", "launched"]);

const optionalUrlSchema = z
  .string()
  .trim()
  .url()
  .optional()
  .or(z.literal("").transform(() => undefined));

export const productSubmissionSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    shortDescription: z.string().trim().min(8).max(140),
    description: z.string().trim().min(40).max(5000),
    productType: productTypeSchema,
    websiteUrl: optionalUrlSchema,
    androidUrl: optionalUrlSchema,
    iosUrl: optionalUrlSchema,
    categoryId: z.string().uuid(),
    targetUsers: z.string().trim().min(10).max(1000),
    problemSolved: z.string().trim().min(10).max(1000),
    mainFeatures: z.string().trim().min(10).max(2000),
    pricingType: pricingTypeSchema.default("free"),
    launchStatus: launchStatusSchema.default("beta"),
    isAiBuilt: z.boolean().default(false),
    hasAiFeature: z.boolean().default(false),
    aiToolsUsed: z.string().trim().max(1000).optional(),
    makerName: z.string().trim().max(80).optional(),
    contactEmail: z.string().trim().email().optional(),
    tags: z.array(z.string().trim().min(1).max(30)).max(12).default([]),
  })
  .superRefine((value, context) => {
    if ((value.productType === "web" || value.productType === "web_app") && !value.websiteUrl) {
      context.addIssue({
        code: "custom",
        path: ["websiteUrl"],
        message: "웹 또는 웹+앱 제품은 웹사이트 URL이 필요합니다.",
      });
    }

    if (value.productType === "app" && !value.androidUrl && !value.iosUrl) {
      context.addIssue({
        code: "custom",
        path: ["androidUrl"],
        message: "앱 제품은 Android 또는 iOS 링크 중 하나가 필요합니다.",
      });
    }
  });

export type ProductSubmissionInput = z.infer<typeof productSubmissionSchema>;
