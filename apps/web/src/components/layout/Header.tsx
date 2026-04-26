import { NavLink } from "react-router-dom";

import { cn } from "@/utils/cn";
import { SparkleIcon } from "@/components/ui/icons";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/agent", label: "AI Agent" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
        <NavLink
          to="/"
          className="flex flex-shrink-0 items-center gap-2.5"
        >
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-brand-600 text-white shadow-soft">
            <span className="font-display text-base font-bold">C</span>
          </span>
          <div className="hidden leading-tight sm:block">
            <p className="font-display text-sm font-semibold text-ink-900">
              ClinixAi
            </p>
            <p className="text-[11px] uppercase tracking-wider text-ink-500">
              Healthcare Intelligence
            </p>
          </div>
        </NavLink>

        <nav
          aria-label="Primary"
          className="-mx-1 flex flex-1 items-center justify-end overflow-x-auto px-1 scrollbar-thin"
        >
          <div className="flex items-center gap-1 rounded-full border border-ink-100 bg-white p-1 shadow-soft">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex-shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition sm:px-4 sm:text-base",
                    isActive
                      ? "bg-brand-600 text-white shadow-soft"
                      : "text-ink-600 hover:bg-ink-50",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        <NavLink
          to="/agent"
          className="hidden flex-shrink-0 items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700 sm:inline-flex sm:px-4"
        >
          <SparkleIcon size={14} />
          Try the AI agent
        </NavLink>
      </div>
    </header>
  );
}
