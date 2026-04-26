import { Link, NavLink, useLocation } from "react-router-dom";

import { cn } from "@/utils/cn";
import { MoonIcon, SparkleIcon, SunIcon } from "@/components/ui/icons";
import { useThemeStore } from "@/store/useThemeStore";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/agent", label: "AI Agent" },
];

function ThemeToggle() {
  const effective = useThemeStore((s) => s.effective);
  const toggle = useThemeStore((s) => s.toggle);
  const isDark = effective === "dark";

  return (
    <button
      type="button"
      onClick={() => toggle()}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink-200 bg-white text-ink-600 shadow-soft transition hover:bg-ink-50 hover:text-ink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-200 dark:shadow-soft-dark dark:hover:bg-ink-800 dark:hover:text-white"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light theme" : "Dark theme"}
    >
      {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
    </button>
  );
}

export function Header() {
  const { pathname } = useLocation();
  const onAgentChat = pathname === "/agent/chat";
  const onAgentIntro = pathname === "/agent";

  const ctaTo = onAgentChat ? "/agent" : onAgentIntro ? "/agent/chat" : "/agent";
  const ctaLabel = onAgentChat
    ? "Feature overview"
    : onAgentIntro
      ? "Start chatting"
      : "Try the AI agent";

  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/85 pt-safe backdrop-blur dark:border-ink-800 dark:bg-ink-900/90">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-2 py-2.5 watch:gap-1.5 watch:py-2 xs:gap-3 xs:px-3 sm:gap-4 sm:px-6 lg:px-8">
        <NavLink
          to="/"
          className="flex flex-shrink-0 items-center gap-1.5 xs:gap-2.5"
        >
          <span className="grid h-8 w-8 place-items-center rounded-2xl bg-brand-600 text-white shadow-soft xs:h-9 xs:w-9">
            <span className="font-display text-sm font-bold xs:text-base">C</span>
          </span>
          <div className="hidden leading-tight sm:block">
            <p className="font-display text-sm font-semibold text-ink-900 dark:text-ink-50">
              ClinixAi
            </p>
            <p className="text-[11px] uppercase tracking-wider text-ink-500 dark:text-ink-400">
              Healthcare Intelligence
            </p>
          </div>
        </NavLink>

        <nav
          aria-label="Primary"
          className="-mx-1 flex flex-1 items-center justify-end overflow-x-auto px-1 scrollbar-thin"
        >
          <div className="flex items-center gap-1 rounded-full border border-ink-100 bg-white p-1 shadow-soft dark:border-ink-700 dark:bg-ink-800/80 dark:shadow-soft-dark">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive: navActive }) => {
                  const active =
                    item.to === "/"
                      ? navActive
                      : item.to === "/agent" && (pathname === "/agent" || pathname.startsWith("/agent/"));
                  return cn(
                    "flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition watch:px-2 watch:py-1 watch:text-[10px] xs:px-3 xs:py-1.5 xs:text-sm sm:px-4 sm:text-base",
                    active
                      ? "bg-brand-600 text-white shadow-soft"
                      : "text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-700/80",
                  );
                }}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        <ThemeToggle />

        <Link
          to={ctaTo}
          className="hidden flex-shrink-0 items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700 sm:inline-flex sm:px-4"
        >
          <SparkleIcon size={14} />
          {ctaLabel}
        </Link>
      </div>
    </header>
  );
}
