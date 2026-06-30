"use client";

import { useEffect, useRef } from "react";

export function HeroSpline() {
  const layerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const layer = layerRef.current;

    if (!layer) {
      return;
    }

    let releaseTimer: number | undefined;

    const releaseScroll = () => {
      const iframe = iframeRef.current;
      if (!iframe) {
        return;
      }

      iframe.style.pointerEvents = "none";
    };

    const enableTracking = () => {
      const iframe = iframeRef.current;
      if (!iframe) {
        return;
      }

      iframe.style.pointerEvents = "auto";
      if (releaseTimer) {
        window.clearTimeout(releaseTimer);
      }
      releaseTimer = window.setTimeout(releaseScroll, 600);
    };

    layer.addEventListener("pointermove", enableTracking, { passive: true });

    return () => {
      if (releaseTimer) {
        window.clearTimeout(releaseTimer);
      }
      layer.removeEventListener("pointermove", enableTracking);
    };
  }, []);

  return (
    <div ref={layerRef} className="hero-spline-layer">
      <iframe
        ref={iframeRef}
        className="hero-spline-frame"
        src="https://my.spline.design/googlyeyes-pZmDXlBzedodrTTE2B4kOtSd-iwy/?itna=20260630"
        title="Googly Eyes"
        frameBorder="0"
        width="100%"
        height="100%"
        allow="autoplay; fullscreen"
        allowFullScreen
      />
    </div>
  );
}
