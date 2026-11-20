"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";

interface NavItem {
  name: string;
  href: string;
  icon: (props: { className?: string }) => React.ReactNode;
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || "w-5 h-5"}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || "w-5 h-5"}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

function PlusCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || "w-5 h-5"}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      className="w-5 h-5 transition-transform"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      {collapsed ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
      )}
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "Profile", href: "/profile", icon: UserIcon },
  { name: "New application", href: "/apply/new", icon: PlusCircleIcon },
];

const STORAGE_KEY = "sidebar_collapsed";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getStoredCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function getServerCollapsed(): boolean {
  return false;
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const storedCollapsed = useSyncExternalStore(
    subscribe,
    getStoredCollapsed,
    getServerCollapsed
  );
  const [overrideCollapsed, setOverrideCollapsed] = useState<boolean | null>(null);

  // Check if current route is a review screen: /apply/[id] (but not /apply/new)
  const isReviewScreen = /^\/apply\/[^/]+$/.test(pathname) && pathname !== "/apply/new";

  const isCollapsed = overrideCollapsed !== null ? overrideCollapsed : storedCollapsed;

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setOverrideCollapsed(nextState);
    try {
      localStorage.setItem(STORAGE_KEY, String(nextState));
    } catch {
      // Storage access might be denied in some private browsing modes
    }
  };

  // Review screen forces collapse on desktop to allow maximum width for two columns
  const effectiveCollapsed = isReviewScreen || isCollapsed;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-gray-100">
      {/* Desktop Sidebar (md breakpoint and up) */}
      <aside
        className={`hidden md:flex flex-col border-r border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 transition-all duration-200 shrink-0 select-none ${
          effectiveCollapsed ? "w-16" : "w-60"
        }`}
        aria-label="Sidebar navigation"
      >
        {/* App Title / Logo */}
        <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-neutral-800 justify-between overflow-hidden">
          {!effectiveCollapsed && (
            <span className="font-semibold text-base tracking-tight truncate">
              Job Assistant
            </span>
          )}
          <button
            type="button"
            onClick={toggleCollapse}
            aria-label={effectiveCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!effectiveCollapsed}
            title={effectiveCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors cursor-pointer ml-auto"
          >
            <CollapseIcon collapsed={effectiveCollapsed} />
          </button>
        </div>

        {/* Desktop Nav */}
        <nav
          aria-label="Main navigation"
          className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto"
        >
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                title={effectiveCollapsed ? item.name : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-gray-100"
                } ${effectiveCollapsed ? "justify-center px-0" : ""}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!effectiveCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
          {children}
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar (below md breakpoint) */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur border-t border-gray-200 dark:border-neutral-800 flex items-stretch justify-around px-2"
        style={{
          paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0.25rem)",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex-1 min-h-[48px] min-w-[48px] py-2 flex flex-col items-center justify-center gap-1 text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isActive
                  ? "text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
