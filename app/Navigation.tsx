"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const tabs = [
    {
      href: "/",
      icon: "🏠",
      label: "Home",
      activeColor:
        "text-blue-600 bg-blue-50",
    },
    {
      href: "/program",
      icon: "📋",
      label: "Program",
      activeColor:
        "text-green-600 bg-green-50",
    },
    {
      href: "/nutrition",
      icon: "🍽️",
      label: "Nutrition",
      activeColor:
        "text-orange-600 bg-orange-50",
    },
    {
      href: "/logs",
      icon: "➕",
      label: "Log",
      activeColor:
        "text-purple-600 bg-purple-50",
    },
    {
      href: "/progress",
      icon: "📈",
      label: "Progress",
      activeColor:
        "text-pink-600 bg-pink-50",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
      <div className="flex justify-around py-2">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center text-sm px-3 py-2 rounded-xl transition-all ${
                isActive
                  ? tab.activeColor
                  : "text-gray-500"
              }`}
            >
              <span className="text-xl">
                {tab.icon}
              </span>

              <span className="font-medium">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}