import Link from "next/link";
import {
  ArrowUpRight,
  Bell,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
} from "lucide-react";

import { MarqueeStrip } from "@/components/marquee-strip";
import { SiteHeader } from "@/components/site-header";

const featuredProducts = [
  {
    name: "루틴핏",
    category: "운동/건강",
    description: "혼자 운동하는 사람을 위한 루틴 생성과 기록 관리 앱",
    tags: ["루틴", "기록", "모바일"],
    accent: "bg-block-lime",
  },
  {
    name: "포트폴리오 리뷰어",
    category: "디자인",
    description: "디자이너 포트폴리오를 AI와 동료 피드백으로 점검하는 웹서비스",
    tags: ["피드백", "디자인", "AI 기능"],
    accent: "bg-block-lilac",
  },
  {
    name: "예약노트",
    category: "생활",
    description: "소상공인이 예약, 알림, 고객 메모를 한 번에 관리하는 도구",
    tags: ["예약", "고객관리", "웹앱"],
    accent: "bg-block-coral",
  },
];

const exampleQueries = [
  "운동 루틴을 자동으로 짜주는 앱",
  "디자이너 포트폴리오 피드백 서비스",
  "소상공인이 예약 관리하기 좋은 웹앱",
  "AI로 글쓰기 도와주는 도구",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />
      <MarqueeStrip />

      <section className="container-page grid gap-10 py-14 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-20">
        <div className="space-y-8">
          <p className="text-eyebrow">Product Discovery</p>
          <div className="space-y-6">
            <h1 className="text-display-xl max-w-4xl">
              <span className="block">필요한 웹/앱 제품을</span>
              <span className="block">문장으로 찾으세요.</span>
            </h1>
            <p className="text-body-lg max-w-2xl">
              정확한 제품명이나 키워드를 몰라도 괜찮습니다. 해결하고 싶은 문제를 입력하면
              ITNA가 등록된 제품 중 가장 가까운 도구를 찾아줍니다.
            </p>
          </div>

          <form className="operational-card flex flex-col gap-3 p-3 sm:flex-row" action="/products">
            <label className="sr-only" htmlFor="q">
              제품 검색
            </label>
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[var(--radius-md)] bg-surface-soft px-4">
              <Search size={22} strokeWidth={1.8} />
              <input
                id="q"
                name="q"
                className="min-h-14 min-w-0 flex-1 bg-transparent text-body outline-none placeholder:text-ink"
                placeholder="예: 혼자 공부할 때 집중력 관리해주는 앱"
              />
            </div>
            <button className="btn-primary" type="submit">
              검색
              <ArrowUpRight size={20} strokeWidth={1.8} />
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {exampleQueries.map((query) => (
              <Link
                key={query}
                className="rounded-[var(--radius-full)] border border-hairline px-4 py-2 text-body-sm"
                href={`/products?q=${encodeURIComponent(query)}`}
              >
                {query}
              </Link>
            ))}
          </div>
        </div>

        <div className="color-block bg-block-lime">
          <div className="space-y-8">
            <div className="flex items-center justify-between gap-4">
              <p className="text-eyebrow">V1 Signal</p>
              <span className="btn-icon bg-canvas">
                <Sparkles size={20} strokeWidth={1.8} />
              </span>
            </div>
            <p className="text-subhead">
              출시 전 80개 이상의 seed 제품을 확보하고, 검색 로그로 사용자가 실제로 찾는
              문제를 학습합니다.
            </p>
            <div className="grid gap-3 text-body-sm sm:grid-cols-3">
              <div className="template-card bg-canvas">
                <strong className="block text-headline">100+</strong>
                seed 목표
              </div>
              <div className="template-card bg-canvas">
                <strong className="block text-headline">13</strong>
                초기 카테고리
              </div>
              <div className="template-card bg-canvas">
                <strong className="block text-headline">Hybrid</strong>
                검색 방식
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="products" className="container-page space-y-8 py-10 md:py-16">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="space-y-3">
            <p className="text-eyebrow">Featured Products</p>
            <h2 className="text-display-lg">사람들이 찾을 만한 제품부터</h2>
          </div>
          <Link className="btn-secondary border border-hairline" href="/products">
            전체 보기
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {featuredProducts.map((product) => (
            <article key={product.name} className="operational-card overflow-hidden">
              <div className={`h-24 ${product.accent}`} />
              <div className="space-y-5 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-caption">{product.category}</p>
                    <h3 className="text-headline">{product.name}</h3>
                  </div>
                  <Link
                    className="btn-icon"
                    href={`/products/${encodeURIComponent(product.name)}`}
                    aria-label={`${product.name} 보기`}
                  >
                    <ArrowUpRight size={20} strokeWidth={1.8} />
                  </Link>
                </div>
                <p className="text-body-sm">{product.description}</p>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-[var(--radius-full)] bg-surface-soft px-3 py-1 text-caption"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="makers" className="container-page py-10 md:py-16">
        <div className="color-block bg-block-navy text-inverse-ink">
          <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-center">
            <div className="max-w-xl space-y-4">
              <p className="text-eyebrow">For Makers</p>
              <h2 className="text-subhead">
                제품을 등록하고 초기 사용자를 만나세요.
              </h2>
            </div>
            <div className="grid gap-4 text-body-sm sm:grid-cols-3">
              <div className="inverse-tile">
                <ShieldCheck className="mb-8" size={28} strokeWidth={1.8} />
                URL 검증과 관리자 승인으로 품질을 관리합니다.
              </div>
              <div className="inverse-tile">
                <ThumbsUp className="mb-8" size={28} strokeWidth={1.8} />
                추천과 댓글로 초기 반응을 확인합니다.
              </div>
              <div className="inverse-tile">
                <Bell className="mb-8" size={28} strokeWidth={1.8} />
                검색어 알림 구독으로 대기 수요를 모읍니다.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="ops" className="container-page grid gap-4 py-10 md:grid-cols-3 md:py-16">
        <div className="template-card">
          <Search className="mb-10" size={28} strokeWidth={1.8} />
          <h3 className="text-headline">검색 로그 우선</h3>
          <p className="mt-3 text-body-sm">
            zero-result, 클릭 순위, 외부 링크 클릭을 저장해 seed 보강 방향을 정합니다.
          </p>
        </div>
        <div className="template-card">
          <MessageCircle className="mb-10" size={28} strokeWidth={1.8} />
          <h3 className="text-headline">댓글은 즉시 노출</h3>
          <p className="mt-3 text-body-sm">
            사용자 반응을 빠르게 만들고 신고/관리자 숨김으로 운영 리스크를 관리합니다.
          </p>
        </div>
        <div className="template-card">
          <ShieldCheck className="mb-10" size={28} strokeWidth={1.8} />
          <h3 className="text-headline">RLS 기반 운영</h3>
          <p className="mt-3 text-body-sm">
            공개 데이터와 관리자 액션을 Supabase 정책으로 분리합니다.
          </p>
        </div>
      </section>
    </main>
  );
}
