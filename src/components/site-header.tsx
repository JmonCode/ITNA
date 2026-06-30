import Link from "next/link";
import { LogIn, LogOut, Plus, ShieldCheck } from "lucide-react";

import { signOutAction } from "@/app/login/actions";
import { getCurrentSuperAdminState } from "@/lib/auth/super-admin";

export async function SiteHeader() {
  const { isAuthenticated, isSuperAdmin, profile, user } = await getCurrentSuperAdminState();
  const displayName = user?.email ?? profile?.nickname ?? "사용자";

  return (
    <header className="top-nav sticky top-4 z-20">
      <div className="container-page top-nav-shell flex items-center justify-between gap-4">
        <Link href="/" className="brand-badge text-headline leading-none" aria-label="ITNA 홈">
          ITNA
        </Link>
        <nav className="nav-bubble hidden items-center gap-2 text-body-sm md:flex">
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
            <>
              <Link className="transition-opacity hover:opacity-60" href="/admin/products">
                승인 관리
              </Link>
              <Link className="transition-opacity hover:opacity-60" href="/admin/reports">
                신고 관리
              </Link>
            </>
          ) : null}
        </nav>
        <div className="hidden items-center gap-2 sm:flex">
          {isAuthenticated ? (
            <>
              <span className="max-w-44 truncate text-caption normal-case" title={displayName}>
                {displayName}
              </span>
              <form action={signOutAction}>
                <input type="hidden" name="next" value="/" />
                <button className="btn-icon" type="submit" aria-label="로그아웃" title="로그아웃">
                  <LogOut size={18} strokeWidth={1.8} />
                </button>
              </form>
            </>
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
          {isAuthenticated ? (
            <form action={signOutAction}>
              <input type="hidden" name="next" value="/" />
              <button className="btn-icon" type="submit" aria-label="로그아웃" title="로그아웃">
                <LogOut size={20} strokeWidth={1.8} />
              </button>
            </form>
          ) : (
            <Link className="btn-icon" href="/login" aria-label="로그인">
              <LogIn size={20} strokeWidth={1.8} />
            </Link>
          )}
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
