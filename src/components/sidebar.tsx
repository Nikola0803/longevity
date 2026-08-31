"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { NAV_GROUPS } from "@/lib/nav";

export function Sidebar({
  organizationName,
  brandCount,
}: {
  organizationName: string;
  brandCount: number;
}) {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 border-r border-cc-background-200 bg-cc-background-50 flex flex-col">
      <div className="h-16 px-5 flex items-center gap-2.5 border-b border-cc-background-200">
        <div className="w-8 h-8 rounded-md bg-cc-primary-500 flex items-center justify-center text-cc-background-50">
          <i className="ri-pulse-line text-lg" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-cc-foreground-950">Command Center</div>
          <div className="text-[11px] text-cc-foreground-500">Store Operations</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-6 last:mb-0">
            <div className="text-[11px] uppercase tracking-wider text-cc-foreground-500 px-3 mb-2">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
                      active
                        ? "bg-cc-primary-500 text-cc-background-50"
                        : "text-cc-foreground-700 hover:bg-cc-background-100 hover:text-cc-foreground-950"
                    )}
                  >
                    <i className={clsx(item.icon, "text-base w-5 h-5 flex items-center justify-center")} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-cc-background-200">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-md">
          <div className="w-8 h-8 rounded-full bg-cc-secondary-200 text-cc-secondary-900 flex items-center justify-center text-xs font-semibold">
            {organizationName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 leading-tight min-w-0">
            <div className="text-sm font-medium text-cc-foreground-950 truncate">{organizationName}</div>
            <div className="text-[11px] text-cc-foreground-500 truncate">
              {brandCount > 1 ? `${brandCount} sites connected` : "Store connected"}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
