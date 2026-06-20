# ITNA V1 QA Checklist

## Design

- `DESIGN.md` tokens are used for colors, type, spacing, radius, and component styles.
- The home first viewport exposes product search immediately.
- Desktop and mobile layouts have no text overflow, overlapping elements, or broken tap targets.
- CTA buttons are pill-shaped and icon buttons are circular.
- No arbitrary gradients, decorative blobs, non-token colors, or off-system shadows were added.

## Auth And Roles

- Anonymous users can read only approved, non-deleted products.
- Members can register products, comment, recommend, report, and subscribe to search alerts.
- Product owners can edit only their own draft, pending, or rejected products.
- Approved product edits go through review instead of silently changing public content.
- Admin pages and actions reject non-admin users.

## Product Flow

- Product submission validates required fields and product-type URL rules.
- URL validation catches invalid, unreachable, duplicate, and unsupported platform URLs.
- Admin can approve, reject with reason, hide, and restore products.
- Approved products appear in lists, search results, and detail pages.
- Product images upload, render, and keep stable dimensions on mobile and desktop.

## Search And Logs

- Keyword search works when embeddings are unavailable.
- Hybrid search returns relevant results for natural-language Korean queries.
- Search logs store query, normalized query, result count, zero-result status, filters, and response time.
- Search result clicks store product and rank.
- Product detail views and outbound link clicks are logged.
- Zero-result screens offer search-alert subscription.

## Community Actions

- Recommendation can be toggled and cannot be duplicated by the same user.
- Comments appear immediately and can be edited/deleted by their author.
- Product owners can reply to comments.
- Reports can be created for products, comments, and users.
- Admin can hide reported products/comments and mark reports resolved or rejected.

## Seed And Admin Ops

- CSV seed import accepts valid rows and reports invalid rows clearly.
- Seed import can create approved products with categories and tags.
- Search-alert subscriptions can be exported as CSV by admin.
- Categories and tags can be created, edited, hidden, and reused.

## Release

- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm run test` passes when tests exist.
- `npm run build` passes.
- Required Vercel environment variables are configured.
- Supabase Auth redirect URLs include local, preview, and production URLs.
- Supabase Storage bucket and RLS policies are configured.
