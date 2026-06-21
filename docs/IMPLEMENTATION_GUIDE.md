# ITNA Implementation Guide

## Order Of Work

1. Keep `AGENTS.md`, `DESIGN.md`, `.env.example`, and this guide current.
2. Put important deferred setup or launch blockers in `docs/LATER_NOTES.md`.
3. Build UI foundations from `DESIGN.md` before feature UI.
4. Apply Supabase migrations before implementing server actions.
5. Implement product registration and admin approval before public search.
6. Implement search logging before tuning ranking.
7. Run QA with `docs/QA_CHECKLIST.md` before deployment.

## App Structure

- `src/app`: App Router routes, layouts, route handlers, and server actions colocated with routes.
- `src/lib`: reusable environment, Supabase, OpenAI, validation, and utility code.
- `src/lib/products`: product-specific validation and search text helpers.
- `supabase/migrations`: database schema, RLS, functions, indexes, and storage setup.
- `supabase/seed.sql`: baseline categories and development seed data.

## Supabase

- Use `@supabase/ssr` for browser, server, and middleware auth flows.
- Use service-role access only in server-only modules.
- Keep RLS enabled on user-facing tables.
- Treat admin access as `profiles.role = 'admin'`.
- Configure Google and Kakao OAuth in the Supabase dashboard.

## Search

- Store OpenAI `text-embedding-3-small` embeddings in `vector(1536)`.
- Generate product embeddings when products are created or revised.
- Use keyword fallback when embeddings are unavailable.
- Always record `search_logs`, `search_click_logs`, and `outbound_click_logs`.

## Design

- Use CSS variables and classes defined from `DESIGN.md`.
- Do not introduce non-token colors, gradients, or decorative backgrounds.
- Keep the first viewport focused on product search.
- Admin screens should be dense and operational, not marketing-like.
