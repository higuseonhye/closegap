import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { campaignStatusLabel } from "@/lib/statusLabel";
import { listCampaigns } from "@/lib/storage";

export function DashboardPage() {
  const [tick, setTick] = useState(0);
  const campaigns = useMemo(() => {
    void tick;
    return listCampaigns();
  }, [tick]);

  function refresh() {
    setTick((n) => n + 1);
  }

  return (
    <AppShell title="Campaigns">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-semibold text-ink">Your campaigns</h1>
          <p className="text-sm text-muted mt-1">
            Stored in this browser (localStorage). Export/backup coming later.
          </p>
        </div>
        <div className="flex gap-2 shrink-0 items-center">
          <Link
            to="/app/ship"
            className="text-sm text-muted hover:text-ink"
          >
            Ship
          </Link>
          <button
            type="button"
            onClick={refresh}
            className="text-sm text-muted hover:text-ink"
          >
            Refresh
          </button>
          <Link
            to="/app/campaigns/new"
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-black hover:opacity-90"
          >
            New campaign
          </Link>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-muted mb-4">No campaigns yet.</p>
          <Link
            to="/app/campaigns/new"
            className="inline-flex rounded-md bg-accent px-4 py-2 text-sm font-medium text-black hover:opacity-90"
          >
            Start your first campaign
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border overflow-hidden">
          {campaigns.map((c) => (
            <li key={c.id}>
              <Link
                to={`/app/campaign/${c.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-white/5"
              >
                <div className="min-w-0">
                  <div className="font-medium text-ink truncate">{c.title}</div>
                  <div className="text-xs text-muted truncate">
                    /c/{c.slug} · updated {new Date(c.updatedAt).toLocaleString()}
                  </div>
                </div>
                <span className="text-xs uppercase tracking-wide text-muted shrink-0">
                  {campaignStatusLabel(c.status)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
