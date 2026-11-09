"use client";

import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import SafarAdminAccessButton from "./SafarAdminAccessButton";

/** Renders its children on public pages only; the admin area has its own chrome. */
function PublicOnly({ children }: { children: ReactNode }) {
  const isAdmin = usePathname().startsWith("/admin");
  return isAdmin ? null : <>{children}</>;
}

/**
 * The header and footer read the current pathname, which is only known at
 * request time. Each sits in its own <Suspense> boundary so the page content
 * between them can still be prerendered.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <PublicOnly>
          <SiteHeader />
        </PublicOnly>
      </Suspense>
      {children}
      <Suspense fallback={null}>
        <PublicOnly>
          <SiteFooter />
          <SafarAdminAccessButton />
        </PublicOnly>
      </Suspense>
    </>
  );
}
