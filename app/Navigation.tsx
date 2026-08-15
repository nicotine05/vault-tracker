"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type Tab = {
  href: string;
  icon: string;
  label: string;
  isActive: (pathname: string) => boolean;
};

const tabs: Tab[] = [
  {
    href: "/",
    icon: "🏠",
    label: "Home",
    isActive: (pathname) => pathname === "/",
  },
  {
    href: "/program",
    icon: "📋",
    label: "Program",
    isActive: (pathname) => pathname.startsWith("/program"),
  },
  {
    href: "/nutrition",
    icon: "🍽️",
    label: "Nutrition",
    isActive: (pathname) => pathname.startsWith("/nutrition"),
  },
  {
    href: "/logs",
    icon: "➕",
    label: "Log",
    isActive: (pathname) => pathname.startsWith("/logs"),
  },
  {
    href: "/progress",
    icon: "📈",
    label: "Progress",
    isActive: (pathname) => pathname.startsWith("/progress"),
  },
];

export default function Navigation() {
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef(new Map<string, HTMLAnchorElement>());
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  const activeTab = tabs.find((tab) => tab.isActive(pathname)) ?? tabs[0];

  const updateIndicator = useCallback(() => {
    const nav = navRef.current;
    const tab = tabRefs.current.get(activeTab.href);

    if (!nav || !tab) {
      return;
    }

    const navRect = nav.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();

    setIndicator({
      left: tabRect.left - navRect.left,
      width: tabRect.width,
      ready: true,
    });
  }, [activeTab.href]);

  useEffect(() => {
    updateIndicator();

    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [updateIndicator, pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-nav-bg shadow-lg supports-[backdrop-filter]:bg-nav-bg/80">
      <div ref={navRef} className="relative mx-auto max-w-lg px-1 py-1.5">
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-1.5 rounded-2xl border border-border-accent bg-accent-soft shadow-sm transition-[left,width,opacity] duration-300 ease-out ${
            indicator.ready ? "opacity-100" : "opacity-0"
          }`}
          style={{
            left: indicator.left,
            width: indicator.width,
          }}
        />

        <div className="relative flex justify-around">
          {tabs.map((tab) => {
            const isActive = tab.isActive(pathname);

            return (
              <Link
                key={tab.href}
                ref={(element) => {
                  if (element) {
                    tabRefs.current.set(tab.href, element);
                  } else {
                    tabRefs.current.delete(tab.href);
                  }
                }}
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative z-10 flex min-w-[3.5rem] flex-col items-center rounded-2xl px-3 py-2 text-sm transition-colors duration-200 ${
                  isActive
                    ? "text-accent-text"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <span
                  className={`text-xl transition-transform duration-200 ${
                    isActive ? "scale-110" : "scale-100"
                  }`}
                >
                  {tab.icon}
                </span>

                <span
                  className={`mt-0.5 text-[11px] tracking-wide transition-all duration-200 ${
                    isActive ? "font-semibold" : "font-medium"
                  }`}
                >
                  {tab.label}
                </span>

                <span
                  aria-hidden
                  className={`mt-1 h-1 rounded-full bg-accent transition-all duration-300 ${
                    isActive ? "w-4 opacity-100" : "w-0 opacity-0"
                  }`}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
