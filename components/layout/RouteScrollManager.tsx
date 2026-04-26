"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function RouteScrollManager() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname, searchParams]);

  return null;
}
