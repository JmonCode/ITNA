"use client";

import { useEffect } from "react";

type SearchLoggerProps = {
  query?: string;
  resultCount: number;
  searchType: "keyword" | "hybrid";
  filters: {
    category?: string;
    productType?: string;
    pricing?: string;
  };
  sortOption?: string;
};

export function SearchLogger({ query, resultCount, searchType, filters, sortOption }: SearchLoggerProps) {
  const normalizedQuery = query?.trim();
  const { category, productType, pricing } = filters;

  useEffect(() => {
    if (!normalizedQuery) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void fetch("/api/search/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: normalizedQuery,
          resultCount,
          searchType,
          filters: {
            category,
            productType,
            pricing,
          },
          sortOption,
        }),
        keepalive: true,
      });
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [normalizedQuery, resultCount, searchType, sortOption, category, productType, pricing]);

  return null;
}
