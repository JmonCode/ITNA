import Link from "next/link";
import { ArrowLeft, Bell } from "lucide-react";

import { createSearchAlertAction } from "@/app/alerts/new/actions";
import { MarqueeStrip } from "@/components/marquee-strip";
import { SiteHeader } from "@/components/site-header";

type NewAlertPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const errorMessages: Record<string, string> = {
  "supabase-env": "Supabase 환경변수가 아직 설정되지 않았습니다.",
  validation: "검색어와 이메일 형식을 확인해주세요.",
  "email-required": "비로그인 상태에서는 알림을 받을 이메일이 필요합니다.",
  insert: "알림 신청을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.",
};

export default async function NewAlertPage({ searchParams }: NewAlertPageProps) {
  const params = await searchParams;
  const query = getSingleParam(params.q) ?? "";
  const saved = getSingleParam(params.saved) === "1";
  const error = getSingleParam(params.error);

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />
      <MarqueeStrip />

      <section className="container-page grid gap-8 py-10 md:grid-cols-[0.9fr_1.1fr] md:py-16">
        <div className="space-y-6">
          <Link className="inline-flex items-center gap-2 text-body-sm" href="/products">
            <ArrowLeft size={18} strokeWidth={1.8} />
            제품 탐색으로
          </Link>
          <div className="space-y-4">
            <p className="text-eyebrow">Search Alert</p>
            <h1 className="text-display-lg">검색 알림 신청</h1>
            <p className="max-w-xl text-body">
              V1에서는 자동 발송 대신 신청 내역을 저장하고, 관리자가 CSV로 내려받아 수요를 확인합니다.
            </p>
          </div>
        </div>

        <form action={createSearchAlertAction} className="operational-card space-y-5 p-5 md:p-6">
          {saved ? (
            <div className="rounded-[var(--radius-md)] bg-block-mint px-4 py-3 text-body-sm">
              검색 알림 신청을 저장했습니다.
            </div>
          ) : null}
          {error ? (
            <div className="rounded-[var(--radius-md)] bg-block-pink px-4 py-3 text-body-sm">
              {errorMessages[error] ?? "알림 신청 중 문제가 발생했습니다."}
            </div>
          ) : null}

          <label className="block space-y-2">
            <span className="text-caption">Query</span>
            <input className="text-input w-full" name="query" defaultValue={query} required />
          </label>
          <label className="block space-y-2">
            <span className="text-caption">Email</span>
            <input className="text-input w-full" name="email" type="email" placeholder="you@example.com" />
          </label>
          <button className="btn-primary w-full" type="submit">
            <Bell size={18} strokeWidth={1.8} />
            알림 신청 저장
          </button>
        </form>
      </section>
    </main>
  );
}

function getSingleParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value?.trim() || undefined;
}
