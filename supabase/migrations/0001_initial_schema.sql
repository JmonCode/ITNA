create extension if not exists pgcrypto;
create extension if not exists citext;
create extension if not exists pg_trgm;
create extension if not exists vector;

create type public.app_role as enum ('user', 'maker', 'admin');
create type public.product_type as enum ('web', 'app', 'web_app');
create type public.pricing_type as enum ('free', 'paid', 'freemium', 'subscription');
create type public.product_status as enum ('draft', 'pending', 'approved', 'rejected', 'hidden');
create type public.launch_status as enum ('developing', 'beta', 'launched');
create type public.image_type as enum ('thumbnail', 'screenshot');
create type public.comment_status as enum ('visible', 'hidden', 'deleted');
create type public.report_target_type as enum ('product', 'comment', 'user');
create type public.report_reason as enum (
  'spam',
  'false_information',
  'inappropriate_image',
  'abusive_comment',
  'duplicate_product',
  'broken_link',
  'other'
);
create type public.report_status as enum ('pending', 'resolved', 'rejected');
create type public.search_type as enum ('keyword', 'semantic', 'hybrid');
create type public.revision_status as enum ('pending', 'approved', 'rejected');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext not null unique,
  nickname text,
  profile_image text,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_description text not null,
  description text not null,
  product_type public.product_type not null,
  website_url text,
  android_url text,
  ios_url text,
  category_id uuid references public.categories(id),
  target_users text not null,
  problem_solved text not null,
  main_features text not null,
  search_text text not null default '',
  embedding_vector vector(1536),
  pricing_type public.pricing_type not null default 'free',
  status public.product_status not null default 'pending',
  launch_status public.launch_status not null default 'beta',
  is_ai_built boolean not null default false,
  has_ai_feature boolean not null default false,
  ai_tools_used text,
  maker_id uuid not null references public.profiles(id),
  maker_name text,
  contact_email citext,
  admin_featured boolean not null default false,
  view_count integer not null default 0 check (view_count >= 0),
  recommendation_count integer not null default 0 check (recommendation_count >= 0),
  comment_count integer not null default 0 check (comment_count >= 0),
  approved_at timestamptz,
  rejected_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint products_web_url_required check (
    (product_type <> 'web' and product_type <> 'web_app') or website_url is not null
  ),
  constraint products_app_url_required check (
    product_type <> 'app' or android_url is not null or ios_url is not null
  )
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  image_type public.image_type not null default 'screenshot',
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.product_tags (
  product_id uuid not null references public.products(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, tag_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_comment_id uuid references public.comments(id) on delete cascade,
  content text not null,
  status public.comment_status not null default 'visible',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.recommendations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index recommendations_product_user_active_idx
on public.recommendations(product_id, user_id)
where deleted_at is null;

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  target_type public.report_target_type not null,
  target_id uuid not null,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason public.report_reason not null,
  description text,
  status public.report_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.search_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  anonymous_id text,
  query text not null,
  normalized_query text not null,
  query_embedding_vector vector(1536),
  result_count integer not null default 0,
  clicked_product_id uuid references public.products(id) on delete set null,
  clicked_rank integer,
  response_time_ms integer,
  search_type public.search_type not null default 'hybrid',
  filters jsonb not null default '{}'::jsonb,
  sort_option text,
  is_zero_result boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.search_click_logs (
  id uuid primary key default gen_random_uuid(),
  search_log_id uuid references public.search_logs(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  rank_position integer not null,
  clicked_at timestamptz not null default now()
);

create table public.search_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  email citext,
  query text not null,
  query_embedding_vector vector(1536),
  category_id uuid references public.categories(id) on delete set null,
  is_active boolean not null default true,
  last_notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint search_alerts_user_or_email check (user_id is not null or email is not null)
);

create table public.product_view_logs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  anonymous_id text,
  ip_hash text,
  user_agent_hash text,
  viewed_at timestamptz not null default now()
);

create table public.outbound_click_logs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  anonymous_id text,
  destination text not null,
  clicked_at timestamptz not null default now()
);

create table public.seed_import_jobs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id),
  filename text not null,
  total_rows integer not null default 0,
  success_rows integer not null default 0,
  failed_rows integer not null default 0,
  error_report jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table public.product_revisions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  payload jsonb not null,
  status public.revision_status not null default 'pending',
  reviewed_by uuid references public.profiles(id),
  review_reason text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index products_status_created_idx on public.products(status, created_at desc);
create index products_category_idx on public.products(category_id);
create index products_maker_idx on public.products(maker_id);
create index products_search_text_trgm_idx on public.products using gin (search_text gin_trgm_ops);
create index products_embedding_hnsw_idx on public.products using hnsw (embedding_vector vector_cosine_ops);
create index comments_product_idx on public.comments(product_id, created_at desc);
create index search_logs_created_idx on public.search_logs(created_at desc);
create index search_alerts_active_idx on public.search_alerts(is_active, created_at desc);
create index product_view_logs_product_viewed_idx on public.product_view_logs(product_id, viewed_at desc);
create index outbound_click_logs_product_clicked_idx on public.outbound_click_logs(product_id, clicked_at desc);

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger categories_updated_at before update on public.categories
for each row execute function public.set_updated_at();
create trigger tags_updated_at before update on public.tags
for each row execute function public.set_updated_at();
create trigger products_updated_at before update on public.products
for each row execute function public.set_updated_at();
create trigger comments_updated_at before update on public.comments
for each row execute function public.set_updated_at();
create trigger reports_updated_at before update on public.reports
for each row execute function public.set_updated_at();
create trigger search_alerts_updated_at before update on public.search_alerts
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, nickname)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do update
  set email = excluded.email,
      updated_at = now();

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and deleted_at is null
  );
$$;

create or replace function public.product_is_public(product_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.products
    where id = product_id
      and status = 'approved'
      and deleted_at is null
  );
$$;

create or replace function public.product_is_owned_by_current_user(product_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.products
    where id = product_id
      and maker_id = auth.uid()
      and deleted_at is null
  );
$$;

create or replace function public.search_products_hybrid(
  query_text text,
  query_embedding vector(1536) default null,
  match_count integer default 20,
  category_filter uuid default null
)
returns table (
  id uuid,
  name text,
  short_description text,
  product_type public.product_type,
  category_id uuid,
  pricing_type public.pricing_type,
  launch_status public.launch_status,
  recommendation_count integer,
  comment_count integer,
  view_count integer,
  semantic_score double precision,
  keyword_score real,
  final_score double precision
)
language sql
stable
set search_path = public
as $$
  with scored as (
    select
      p.id,
      p.name,
      p.short_description,
      p.product_type,
      p.category_id,
      p.pricing_type,
      p.launch_status,
      p.recommendation_count,
      p.comment_count,
      p.view_count,
      case
        when query_embedding is null or p.embedding_vector is null then 0
        else greatest(0, 1 - (p.embedding_vector <=> query_embedding))
      end as semantic_score,
      greatest(
        similarity(p.name, query_text),
        similarity(p.short_description, query_text),
        similarity(p.search_text, query_text)
      ) as keyword_score,
      least(
        ((p.recommendation_count * 2.0) + (p.comment_count * 1.5) + (p.view_count * 0.1)) / 100.0,
        1
      ) as engagement_score,
      case
        when p.approved_at is null then 0
        else greatest(0, 1 - (extract(epoch from (now() - p.approved_at)) / 2592000.0))
      end as freshness_score,
      case when p.admin_featured then 1 else 0 end as featured_score
    from public.products p
    where p.status = 'approved'
      and p.deleted_at is null
      and (category_filter is null or p.category_id = category_filter)
  )
  select
    scored.id,
    scored.name,
    scored.short_description,
    scored.product_type,
    scored.category_id,
    scored.pricing_type,
    scored.launch_status,
    scored.recommendation_count,
    scored.comment_count,
    scored.view_count,
    scored.semantic_score,
    scored.keyword_score,
    (
      scored.semantic_score * 0.50
      + scored.keyword_score * 0.25
      + scored.engagement_score * 0.15
      + greatest(scored.freshness_score, scored.featured_score) * 0.10
    ) as final_score
  from scored
  order by final_score desc, recommendation_count desc, name asc
  limit greatest(1, least(match_count, 50));
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_tags enable row level security;
alter table public.comments enable row level security;
alter table public.recommendations enable row level security;
alter table public.reports enable row level security;
alter table public.search_logs enable row level security;
alter table public.search_click_logs enable row level security;
alter table public.search_alerts enable row level security;
alter table public.product_view_logs enable row level security;
alter table public.outbound_click_logs enable row level security;
alter table public.seed_import_jobs enable row level security;
alter table public.product_revisions enable row level security;

create policy "profiles_select_own_or_admin" on public.profiles
for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own_or_admin" on public.profiles
for update using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

create policy "categories_public_read" on public.categories
for select using (is_active and deleted_at is null);
create policy "categories_admin_all" on public.categories
for all using (public.is_admin()) with check (public.is_admin());

create policy "tags_public_read" on public.tags
for select using (deleted_at is null);
create policy "tags_admin_all" on public.tags
for all using (public.is_admin()) with check (public.is_admin());

create policy "products_public_read_approved" on public.products
for select using (status = 'approved' and deleted_at is null);
create policy "products_owner_read" on public.products
for select using (maker_id = auth.uid() and deleted_at is null);
create policy "products_admin_all" on public.products
for all using (public.is_admin()) with check (public.is_admin());
create policy "products_member_insert" on public.products
for insert with check (maker_id = auth.uid());
create policy "products_owner_update_unapproved" on public.products
for update using (
  maker_id = auth.uid()
  and status in ('draft', 'pending', 'rejected')
  and deleted_at is null
) with check (
  maker_id = auth.uid()
  and status in ('draft', 'pending', 'rejected')
);

create policy "product_images_read_visible" on public.product_images
for select using (
  deleted_at is null
  and (public.product_is_public(product_id) or public.product_is_owned_by_current_user(product_id) or public.is_admin())
);
create policy "product_images_owner_or_admin_write" on public.product_images
for all using (public.product_is_owned_by_current_user(product_id) or public.is_admin())
with check (public.product_is_owned_by_current_user(product_id) or public.is_admin());

create policy "product_tags_read_visible" on public.product_tags
for select using (public.product_is_public(product_id) or public.product_is_owned_by_current_user(product_id) or public.is_admin());
create policy "product_tags_owner_or_admin_write" on public.product_tags
for all using (public.product_is_owned_by_current_user(product_id) or public.is_admin())
with check (public.product_is_owned_by_current_user(product_id) or public.is_admin());

create policy "comments_public_visible_read" on public.comments
for select using (
  deleted_at is null
  and status = 'visible'
  and public.product_is_public(product_id)
);
create policy "comments_owner_read" on public.comments
for select using (user_id = auth.uid() and deleted_at is null);
create policy "comments_admin_all" on public.comments
for all using (public.is_admin()) with check (public.is_admin());
create policy "comments_member_insert" on public.comments
for insert with check (
  user_id = auth.uid()
  and public.product_is_public(product_id)
);
create policy "comments_owner_update" on public.comments
for update using (user_id = auth.uid() and status = 'visible' and deleted_at is null)
with check (user_id = auth.uid());

create policy "recommendations_public_read" on public.recommendations
for select using (deleted_at is null and public.product_is_public(product_id));
create policy "recommendations_member_insert" on public.recommendations
for insert with check (user_id = auth.uid() and public.product_is_public(product_id));
create policy "recommendations_owner_delete" on public.recommendations
for delete using (user_id = auth.uid() or public.is_admin());

create policy "reports_member_insert" on public.reports
for insert with check (reporter_id = auth.uid());
create policy "reports_admin_all" on public.reports
for all using (public.is_admin()) with check (public.is_admin());

create policy "search_logs_insert_anyone" on public.search_logs
for insert with check (user_id is null or user_id = auth.uid());
create policy "search_logs_read_own_or_admin" on public.search_logs
for select using (user_id = auth.uid() or public.is_admin());

create policy "search_click_logs_insert_anyone" on public.search_click_logs
for insert with check (true);
create policy "search_click_logs_admin_read" on public.search_click_logs
for select using (public.is_admin());

create policy "search_alerts_insert_anyone" on public.search_alerts
for insert with check (user_id is null or user_id = auth.uid());
create policy "search_alerts_read_own_or_admin" on public.search_alerts
for select using (user_id = auth.uid() or public.is_admin());
create policy "search_alerts_update_own_or_admin" on public.search_alerts
for update using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "product_view_logs_insert_anyone" on public.product_view_logs
for insert with check (true);
create policy "product_view_logs_admin_read" on public.product_view_logs
for select using (public.is_admin());

create policy "outbound_click_logs_insert_anyone" on public.outbound_click_logs
for insert with check (true);
create policy "outbound_click_logs_admin_read" on public.outbound_click_logs
for select using (public.is_admin());

create policy "seed_import_jobs_admin_all" on public.seed_import_jobs
for all using (public.is_admin()) with check (public.is_admin());

create policy "product_revisions_owner_insert" on public.product_revisions
for insert with check (requester_id = auth.uid() and public.product_is_owned_by_current_user(product_id));
create policy "product_revisions_owner_read" on public.product_revisions
for select using (requester_id = auth.uid() or public.is_admin());
create policy "product_revisions_admin_update" on public.product_revisions
for update using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;
