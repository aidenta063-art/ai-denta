"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";

export function HeaderShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const solid = !isHomepage || scrolled;

  useEffect(() => {
    if (!isHomepage) return;

    function onScroll() {
      setScrolled(window.scrollY > 40);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHomepage]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-20 border-b transition-all duration-300 ${
          solid
            ? "border-white/10 bg-[#251037]/80 backdrop-blur-md"
            : "border-transparent bg-transparent"
        }`}
      >
        {children}
      </header>
      {/* Reserves the header's height in normal flow. Skipped on the
          homepage, where the header overlays the dark hero instead. */}
      {!isHomepage && <div className="h-24" aria-hidden />}
    </>
  );
}
