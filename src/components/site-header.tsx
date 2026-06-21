import Link from "next/link";
import { Plus, ShieldCheck } from "lucide-react";

import { getCurrentSuperAdminState } from "@/lib/auth/super-admin";

export async function SiteHeader() {
  const { isAuthenticated, isSuperAdmin, user } = await getCurrentSuperAdminState();

  return (
    <header className="top-nav sticky top-0 z-20">
      <div className="container-page flex h-full items-center justify-between gap-6">
        <Link href="/" className="text-headline leading-none tracking-tight" aria-label="ITNA 홈">
          ITNA
        </Link>
        <nav className="hidden items-center gap-6 text-body-sm md:flex">
          <Link className="transition-opacity hover:opacity-60" href="/products">
            제품 탐색
          </Link>
          <Link className="transition-opacity hover:opacity-60" href="/#makers">
            제작자 등록
          </Link>
          <Link className="transition-opacity hover:opacity-60" href="/#ops">
            운영 기준
          </Link>
          {isSuperAdmin ? (
            <Link className="transition-opacity hover:opacity-60" href="/admin/products">
              승인 관리
            </Link>
          ) : null}
        </nav>
        <div className="hidden items-center gap-2 sm:flex">
          {isAuthenticated ? (
            <span className="max-w-44 truncate text-caption normal-case" title={user?.email ?? undefined}>
              {user?.email}
            </span>
          ) : (
            <Link className="btn-secondary border border-hairline" href="/login">
              로그인
            </Link>
          )}
          <Link className="btn-primary" href="/submit">
            제품 등록
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:hidden">
          {isSuperAdmin ? (
            <Link className="btn-icon" href="/admin/products" aria-label="승인 관리">
              <ShieldCheck size={20} strokeWidth={1.8} />
            </Link>
          ) : null}
          <Link className="btn-icon" href="/submit" aria-label="제품 등록">
            <Plus size={20} strokeWidth={1.8} />
          </Link>
        </div>
      </div>
    </header>
  );
}
