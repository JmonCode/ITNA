# ITNA

ITNA is a Korean responsive web app for discovering useful web/app products through natural-language search.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS with tokens from `DESIGN.md`
- Supabase Auth, Postgres, Storage, RLS
- OpenAI embeddings + Supabase pgvector
- Vercel deployment

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Required Environment

Set these values in `.env.local` for local work and in Vercel for deployment:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `OPENAI_EMBEDDING_MODEL`
- `ADMIN_EMAILS`

OAuth provider secrets for Google and Kakao are configured in the Supabase dashboard.

## Commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Project Rules

- Read `AGENTS.md` before implementation work.
- Read `DESIGN.md` before UI work.
- Keep important deferred setup and launch notes in `docs/LATER_NOTES.md`.
- Keep Supabase schema changes in `supabase/migrations`.
- Never commit `.env.local` or provider secrets.
