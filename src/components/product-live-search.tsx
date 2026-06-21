"use client";

import type { FormEvent } from "react";
import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight, Search, X } from "lucide-react";

type ProductSearchFilters = {
  query?: string;
  category?: string;
  productType?: string;
  pricing?: string;
};

export function ProductLiveSearch({ filters }: { filters: ProductSearchFilters }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(filters.query ?? "");
  const queryRef = useRef(query);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const routeQuery = filters.query ?? "";
    const urlQuery = searchParams.get("q") ?? "";

    if (routeQuery === urlQuery && routeQuery !== queryRef.current) {
      queryRef.current = routeQuery;
      setQuery(routeQuery);
    }
  }, [filters.query, searchParams]);

  function updateQuery(nextQuery: string) {
    queryRef.current = nextQuery;
    setQuery(nextQuery);

    const params = new URLSearchParams(searchParams.toString());
    const normalizedQuery = nextQuery.trim();

    if (normalizedQuery) {
      params.set("q", normalizedQuery);
    } else {
      params.delete("q");
    }

    startTransition(() => {
      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateQuery(query);
  }

  return (
    <form className="operational-card mx-auto flex w-full max-w-2xl flex-col gap-2 p-2 sm:flex-row" action="/products" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="q">
        제품 검색
      </label>
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-[var(--radius-md)] bg-surface-soft px-3">
        <Search size={18} strokeWidth={1.8} aria-hidden="true" className="opacity-60" />
        <input
          id="q"
          name="q"
          className="min-h-11 min-w-0 flex-1 bg-transparent text-body-sm outline-none placeholder:text-ink placeholder:opacity-40"
          placeholder="예: 앱 출시 전에 랜딩페이지 만들 수 있는 서비스"
          value={query}
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => updateQuery(event.target.value)}
        />
        {query ? (
          <button className="btn-icon h-8 w-8 shrink-0" type="button" aria-label="검색어 지우기" onClick={() => updateQuery("")}>
            <X size={16} strokeWidth={1.8} />
          </button>
        ) : null}
      </div>
      <input type="hidden" name="category" value={filters.category ?? ""} />
      <input type="hidden" name="type" value={filters.productType ?? ""} />
      <input type="hidden" name="pricing" value={filters.pricing ?? ""} />
      <button className="btn-primary py-2 px-5 text-body-sm" type="submit" aria-busy={isPending}>
        검색
        <ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" />
      </button>
    </form>
  );
}
