"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/" },
  { name: "Objekte", href: "/objekte" },
  { name: "Einheiten", href: "/einheiten" },
  { name: "Mieter", href: "/mieter" },
  { name: "Verträge", href: "/vertraege" },
  { name: "Sollstellungen", href: "/sollstellungen" },
  { name: "Bank", href: "/bank" },
  { name: "Mahnungen", href: "/mahnungen" },
  { name: "Tickets", href: "/tickets" },
  { name: "Kosten", href: "/kosten" },
  { name: "Zähler", href: "/zaehler" },
  { name: "Kredite", href: "/kredite" },
];

const secondaryNavigation = [
  { name: "Reporting", href: "/reporting" },
  { name: "Einstellungen", href: "/einstellungen" },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    // Exact match for root
    if (href === "/") {
      return pathname === "/";
    }
    // For other routes, check if pathname starts with href
    return pathname.startsWith(href);
  };

  const getLinkClassName = (href: string) => {
    if (isActive(href)) {
      return "block rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700";
    }
    return "block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50";
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <div className="flex items-center gap-2">
          <svg
            className="h-8 w-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            ></path>
          </svg>
          <span className="text-xl font-bold text-gray-900">PropertyOS</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {/* Primary Navigation */}
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={getLinkClassName(item.href)}
          >
            {item.name}
          </Link>
        ))}

        {/* Secondary Navigation */}
        <div className="pt-4 border-t mt-4">
          {secondaryNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={getLinkClassName(item.href)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
}
