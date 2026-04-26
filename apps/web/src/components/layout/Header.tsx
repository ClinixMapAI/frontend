import { NavLink } from "react-router-dom";

import { cn } from "@/utils/cn";
import { SparkleIcon } from "@/components/ui/icons";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/agent", label: "AI Agent" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-ink-900 text-gold-400 shadow-soft">
            <span className="font-display text-base font-bold">H</span>
          </span>
          <div className="leading-tight">
            <p className="font-display text-sm font-semibold text-ink-900">
              HackNation
            </p>
            <p className="text-[11px] uppercase tracking-wider text-ink-500">
              Healthcare Intelligence
            </p>
          </div>
        </NavLink>

        <nav className="hidden items-center gap-1 rounded-full border border-ink-100 bg-white p-1 shadow-soft sm:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition",
                  isActive
                    ? "bg-ink-900 text-white shadow-soft"
                    : "text-ink-600 hover:bg-ink-50",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <a
          href="/agent"
          className="hidden items-center gap-1.5 rounded-full bg-gold-500 px-3.5 py-1.5 text-xs font-semibold text-ink-900 shadow-soft transition hover:bg-gold-400 sm:inline-flex"
        >
          <SparkleIcon size={14} />
          Try the AI agent
        </a>

        <nav className="flex items-center gap-1 rounded-full border border-ink-100 bg-white p-1 shadow-soft sm:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition",
                  isActive ? "bg-ink-900 text-white" : "text-ink-600",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
