"use client";

import { useEffect } from "react";

export function ProductViewLogger({ productId }: { productId: string }) {
  useEffect(() => {
    void fetch("/api/products/view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId }),
      keepalive: true,
    });
  }, [productId]);

  return null;
}
