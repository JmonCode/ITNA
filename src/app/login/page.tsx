import Link from "next/link";
import { ArrowLeft, KeyRound, Mail } from "lucide-react";
import { redirect } from "next/navigation";

import { signInWithEmail, signInWithOAuth } from "@/app/login/actions";
import { MarqueeStrip } from "@/components/marquee-strip";
import { SiteHeader } from "@/components/site-header";
import { ensureUserProfile } from "@/lib/auth/super-admin";
import { hasPublicSupabaseEnv } from "@/lib/env.client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const errorMessages: Record<string, string> = {
  "email-required": "이메일을 입력해주세요.",
  provider: "지원하지 않는 로그인 방식입니다.",
  "signin-failed": "로그인을 시작하지 못했습니다. 잠시 후 다시 시도해주세요.",
  callback: "인증 콜백을 처리하지 못했습니다. 다시 로그인해주세요.",
  cancelled: "로그인이 취소되었거나 인증 제공자에서 오류가 발생했습니다.",
  "supabase-env": "Supabase 환경변수가 아직 설정되지 않았습니다.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = sanitizeNextPath(getSingleParam(params.next));
  const error = getSingleParam(params.error);
  const sent = getSingleParam(params.sent) === "1";

  if (!hasPublicSupabaseEnv()) {
    return <LoginSetupNotice error={error} next={next} />;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await ensureUserProfile(user);
    redirect(next);
  }

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />
      <MarqueeStrip />

      <section className="container-page grid gap-8 py-10 md:grid-cols-[0.85fr_1.15fr] md:py-16">
        <div className="space-y-6">
          <Link className="inline-flex items-center gap-2 text-body-sm" href="/">
            <ArrowLeft size={18} strokeWidth={1.8} />
            홈으로
          </Link>
          <div className="space-y-4">
            <p className="text-eyebrow">Sign In</p>
            <h1 className="text-display-lg">ITNA에 로그인</h1>
            <p className="max-w-xl text-body">
              제품 등록, 승인 관리, 추천과 댓글 기능은 로그인 후 사용할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="operational-card space-y-5 p-5 md:p-6">
          {sent ? (
            <div className="rounded-[var(--radius-md)] bg-block-mint px-4 py-3 text-body-sm">
              로그인 링크를 이메일로 보냈습니다. 메일함에서 링크를 열면 계속 진행됩니다.
            </div>
          ) : null}

          {error ? (
            <div className="rounded-[var(--radius-md)] bg-block-pink px-4 py-3 text-body-sm">
              {errorMessages[error] ?? "로그인 중 문제가 발생했습니다."}
            </div>
          ) : null}

          <form action={signInWithEmail} className="space-y-3">
            <input type="hidden" name="next" value={next} />
            <label className="space-y-2 block">
              <span className="text-caption">Email</span>
              <input
                className="text-input w-full"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </label>
            <button className="btn-primary w-full" type="submit">
              <Mail size={18} strokeWidth={1.8} />
              이메일로 로그인
            </button>
          </form>

          <div className="grid gap-2 sm:grid-cols-2">
            <form action={signInWithOAuth}>
              <input type="hidden" name="provider" value="google" />
              <input type="hidden" name="next" value={next} />
              <button className="btn-secondary w-full border border-hairline" type="submit">
                <KeyRound size={18} strokeWidth={1.8} />
                Google
              </button>
            </form>
            <form action={signInWithOAuth}>
              <input type="hidden" name="provider" value="kakao" />
              <input type="hidden" name="next" value={next} />
              <button className="btn-secondary w-full border border-hairline" type="submit">
                <KeyRound size={18} strokeWidth={1.8} />
                Kakao
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

function LoginSetupNotice({ error, next }: { error?: string; next: string }) {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />
      <MarqueeStrip />

      <section className="container-page py-10 md:py-16">
        <div className="color-block bg-block-cream space-y-4">
          <p className="text-eyebrow">Sign In</p>
          <h1 className="text-display-lg">Supabase 설정이 필요합니다.</h1>
          <p className="max-w-2xl text-body">
            로그인은 Supabase Auth 환경변수와 인증 provider 설정 후 사용할 수 있습니다.
          </p>
          <p className="text-body-sm">
            필요한 값: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
          </p>
          {error ? <p className="text-body-sm">{errorMessages[error]}</p> : null}
          <Link className="btn-secondary border border-hairline" href={next}>
            돌아가기
          </Link>
        </div>
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

function sanitizeNextPath(next: string | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }

  return next;
}
