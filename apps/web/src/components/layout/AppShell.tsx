import type { ReactNode } from "react";

import { Header } from "./Header";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Header />
      <main className="flex min-h-0 flex-1 flex-col">
        <div className="mx-auto w-full max-w-7xl flex-1 px-2 py-4 xs:px-4 sm:px-6 sm:py-8 lg:px-8 lg:py-10 dark:text-ink-100">
          {children}
        </div>
      </main>
    </div>
  );
}
