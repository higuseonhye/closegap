import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { listCampaigns } from "@/lib/storage";
import { campaignStatusLabel } from "@/lib/statusLabel";

export function ShipHubPage() {
  const campaigns = listCampaigns();

  return (
    <AppShell title="Launch kit" wide>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-ink">Launch kit</h1>
          <p className="text-sm text-muted mt-1 max-w-2xl">
            Each campaign has its own checklist: GitHub → local run → sync → Vercel → Stripe test link →
            videos → copy a single link bundle into your pitch or application.
          </p>
        </div>

        {campaigns.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-muted mb-4">No campaigns yet.</p>
            <Link
              to="/app/campaigns/new"
              className="inline-flex rounded-md bg-accent px-4 py-2 text-sm font-medium text-black hover:opacity-90"
            >
              Start a campaign
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border overflow-hidden">
            {campaigns.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/app/campaign/${c.id}/ship`}
                  className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-white/5"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-ink truncate">{c.title}</div>
                    <div className="text-xs text-muted truncate">/c/{c.slug}</div>
                  </div>
                  <span className="text-xs uppercase tracking-wide text-muted shrink-0">
                    {campaignStatusLabel(c.status)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <p className="text-xs text-muted">
          <Link to="/app" className="text-accent hover:underline">
            ← Campaigns
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
