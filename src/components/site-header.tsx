import Link from "next/link";
import { Plus } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="top-nav sticky top-0 z-20">
      <div className="container-page flex h-full items-center justify-between gap-6">
        <Link href="/" className="text-headline leading-none" aria-label="ITNA 홈">
          ITNA
        </Link>
        <nav className="hidden items-center gap-6 text-body-sm md:flex">
          <Link href="/products">제품 탐색</Link>
          <Link href="/#makers">제작자 등록</Link>
          <Link href="/#ops">운영 기준</Link>
        </nav>
        <div className="hidden items-center gap-2 sm:flex">
          <Link className="btn-secondary" href="/login">
            로그인
          </Link>
          <Link className="btn-primary" href="/submit">
            제품 등록
          </Link>
        </div>
        <Link className="btn-icon sm:hidden" href="/submit" aria-label="제품 등록">
          <Plus size={20} strokeWidth={1.8} />
        </Link>
      </div>
    </header>
  );
}
