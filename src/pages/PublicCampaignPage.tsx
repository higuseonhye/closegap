import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { toInputDatetime } from "@/lib/datetime";
import { formatMoney } from "@/lib/money";
import { getCampaignBySlug } from "@/lib/storage";

export function PublicCampaignPage() {
  const { slug } = useParams<{ slug: string }>();
  const campaign = useMemo(
    () => (slug ? getCampaignBySlug(slug) : undefined),
    [slug]
  );

  if (!slug) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <p className="text-muted">Invalid link.</p>
        <Link to="/" className="mt-4 text-accent">
          Home
        </Link>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <p className="text-muted">This campaign doesn’t exist in this browser.</p>
        <p className="text-sm text-muted mt-2">
          If you opened this on another device, open the link where the campaign was created—or sign
          in when accounts ship.
        </p>
        <Link to="/" className="mt-6 text-accent">
          Closegap home
        </Link>
      </div>
    );
  }

  if (campaign.status === "archived") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <p className="text-muted">This campaign has been archived.</p>
        <Link to="/" className="mt-4 text-accent">
          Home
        </Link>
      </div>
    );
  }

  if (campaign.status === "draft" || campaign.status === "ready") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center max-w-md mx-auto">
        <p className="text-ink font-medium">This page is not published yet.</p>
        <p className="text-sm text-muted mt-2">
          Open the campaign in the browser where you created it and click <strong>Publish</strong> to
          make it public.
        </p>
        <Link to="/" className="mt-6 text-accent">
          Closegap home
        </Link>
      </div>
    );
  }

  const now = new Date();
  const end = new Date(campaign.windowEnd);
  const isEnded =
    !Number.isNaN(end.getTime()) && end.getTime() < now.getTime();
  const payUrl = campaign.paymentUrl?.trim();

  return (
    <div className="min-h-screen">
      <div className="max-w-lg mx-auto px-4 py-12 sm:py-16">
        <p className="text-xs tracking-[0.12em] uppercase text-muted mb-6">
          {campaign.brandName ?? "Closegap campaign"}
        </p>
        {isEnded ? (
          <div className="mb-6 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            This offer window has ended.
          </div>
        ) : null}
        <h1 className="text-3xl font-semibold tracking-tight text-ink mb-4">
          {campaign.offerOneLiner || "Offer coming soon"}
        </h1>
        <p className="text-lg text-muted mb-8">
          {campaign.audienceOneLiner || "For teams ready to move."}
        </p>

        <div className="rounded-lg border border-border bg-white/5 p-5 mb-8">
          <h2 className="text-sm font-medium text-muted uppercase tracking-wide mb-3">Scope</h2>
          <ul className="list-disc pl-5 space-y-2 text-ink">
            {campaign.scopeLines
              .map((l) => l.trim())
              .filter(Boolean)
              .map((line, idx) => (
                <li key={`${idx}-${line.slice(0, 48)}`}>{line}</li>
              ))}
          </ul>
          {campaign.scopeLines.every((l) => !l.trim()) &&
          campaign.minimalScopeAcknowledged ? (
            <p className="text-sm text-muted mt-2">Minimal scope — details confirmed with the seller.</p>
          ) : null}
        </div>

        <div className="rounded-lg border border-border p-5 mb-8 space-y-2">
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-muted">Price</span>
            <span className="text-ink font-medium">
              {formatMoney(campaign.priceCents, campaign.currency)}
            </span>
          </div>
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-muted">Window</span>
            <span className="text-ink text-right">
              {toInputDatetime(campaign.windowStart).replace("T", " · ")} →{" "}
              {toInputDatetime(campaign.windowEnd).replace("T", " · ")}
            </span>
          </div>
        </div>

        {!isEnded && payUrl ? (
          <a
            href={payUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full sm:w-auto justify-center rounded-md bg-accent px-6 py-3 text-base font-medium text-black hover:opacity-90"
          >
            Pay / checkout
          </a>
        ) : !isEnded ? (
          <p className="text-sm text-muted">Payment link not configured yet.</p>
        ) : null}

        <p className="mt-12 pt-6 border-t border-border text-xs text-muted">
          Software doesn’t replace judgment or guarantees—only removes setup gaps.{" "}
          <Link to="/" className="text-accent">
            Closegap
          </Link>
        </p>
      </div>
    </div>
  );
}
