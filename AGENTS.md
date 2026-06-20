# AGENTS.md

## Project

ITNA is a Korean responsive web app for discovering useful web/app products through natural-language search.

V1 scope:
- Korean UI only.
- Responsive web app only. Do not build mobile apps or PWA unless requested.
- Product registration, admin approval, listings, detail pages, hybrid search, recommendations, comments, reports, search alerts, CSV seed import/export.
- Search-alert email automation is out of V1. V1 stores subscriptions and supports admin CSV export.

## Required Stack

Use:
- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui-compatible primitives
- Supabase Cloud: Auth, Postgres, Storage, RLS
- OpenAI embeddings + Supabase pgvector
- Vercel deployment

Follow official patterns:
- Use App Router conventions for routes, layouts, server components, route handlers, and server actions.
- Use `@supabase/ssr` for Supabase clients in Next.js SSR.
- Store embeddings in Postgres with pgvector.
- Keep secrets in environment variables only.

## Design Rules

`DESIGN.md` is the highest-priority design source. Read it before any UI work.

Follow it strictly:
- Use its color, typography, spacing, radius, and component tokens.
- Keep the visual language: black-and-white editorial frame plus pastel color-block sections.
- Use pill CTAs and circular icon buttons.
- Use `figmaSans`/`figmaMono` fallbacks as defined in `DESIGN.md`.
- Do not add arbitrary colors, gradients, decorative blobs, non-token shadows, or off-system radius.
- Do not make marketing-only pages. The first screen must expose the product search experience.
- For admin and dashboard screens, prioritize dense, scannable operational UI while preserving the design tokens.

## Product Behavior

Core user flow:
1. Maker submits a product.
2. System validates required fields and URLs.
3. Admin approves or rejects.
4. Approved products appear publicly.
5. Users search with natural language.
6. Users inspect detail pages, click outbound links, recommend, comment, report, or subscribe to search alerts.

Search:
- Use hybrid search: semantic similarity + keyword matching + engagement + freshness.
- Use OpenAI `text-embedding-3-small` unless explicitly changed.
- Store product embeddings as `vector(1536)`.
- Build `search_text` from product name, short description, description, problem solved, target users, main features, category, tags, and AI-related fields.
- Always log searches, result counts, clicks, zero-result searches, and outbound product clicks.

## Supabase And Security

- Enable RLS for user-facing tables.
- Public users may read only approved, non-deleted products.
- Logged-in users may create products, comments, recommendations, reports, and search alerts.
- Product owners may edit their own draft/pending/rejected products.
- Approved product edits should go through a review flow rather than silently changing public content.
- Admin-only actions must check `profiles.role = 'admin'`.
- Never expose service-role keys in client code.
- Never commit `.env`, Supabase keys, OpenAI keys, OAuth secrets, or generated credential files.

## Engineering Rules

- Prefer server components for read-heavy pages.
- Use client components only for interactive UI.
- Keep feature logic close to the route or feature it serves.
- Use typed validation for all form/server-action inputs.
- Keep database schema changes in Supabase migration files.
- Do not bypass URL validation for product submissions.
- Do not add new production dependencies unless they clearly reduce implementation risk or complexity.

## Verification

Before finishing implementation work, run the relevant checks:
- `npm run lint`
- `npm run typecheck`
- `npm run test` when tests exist or behavior changed
- `npm run build` before deployment-related work

For UI changes:
- Verify desktop and mobile layouts.
- Check for text overflow, overlapping elements, broken tap targets, and design-token drift.
- Confirm pages still follow `DESIGN.md`.

For database/auth changes:
- Verify RLS behavior for anonymous, member, product owner, and admin roles.
- Verify admin-only paths cannot be reached by normal users.

## When Unsure

- Preserve V1 scope over adding extra features.
- Prefer product-search quality over decorative UI.
- Prefer explicit, testable behavior over clever abstractions.
- If a rule conflicts with `DESIGN.md`, follow `DESIGN.md` for UI decisions.
