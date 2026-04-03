import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { ReadinessPanel } from "@/components/ReadinessPanel";
import {
  formatWindowCaption,
  fromInputDatetime,
  toInputDatetime,
} from "@/lib/datetime";
import { formatMoney } from "@/lib/money";
import {
  formatPitch,
  parsePitch,
  scopeLinesToText,
  textToScopeLines,
} from "@/lib/quickFields";
import {
  computeNextStatus,
  computeReadiness,
  isReadyToPublish,
} from "@/lib/readiness";
import { clearPendingNewCampaignId } from "@/lib/newCampaignSession";
import {
  deleteCampaign,
  ensureUniqueSlug,
  getCampaign,
  upsertCampaign,
} from "@/lib/storage";
import { campaignStatusLabel } from "@/lib/statusLabel";
import type { Campaign } from "@/lib/types";

const CURRENCIES = ["USD", "EUR", "GBP", "KRW", "JPY"] as const;

function patchCampaign(c: Campaign, patch: Partial<Campaign>): Campaign {
  return { ...c, ...patch, updatedAt: new Date().toISOString() };
}

export function CampaignWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [missing, setMissing] = useState(false);
  const [publishBanner, setPublishBanner] = useState<"live" | null>(null);
  const campaignRef = useRef<Campaign | null>(null);
  campaignRef.current = campaign;

  useEffect(() => {
    if (!id) {
      setMissing(true);
      return;
    }
    clearPendingNewCampaignId();
    const c = getCampaign(id);
    if (!c) {
      setMissing(true);
      return;
    }
    setCampaign(c);
    setMissing(false);
  }, [id]);

  const items = useMemo(
    () => (campaign ? computeReadiness(campaign) : []),
    [campaign]
  );

  useEffect(() => {
    if (!campaign) return;
    const t = window.setTimeout(() => {
      const cur = campaignRef.current;
      if (!cur) return;
      const r = computeReadiness(cur);
      const nextStatus = computeNextStatus(cur, r);
      upsertCampaign({ ...cur, status: nextStatus, updatedAt: new Date().toISOString() });
    }, 450);
    return () => window.clearTimeout(t);
  }, [campaign]);

  if (missing || !id) {
    return <Navigate to="/app" replace />;
  }
  if (!campaign) {
    return (
      <AppShell>
        <p className="text-muted">Loading…</p>
      </AppShell>
    );
  }

  const c = campaign;

  function update(patch: Partial<Campaign>) {
    setCampaign((prev) => (prev ? patchCampaign(prev, patch) : prev));
  }

  function onSlugBlur() {
    const next = ensureUniqueSlug(c.slug, c.id);
    if (next !== c.slug) update({ slug: next });
  }

  function dollarsToCents(s: string): number {
    const n = Number.parseFloat(s.replace(/,/g, ""));
    if (Number.isNaN(n) || n < 0) return 0;
    return Math.round(n * 100);
  }

  function centsToDollars(cents: number): string {
    return (cents / 100).toFixed(2);
  }

  function setWindowPreset(days: number) {
    const start = new Date();
    const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
    setCampaign((prev) =>
      prev
        ? patchCampaign(prev, {
            windowStart: start.toISOString(),
            windowEnd: end.toISOString(),
          })
        : prev
    );
  }

  function publish() {
    const cur = campaignRef.current;
    if (!cur) return;
    const r = computeReadiness(cur);
    if (!isReadyToPublish(r, cur.publishWithWarnings)) {
      const reds = r.filter((i) => i.level === "red").map((i) => i.label);
      window.alert(
        `Not ready to publish yet.\n\nFix (red): ${reds.length ? reds.join(", ") : "see Readiness below"}.\n\nIf only Payment is amber, turn on “Publish without a checkout link for now” under Checkout.`
      );
      return;
    }
    const next = patchCampaign(cur, { status: "live" });
    setCampaign(next);
    upsertCampaign(next);
    setPublishBanner("live");
    window.setTimeout(() => setPublishBanner(null), 6000);
  }

  function archive() {
    if (!window.confirm("Archive this campaign? You can keep the link for reference.")) return;
    const next = patchCampaign(c, { status: "archived" });
    setCampaign(next);
    upsertCampaign(next);
  }

  function remove() {
    if (!window.confirm("Delete this campaign permanently?")) return;
    deleteCampaign(c.id);
    navigate("/app");
  }

  const publicUrl = `${window.location.origin}/c/${c.slug}`;
  const pitchValue = formatPitch(c.offerOneLiner, c.audienceOneLiner);
  const scopeValue = scopeLinesToText(c.scopeLines);

  return (
    <AppShell title={c.title}>
      <div className="space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-ink">Campaign</h1>
            <p className="text-sm text-muted mt-1">
              {campaignStatusLabel(c.status)} · auto-saved · fewer fields, same outcome
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/app/campaign/${c.id}/ship`}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-accent hover:border-accent/50"
            >
              Launch kit
            </Link>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(publicUrl);
              }}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-ink hover:border-muted"
            >
              Copy link
            </button>
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              title="Opens the public URL. It shows full content only after you publish."
              className="rounded-md border border-border px-3 py-1.5 text-sm text-accent hover:underline"
            >
              Preview
            </a>
            <button
              type="button"
              disabled={c.status === "live" || c.status === "ended"}
              onClick={publish}
              className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-black hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {c.status === "live" ? "Published" : "Publish"}
            </button>
          </div>
        </div>

        {publishBanner === "live" ? (
          <div
            className="rounded-lg border border-accent/50 bg-accent/10 px-4 py-3 text-sm text-ink"
            role="status"
          >
            You’re live. Share the link above — buyers can open your public page.
          </div>
        ) : null}

        <section className="rounded-xl border border-border bg-white/[0.03] p-5 sm:p-6 space-y-5">
          <h2 className="text-sm font-medium text-accent">Fill this first</h2>

          <div className="block">
            <label
              htmlFor="campaign-pitch"
              className="text-sm text-ink font-medium"
            >
              What you sell · who it’s for
            </label>
            <p className="text-xs text-muted mt-0.5 mb-2">
              Line 1 = offer. From line 2 = who it’s for (can be several lines).
            </p>
            <textarea
              id="campaign-pitch"
              value={pitchValue}
              onChange={(e) => {
                const { offerOneLiner, audienceOneLiner } = parsePitch(e.target.value);
                update({ offerOneLiner, audienceOneLiner });
              }}
              rows={5}
              className="w-full rounded-md border border-border bg-canvas px-3 py-2.5 text-ink text-[15px] leading-relaxed placeholder:text-muted"
              placeholder={`e.g. first line: 2-week async UX teardown for B2B SaaS\n(from line 2: Seed–Series A PMs who need a clear next step)`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 sm:items-end">
            <label className="block sm:col-span-1">
              <span className="text-sm text-muted">Price</span>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={centsToDollars(c.priceCents)}
                  onChange={(e) => update({ priceCents: dollarsToCents(e.target.value) })}
                  className="min-w-0 flex-1 rounded-md border border-border bg-canvas px-3 py-2 text-ink"
                  placeholder="99.00"
                />
                <select
                  value={c.currency}
                  onChange={(e) => update({ currency: e.target.value })}
                  className="w-24 shrink-0 rounded-md border border-border bg-canvas px-2 py-2 text-ink text-sm"
                >
                  {CURRENCIES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>
            </label>
            <p className="text-xs text-muted sm:text-right sm:pb-2">
              {formatMoney(c.priceCents, c.currency)}
            </p>
          </div>

          <div className="relative z-10 isolate">
            <span className="text-sm text-muted block mb-2">Offer window</span>
            <div className="flex flex-wrap gap-2">
              {([7, 14, 30] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setWindowPreset(d);
                  }}
                  className="relative z-10 cursor-pointer touch-manipulation rounded-md border border-border bg-canvas px-3 py-1.5 text-sm text-ink hover:bg-white/5"
                >
                  Next {d} days
                </button>
              ))}
            </div>
            <p className="text-xs text-muted mt-2" aria-live="polite">
              <span className="text-ink/90">Selected: </span>
              {formatWindowCaption(c.windowStart, c.windowEnd) || "—"}
            </p>
            <details className="mt-3 group">
              <summary className="text-sm text-accent cursor-pointer list-none flex items-center gap-1 [&::-webkit-details-marker]:hidden">
                <span className="group-open:rotate-90 transition-transform inline-block">▸</span>
                Exact start & end (optional)
              </summary>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pl-0">
                <label className="block">
                  <span className="text-xs text-muted">Start</span>
                  <input
                    type="datetime-local"
                    value={toInputDatetime(c.windowStart)}
                    onChange={(e) =>
                      update({ windowStart: fromInputDatetime(e.target.value) })
                    }
                    className="mt-1 w-full rounded-md border border-border bg-canvas px-3 py-2 text-ink text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-muted">End</span>
                  <input
                    type="datetime-local"
                    value={toInputDatetime(c.windowEnd)}
                    onChange={(e) =>
                      update({ windowEnd: fromInputDatetime(e.target.value) })
                    }
                    className="mt-1 w-full rounded-md border border-border bg-canvas px-3 py-2 text-ink text-sm"
                  />
                </label>
              </div>
            </details>
          </div>

          <div>
            <label className="block">
              <span className="text-sm text-muted">Checkout link</span>
              <p className="text-xs text-muted mt-0.5 mb-2">
                Stripe Payment Link, Lemon, Gumroad, etc.{" "}
                <strong className="text-ink font-normal">Fine to leave empty for now</strong> — you can
                still publish the page and paste the link later.
              </p>
              <input
                value={c.paymentUrl ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  const trimmed = v.trim();
                  update({
                    paymentUrl: v || null,
                    paymentProvider: trimmed ? "external_url" : "none",
                  });
                }}
                className="mt-1 w-full rounded-md border border-border bg-canvas px-3 py-2 text-ink font-mono text-sm"
                placeholder="https://buy.stripe.com/... (add when ready)"
              />
            </label>
            <label className="flex items-start gap-2 text-sm mt-3">
              <input
                type="checkbox"
                checked={c.publishWithWarnings}
                onChange={(e) =>
                  update({ publishWithWarnings: e.target.checked })
                }
                className="mt-1"
              />
              <span className="text-muted">
                <span className="text-ink">Publish without a checkout link for now</span> — Payment
                stays amber (warning) until you add HTTPS; that’s OK as long as nothing else is red.
              </span>
            </label>
          </div>

          <label className="block">
            <span className="text-sm text-muted">What’s included (optional — one bullet per line)</span>
            <textarea
              value={scopeValue}
              onChange={(e) =>
                update({ scopeLines: textToScopeLines(e.target.value) })
              }
              rows={4}
              className="mt-1 w-full rounded-md border border-border bg-canvas px-3 py-2 text-ink text-sm leading-relaxed"
              placeholder={"e.g.\nSlack async review\nLoom walkthrough\n72h turnaround"}
            />
          </label>
        </section>

        <ReadinessPanel items={items} />

        <details className="rounded-lg border border-border bg-black/20 p-4">
          <summary className="text-sm font-medium text-ink cursor-pointer">
            Advanced (title, URL, brand…)
          </summary>
          <div className="mt-4 space-y-4 pt-2 border-t border-border">
            <label className="block">
              <span className="text-sm text-muted">Dashboard title</span>
              <input
                value={c.title}
                onChange={(e) => update({ title: e.target.value })}
                className="mt-1 w-full rounded-md border border-border bg-canvas px-3 py-2 text-ink"
              />
            </label>
            <label className="block">
              <span className="text-sm text-muted">Public URL slug</span>
              <input
                value={c.slug}
                onChange={(e) => update({ slug: e.target.value })}
                onBlur={onSlugBlur}
                className="mt-1 w-full rounded-md border border-border bg-canvas px-3 py-2 text-ink font-mono text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm text-muted">Brand / founder (footer)</span>
              <input
                value={c.brandName ?? ""}
                onChange={(e) => update({ brandName: e.target.value || null })}
                className="mt-1 w-full rounded-md border border-border bg-canvas px-3 py-2 text-ink"
              />
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={c.minimalScopeAcknowledged}
                onChange={(e) =>
                  update({ minimalScopeAcknowledged: e.target.checked })
                }
                className="mt-1"
              />
              <span className="text-muted">
                Minimal scope only (counts toward readiness if you’re not listing bullets)
              </span>
            </label>
          </div>
        </details>

        <div className="flex flex-wrap gap-3 pt-2 border-t border-border">
          <Link to="/app" className="text-sm text-muted hover:text-ink">
            ← Campaigns
          </Link>
          <button
            type="button"
            onClick={archive}
            className="text-sm text-muted hover:text-ink"
          >
            Archive
          </button>
          <button type="button" onClick={remove} className="text-sm text-red-400 hover:underline">
            Delete
          </button>
        </div>
      </div>
    </AppShell>
  );
}
