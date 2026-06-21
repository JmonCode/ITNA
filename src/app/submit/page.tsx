import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { redirect } from "next/navigation";

import { submitProductAction } from "@/app/submit/actions";
import { MarqueeStrip } from "@/components/marquee-strip";
import { SiteHeader } from "@/components/site-header";
import { hasPublicSupabaseEnv } from "@/lib/env.client";
import { getProductCategoryOptions } from "@/lib/products/categories";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SubmitPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const errorMessages: Record<string, string> = {
  "supabase-env": "Supabase 환경변수가 아직 설정되지 않았습니다.",
  validation: "필수 입력값과 URL 형식을 확인해주세요.",
  insert: "제품을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.",
};

export default async function SubmitPage({ searchParams }: SubmitPageProps) {
  const params = await searchParams;
  const submitted = getSingleParam(params.submitted) === "1";
  const error = getSingleParam(params.error);

  if (!hasPublicSupabaseEnv()) {
    return <SubmitSetupNotice error={error} />;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/submit");
  }

  const categories = await getProductCategoryOptions();

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />
      <MarqueeStrip />

      <section className="container-page space-y-8 py-10 md:py-14">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="space-y-4">
            <Link className="inline-flex items-center gap-2 text-body-sm" href="/products">
              <ArrowLeft size={18} strokeWidth={1.8} />
              제품 탐색으로
            </Link>
            <div>
              <p className="text-eyebrow">Submit Product</p>
              <h1 className="text-display-lg mt-1">제품 등록</h1>
            </div>
          </div>
          <p className="max-w-xl text-body-sm opacity-70">
            등록한 제품은 먼저 pending 상태로 저장되고, 슈퍼어드민 승인 후 공개 목록에 노출됩니다.
          </p>
        </div>

        {submitted ? (
          <div className="rounded-[var(--radius-md)] bg-block-mint px-5 py-4 text-body-sm">
            제품 등록 요청을 받았습니다. 승인 관리에서 검토 후 공개됩니다.
          </div>
        ) : null}

        {error ? (
          <div className="rounded-[var(--radius-md)] bg-block-pink px-5 py-4 text-body-sm">
            {errorMessages[error] ?? "제품 등록 중 문제가 발생했습니다."}
          </div>
        ) : null}

        <form action={submitProductAction} className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="operational-card space-y-5 p-5">
            <Field label="제품명">
              <input className="text-input w-full" name="name" minLength={2} maxLength={80} required />
            </Field>
            <Field label="한 줄 소개">
              <input
                className="text-input w-full"
                name="shortDescription"
                minLength={8}
                maxLength={140}
                required
              />
            </Field>
            <Field label="상세 설명">
              <textarea className="text-input min-h-36 w-full" name="description" minLength={40} maxLength={5000} required />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="해결하는 문제">
                <textarea className="text-input min-h-28 w-full" name="problemSolved" minLength={10} maxLength={1000} required />
              </Field>
              <Field label="대상 사용자">
                <textarea className="text-input min-h-28 w-full" name="targetUsers" minLength={10} maxLength={1000} required />
              </Field>
            </div>
            <Field label="주요 기능">
              <textarea className="text-input min-h-28 w-full" name="mainFeatures" minLength={10} maxLength={2000} required />
            </Field>
          </div>

          <aside className="operational-card space-y-5 p-5">
            <Field label="카테고리">
              <select className="text-input w-full" name="categoryId" required disabled={!categories.length}>
                <option value="">선택</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="제품 유형">
              <select className="text-input w-full" name="productType" defaultValue="web" required>
                <option value="web">웹</option>
                <option value="app">앱</option>
                <option value="web_app">웹+앱</option>
              </select>
            </Field>
            <Field label="가격">
              <select className="text-input w-full" name="pricingType" defaultValue="free" required>
                <option value="free">무료</option>
                <option value="paid">유료</option>
                <option value="freemium">프리미엄</option>
                <option value="subscription">구독</option>
              </select>
            </Field>
            <Field label="출시 상태">
              <select className="text-input w-full" name="launchStatus" defaultValue="beta" required>
                <option value="developing">개발 중</option>
                <option value="beta">베타</option>
                <option value="launched">출시됨</option>
              </select>
            </Field>
            <Field label="웹사이트 URL">
              <input className="text-input w-full" name="websiteUrl" type="url" placeholder="https://example.com" />
            </Field>
            <Field label="Android URL">
              <input className="text-input w-full" name="androidUrl" type="url" />
            </Field>
            <Field label="iOS URL">
              <input className="text-input w-full" name="iosUrl" type="url" />
            </Field>
            <Field label="태그">
              <input className="text-input w-full" name="tags" placeholder="AI, 생산성, 협업" />
            </Field>
            <div className="grid gap-3 text-body-sm">
              <label className="flex items-center gap-2">
                <input name="isAiBuilt" type="checkbox" />
                AI로 제작된 제품
              </label>
              <label className="flex items-center gap-2">
                <input name="hasAiFeature" type="checkbox" />
                AI 기능 포함
              </label>
            </div>
            <Field label="AI 도구/기능">
              <input className="text-input w-full" name="aiToolsUsed" />
            </Field>
            <Field label="제작자명">
              <input className="text-input w-full" name="makerName" maxLength={80} />
            </Field>
            <Field label="연락 이메일">
              <input className="text-input w-full" name="contactEmail" type="email" />
            </Field>
            <button className="btn-primary w-full" type="submit" disabled={!categories.length}>
              <Send size={18} strokeWidth={1.8} />
              승인 요청
            </button>
          </aside>
        </form>
      </section>
    </main>
  );
}

function SubmitSetupNotice({ error }: { error?: string }) {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />
      <MarqueeStrip />
      <section className="container-page py-10 md:py-16">
        <div className="color-block bg-block-cream space-y-4">
          <p className="text-eyebrow">Submit Product</p>
          <h1 className="text-display-lg">Supabase 설정이 필요합니다.</h1>
          <p className="max-w-2xl text-body">
            제품 등록은 Supabase Auth와 Postgres 연결 후 사용할 수 있습니다.
          </p>
          {error ? <p className="text-body-sm">{errorMessages[error]}</p> : null}
        </div>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-caption">{label}</span>
      {children}
    </label>
  );
}

function getSingleParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value?.trim() || undefined;
}
