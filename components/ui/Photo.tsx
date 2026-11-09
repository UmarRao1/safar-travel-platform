"use client";

import { useCallback, useState } from "react";

type PhotoProps = { src?: string | null; alt: string; className?: string; priority?: boolean };

/** Image with a quiet gradient fallback if the photo fails to load. */
export function Photo({ src, alt, className = "", priority = false }: PhotoProps) {
  const [failed, setFailed] = useState(false);
  // Catch images that already failed before React hydrated.
  const check = useCallback((img: HTMLImageElement | null) => {
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);
  if (!src || failed) {
    return <div role="img" aria-label={alt} className={`bg-gradient-to-br from-accent-soft to-surface-2 ${className}`} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={check}
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
