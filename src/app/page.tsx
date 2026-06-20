import Link from "next/link";
import {
  ArrowUpRight,
  Bell,
  Compass,
  FileSearch,
  Layers,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  TrendingUp,
  Zap,
} from "lucide-react";

import { MarqueeStrip } from "@/components/marquee-strip";
import { SiteHeader } from "@/components/site-header";

/* ── Static demo data ── */

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

const howItWorks = [
  {
    step: "01",
    icon: Search,
    title: "문장으로 검색",
    description: "필요한 기능이나 해결할 문제를 자연스러운 문장으로 입력하세요.",
    color: "bg-block-cream",
  },
  {
    step: "02",
    icon: Sparkles,
    title: "AI 매칭",
    description: "의미 기반 검색이 키워드가 아닌 문맥을 이해해 가장 적합한 제품을 찾습니다.",
    color: "bg-block-lilac",
  },
  {
    step: "03",
    icon: Compass,
    title: "발견과 비교",
    description: "상세 정보, 실사용자 댓글, 추천 수를 보고 나에게 맞는 제품을 선택하세요.",
    color: "bg-block-mint",
  },
];

/* ── Page ── */

export default function Home() {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />
      <MarqueeStrip />

      {/* ━━ Hero ━━ */}
      <section className="container-page grid gap-10 py-14 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-24">
        <div className="space-y-8 animate-in">
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
                className="min-h-14 min-w-0 flex-1 bg-transparent text-body outline-none placeholder:opacity-40"
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
                className="pill-tag"
                href={`/products?q=${encodeURIComponent(query)}`}
              >
                {query}
              </Link>
            ))}
          </div>
        </div>

        <div className="color-block bg-block-lime animate-in animate-in-delay-1">
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

      {/* ━━ How It Works — Cream color-block ━━ */}
      <section className="container-page py-10 md:py-16">
        <div className="color-block bg-block-cream">
          <div className="space-y-10">
            <div className="max-w-2xl space-y-4">
              <p className="text-eyebrow">How It Works</p>
              <h2 className="text-display-lg">
                세 단계로 제품을 발견하세요.
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {howItWorks.map((item) => (
                <div key={item.step} className="template-card bg-canvas space-y-5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-full)] text-caption font-bold ${item.color}`}
                    >
                      {item.step}
                    </span>
                    <item.icon size={24} strokeWidth={1.6} className="opacity-50" />
                  </div>
                  <h3 className="text-headline">{item.title}</h3>
                  <p className="text-body-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━ Featured Products ━━ */}
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
          {featuredProducts.map((product, i) => (
            <article
              key={product.name}
              className={`operational-card overflow-hidden animate-in animate-in-delay-${i + 1}`}
            >
              <div className={`h-28 ${product.accent}`} />
              <div className="space-y-5 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-caption">{product.category}</p>
                    <h3 className="text-headline mt-1">{product.name}</h3>
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

      {/* ━━ Makers — Navy color-block ━━ */}
      <section id="makers" className="container-page py-10 md:py-16">
        <div className="color-block bg-block-navy text-inverse-ink">
          <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-center">
            <div className="max-w-xl space-y-4">
              <p className="text-eyebrow">For Makers</p>
              <h2 className="text-display-lg">
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

      {/* ━━ Search Intelligence — Lilac color-block ━━ */}
      <section className="container-page py-10 md:py-16">
        <div className="color-block bg-block-lilac">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div className="space-y-4">
              <p className="text-eyebrow">Search Intelligence</p>
              <h2 className="text-display-lg">
                검색 데이터가 쌓일수록 더 정확해집니다.
              </h2>
              <p className="text-body-lg">
                모든 검색어와 클릭을 익명으로 기록합니다. zero-result 검색어는
                새로운 제품 소싱 신호가 되고, 클릭 패턴은 검색 랭킹을 개선합니다.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="template-card bg-canvas space-y-3">
                <TrendingUp size={24} strokeWidth={1.6} />
                <h3 className="text-headline">검색 랭킹</h3>
                <p className="text-body-sm">
                  클릭률·추천수·최신성을 결합한 하이브리드 점수로 정렬합니다.
                </p>
              </div>
              <div className="template-card bg-canvas space-y-3">
                <FileSearch size={24} strokeWidth={1.6} />
                <h3 className="text-headline">Zero-result 감지</h3>
                <p className="text-body-sm">
                  결과 없는 검색을 추적해 새로운 제품 기회를 발견합니다.
                </p>
              </div>
              <div className="template-card bg-canvas space-y-3">
                <Zap size={24} strokeWidth={1.6} />
                <h3 className="text-headline">의미 검색</h3>
                <p className="text-body-sm">
                  OpenAI 임베딩으로 키워드가 아닌 의미를 매칭합니다.
                </p>
              </div>
              <div className="template-card bg-canvas space-y-3">
                <Layers size={24} strokeWidth={1.6} />
                <h3 className="text-headline">CSV 내보내기</h3>
                <p className="text-body-sm">
                  관리자가 검색 로그와 제품 데이터를 CSV로 추출합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━ Ops Cards ━━ */}
      <section id="ops" className="container-page grid gap-4 py-10 md:grid-cols-3 md:py-16">
        <div className="template-card space-y-4">
          <Search className="mb-6" size={28} strokeWidth={1.8} />
          <h3 className="text-headline">검색 로그 우선</h3>
          <p className="text-body-sm">
            zero-result, 클릭 순위, 외부 링크 클릭을 저장해 seed 보강 방향을 정합니다.
          </p>
        </div>
        <div className="template-card space-y-4">
          <MessageCircle className="mb-6" size={28} strokeWidth={1.8} />
          <h3 className="text-headline">댓글은 즉시 노출</h3>
          <p className="text-body-sm">
            사용자 반응을 빠르게 만들고 신고/관리자 숨김으로 운영 리스크를 관리합니다.
          </p>
        </div>
        <div className="template-card space-y-4">
          <ShieldCheck className="mb-6" size={28} strokeWidth={1.8} />
          <h3 className="text-headline">RLS 기반 운영</h3>
          <p className="text-body-sm">
            공개 데이터와 관리자 액션을 Supabase 정책으로 분리합니다.
          </p>
        </div>
      </section>

      {/* ━━ CTA — Mint color-block ━━ */}
      <section className="container-page py-10 md:py-16">
        <div className="color-block bg-block-mint">
          <div className="mx-auto max-w-2xl space-y-8 text-center">
            <p className="text-eyebrow">Get Started</p>
            <h2 className="text-display-lg">
              당신의 제품을 필요한 사람에게 연결하세요.
            </h2>
            <p className="text-body-lg">
              ITNA에 제품을 등록하면 자연어 검색으로 잠재 사용자가 당신의 제품을
              발견할 수 있습니다. 관리자 승인 후 바로 노출됩니다.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link className="btn-primary" href="/submit">
                제품 등록하기
                <ArrowUpRight size={20} strokeWidth={1.8} />
              </Link>
              <Link className="btn-secondary border border-hairline" href="/products">
                제품 탐색하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ━━ Footer ━━ */}
      <footer className="border-t border-hairline-soft">
        <div className="container-page grid gap-8 py-16 text-body-sm md:grid-cols-4 md:py-20">
          <div className="space-y-3">
            <p className="text-headline leading-none">ITNA</p>
            <p className="text-body-sm opacity-60">
              필요한 웹/앱 제품을 문장으로 찾는 탐색 플랫폼
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-caption">Product</p>
            <nav className="flex flex-col gap-2">
              <Link href="/products" className="transition-opacity hover:opacity-60">제품 탐색</Link>
              <Link href="/submit" className="transition-opacity hover:opacity-60">제품 등록</Link>
            </nav>
          </div>
          <div className="space-y-3">
            <p className="text-caption">Resources</p>
            <nav className="flex flex-col gap-2">
              <Link href="/#ops" className="transition-opacity hover:opacity-60">운영 기준</Link>
              <Link href="/#makers" className="transition-opacity hover:opacity-60">제작자 가이드</Link>
            </nav>
          </div>
          <div className="space-y-3">
            <p className="text-caption">Legal</p>
            <nav className="flex flex-col gap-2">
              <span className="opacity-40">이용약관 (준비 중)</span>
              <span className="opacity-40">개인정보처리방침 (준비 중)</span>
            </nav>
          </div>
        </div>
        <div className="border-t border-hairline-soft">
          <div className="container-page flex items-center justify-between py-6 text-caption opacity-40">
            <span>© 2026 ITNA</span>
            <span>Seoul, Korea</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
