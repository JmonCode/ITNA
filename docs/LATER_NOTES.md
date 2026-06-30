# ITNA Later Notes

이 문서는 구현 중 발견한 중요 설정, 운영 작업, 출시 전 확인 사항을 따로 모아두는 메모다.

## Required Before Real Admin Flow

- `SUPABASE_SECRET_KEY` 또는 legacy `SUPABASE_SERVICE_ROLE_KEY`가 필요하다. 슈퍼어드민 bootstrap, 관리자 전용 데이터 처리, 태그 upsert처럼 RLS를 우회해야 하는 서버 전용 작업에서만 사용한다.
- `ADMIN_EMAILS=smily094@gmail.com`을 `.env.local`과 Vercel 환경변수에 모두 설정한다.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`가 없으면 앱은 데모/설정 안내 상태로 동작한다. legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`도 fallback으로 지원한다.
- 실제 Supabase 프로젝트에 migration을 적용한 뒤 `smily094@gmail.com`으로 로그인해서 `profiles.role = 'admin'`이 생성/갱신되는지 확인한다.

## Supabase Dashboard Setup

- Email, Google, Kakao Auth provider를 Supabase dashboard에서 활성화한다.
- Auth redirect URL에 local, Vercel preview, production callback URL을 모두 등록한다.
- Email Magic Link template은 SSR용 confirmation route를 쓰도록 설정한다. 예: `<a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email">ITNA에 로그인</a>`.
- Storage bucket `product-images`가 public으로 생성되어 있는지 확인한다.
- RLS 정책은 anonymous, member, product owner, admin 역할별로 실제 계정으로 검증한다.

## Search And Launch Work

- `OPENAI_API_KEY`, `OPENAI_EMBEDDING_MODEL=text-embedding-3-small`을 설정해야 hybrid search embedding 생성이 가능하다.
- 승인 이전 제품은 embedding 없이도 승인 플로우가 동작해야 한다. 검색 구현 후 approved 제품 embedding backfill 작업을 추가한다.
- seed 제품 80~100개를 넣기 전에 CSV import 실패 row 리포트와 중복 URL 처리 정책을 확정한다.
