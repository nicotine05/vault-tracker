"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
    label: "Training",
    isActive: (pathname) => pathname.startsWith("/program"),
  },
  {
    href: "/vault",
    icon: "🏆",
    label: "Vault",
    isActive: (pathname) => pathname.startsWith("/vault"),
  },
  {
    href: "/progress",
    icon: "📈",
    label: "Progress",
    isActive: (pathname) => pathname.startsWith("/progress"),
  },
  {
    href: "/more",
    icon: "⋯",
    label: "More",
    isActive: (pathname) =>
      pathname.startsWith("/more") ||
      pathname.startsWith("/nutrition") ||
      pathname.startsWith("/settings") ||
      pathname.startsWith("/logs/sprint") ||
      pathname.startsWith("/logs/strength"),
  },
];

export default function Navigation() {
  const pathname = usePathname();
  const activeIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.isActive(pathname)),
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-nav-bg shadow-lg supports-[backdrop-filter]:bg-nav-bg/80">
      <div className="relative mx-auto max-w-lg px-1 py-1.5">
        <div className="relative flex">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 rounded-2xl border border-border-accent bg-accent-soft shadow-sm transition-transform duration-300 ease-out"
            style={{
              width: `${100 / tabs.length}%`,
              transform: `translateX(${activeIndex * 100}%)`,
            }}
          />

          {tabs.map((tab) => {
            const isActive = tab.isActive(pathname);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative z-10 flex flex-1 flex-col items-center rounded-2xl px-1 py-2 text-sm transition-colors duration-200 ${
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
                  className={`mt-0.5 text-[10px] tracking-wide ${
                    isActive ? "font-semibold" : "font-medium"
                  }`}
                >
                  {tab.label}
                </span>

                <span
                  aria-hidden
                  className={`mt-1 h-1 rounded-full bg-accent transition-[width,opacity] duration-300 ${
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
