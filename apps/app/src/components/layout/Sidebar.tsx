"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GlobalSearch } from "@/components/GlobalSearch";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Objekte", href: "/objekte" },
  { name: "Einheiten", href: "/einheiten" },
  { name: "Mieter", href: "/mieter" },
  { name: "Verträge", href: "/vertraege" },
  { name: "Sollstellungen", href: "/sollstellungen" },
  { name: "Bank", href: "/bank" },
  { name: "Mahnungen", href: "/mahnungen" },
  { name: "Tickets", href: "/tickets" },
  { name: "Dienstleister", href: "/dienstleister" },
  { name: "Kosten", href: "/kosten" },
  { name: "Zähler", href: "/zaehler" },
  { name: "Kredite", href: "/kredite" },
  { name: "Nebenkostenabr.", href: "/nebenkostenabrechnung" },
  { name: "Wartungsplan", href: "/wartung" },
];

const secondaryNavigation = [
  { name: "Reporting", href: "/reporting" },
  { name: "Einstellungen", href: "/einstellungen" },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    // Exact match for dashboard
    if (href === "/dashboard") {
      return pathname === "/dashboard";
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
          <img
            src="/logos/logo.png"
            alt="PropGate"
            className="h-8 w-8 rounded-md"
          />
          <span className="text-xl font-bold text-gray-900">PropGate</span>
        </div>
      </div>

      {/* Global Search */}
      <div className="px-4 pt-4">
        <GlobalSearch />
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
