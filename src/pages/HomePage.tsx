import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-16 sm:py-24">
      <p className="text-xs tracking-[0.12em] uppercase text-muted mb-4">ODD Playground</p>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink mb-4">
        Close the gap to your <span className="text-accent">first paid customer</span>.
      </h1>
      <p className="text-lg text-muted mb-8">
        Landing, scope, and checkout in one flow—so your first revenue doesn’t die in the setup.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          to="/app/campaigns/new"
          className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-black hover:opacity-90"
        >
          Start a campaign
        </Link>
        <Link
          to="/app"
          className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm text-ink hover:border-muted"
        >
          Open dashboard
        </Link>
      </div>
      <p className="mt-12 pt-6 border-t border-border text-sm text-muted">
        Positioning and PRD live in the repository under <code className="text-accent">docs/</code>.
      </p>
    </div>
  );
}
