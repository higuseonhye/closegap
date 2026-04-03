import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function AppShell({
  children,
  title,
  wide,
}: {
  children: ReactNode;
  title?: string;
  /** Wider main column for long-form copy (e.g. Ship checklist). */
  wide?: boolean;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Link to="/" className="text-accent font-medium shrink-0">
            Closegap
          </Link>
          {title ? (
            <span className="text-muted text-sm truncate" title={title}>
              {title}
            </span>
          ) : null}
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link to="/app" className="text-muted hover:text-ink">
            Campaigns
          </Link>
          <Link to="/app/ship" className="text-muted hover:text-ink">
            Launch
          </Link>
          <Link to="/" className="text-muted hover:text-ink">
            Home
          </Link>
        </nav>
      </header>
      <main
        className={`flex-1 w-full mx-auto px-4 py-8 ${wide ? "max-w-4xl" : "max-w-3xl"}`}
      >
        {children}
      </main>
    </div>
  );
}
