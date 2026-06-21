"use client";

import type { ReactNode } from "react";

type ProductOutboundLinkProps = {
  productId: string;
  href: string;
  className?: string;
  children: ReactNode;
};

export function ProductOutboundLink({ productId, href, className, children }: ProductOutboundLinkProps) {
  function logOutboundClick() {
    const body = JSON.stringify({
      productId,
      destination: href,
    });

    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/products/outbound-click", blob);
      return;
    }

    void fetch("/api/products/outbound-click", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
      keepalive: true,
    });
  }

  return (
    <a className={className} href={href} target="_blank" rel="noreferrer" onClick={logOutboundClick}>
      {children}
    </a>
  );
}
