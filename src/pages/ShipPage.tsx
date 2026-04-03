import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { githubCommitsUrl, parseGithubRepo, vercelNewCloneUrl } from "@/lib/github";
import {
  buildDemoStepsTemplate,
  buildIntroScriptTemplate,
  buildLinkBundleMarkdown,
  buildLocalCloneScript,
} from "@/lib/shipKit";
import { getCampaign, upsertCampaign } from "@/lib/storage";
import type { Campaign, CampaignShipKit } from "@/lib/types";

function pickRecorderMime(): string | undefined {
  const types = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  for (const t of types) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) {
      return t;
    }
  }
  return undefined;
}

function CopyBlock({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="relative rounded-lg border border-border bg-white/[0.03] p-4">
      <pre className="text-xs text-muted whitespace-pre-wrap font-mono leading-relaxed pr-16">
        {text}
      </pre>
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard.writeText(text).then(() => {
            setDone(true);
            setTimeout(() => setDone(false), 2000);
          });
        }}
        className="absolute top-3 right-3 text-xs px-2 py-1 rounded border border-border text-muted hover:text-accent"
      >
        {done ? "Copied" : label}
      </button>
    </div>
  );
}

function ScreenRecorderHelper({ slug }: { slug: string }) {
  const [state, setState] = useState<"idle" | "recording" | "stopping">("idle");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const stop = useCallback(() => {
    const mr = recRef.current;
    if (mr && mr.state !== "inactive") {
      setState("stopping");
      mr.stop();
    }
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function start() {
    setError(null);
    chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      stream.getVideoTracks()[0]?.addEventListener("ended", () => {
        stop();
      });

      const mime = pickRecorderMime();
      const mr = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
      recRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mime ?? "video/webm",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `campaign-${slug}-screen-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        recRef.current = null;
        chunksRef.current = [];
        setState("idle");
      };

      mr.start(200);
      setState("recording");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start recording");
      setState("idle");
    }
  }

  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <p className="text-sm text-muted">
        Records screen + tab audio. Downloads <strong className="text-ink">.webm</strong> — upload to
        Loom/YouTube and paste URLs above.
      </p>
      <div className="flex flex-wrap gap-2">
        {state === "idle" ? (
          <button
            type="button"
            onClick={() => void start()}
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-black hover:opacity-90"
          >
            Start screen recording
          </button>
        ) : (
          <button
            type="button"
            onClick={stop}
            disabled={state === "stopping"}
            className="rounded-md border border-red-400/50 text-red-300 px-3 py-1.5 text-sm hover:bg-red-500/10 disabled:opacity-50"
          >
            {state === "stopping" ? "Finishing…" : "Stop & download"}
          </button>
        )}
      </div>
      {error ? (
        <p className="text-xs text-red-400 border border-red-400/30 rounded px-2 py-1">{error}</p>
      ) : null}
    </div>
  );
}

function StepCheck({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 rounded border-border bg-white/5 text-accent"
      />
      <span className="text-sm text-ink">{label}</span>
    </label>
  );
}

export function ShipPage() {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!id) {
      setMissing(true);
      return;
    }
    const c = getCampaign(id);
    if (!c) {
      setMissing(true);
      return;
    }
    setCampaign(c);
    setMissing(false);
  }, [id]);

  function patchCampaign(next: Campaign) {
    upsertCampaign(next);
    setCampaign(next);
  }

  function updateKit(patch: Partial<CampaignShipKit>) {
    if (!campaign) return;
    const sk = campaign.shipKit;
    const nextKit: CampaignShipKit = {
      ...sk,
      ...patch,
      steps: patch.steps ? { ...sk.steps, ...patch.steps } : sk.steps,
    };
    patchCampaign({
      ...campaign,
      shipKit: nextKit,
      updatedAt: new Date().toISOString(),
    });
  }

  function applyStripeToCheckout() {
    if (!campaign) return;
    const url = campaign.shipKit.stripeTestUrl.trim();
    if (!url) {
      window.alert("Paste a Stripe Payment Link (test mode) first.");
      return;
    }
    try {
      const u = new URL(url);
      if (u.protocol !== "https:") {
        window.alert("Use a full https:// Stripe link.");
        return;
      }
    } catch {
      window.alert("That doesn’t look like a valid URL.");
      return;
    }
    patchCampaign({
      ...campaign,
      paymentProvider: "external_url",
      paymentUrl: url,
      shipKit: {
        ...campaign.shipKit,
        steps: { ...campaign.shipKit.steps, stripeLinked: true },
      },
      updatedAt: new Date().toISOString(),
    });
  }

  if (!id || missing) {
    return <Navigate to="/app/ship" replace />;
  }
  if (!campaign) {
    return (
      <AppShell>
        <p className="text-muted">Loading…</p>
      </AppShell>
    );
  }

  const c = campaign;
  const kit = c.shipKit;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const publicUrl = `${origin}/c/${c.slug}`;
  const repoParsed = kit.repoUrl.trim() ? parseGithubRepo(kit.repoUrl) : null;
  const cloneScript = repoParsed ? buildLocalCloneScript(repoParsed.httpsUrl) : "";
  const vercelUrl = repoParsed ? vercelNewCloneUrl(`${repoParsed.httpsUrl}.git`) : null;
  const commitsUrl = repoParsed ? githubCommitsUrl(repoParsed.httpsUrl) : null;
  const bundle = buildLinkBundleMarkdown(c, kit, origin);
  const introScript = buildIntroScriptTemplate(c, repoParsed?.httpsUrl ?? null, publicUrl);
  const demoSteps = buildDemoStepsTemplate(c.slug);

  return (
    <AppShell title={`Launch · ${c.title}`} wide>
      <div className="space-y-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-ink">Launch kit</h1>
            <p className="text-sm text-muted mt-1 max-w-2xl">
              Wire your <strong className="text-ink">product repo</strong> to this campaign: preview
              locally, confirm you’re on the latest commit, deploy, add a Stripe test link, drop intro/demo
              URLs, then copy one markdown block into your application or outreach.
            </p>
          </div>
          <Link
            to={`/app/campaign/${c.id}`}
            className="rounded-md border border-border px-3 py-1.5 text-sm text-accent hover:border-accent/60 shrink-0"
          >
            ← Campaign workspace
          </Link>
        </div>

        {/* 1 GitHub */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            1. GitHub repository
          </h2>
          <label className="block">
            <span className="text-xs text-muted uppercase tracking-wide">HTTPS URL</span>
            <input
              type="url"
              value={kit.repoUrl}
              onChange={(e) => updateKit({ repoUrl: e.target.value })}
              placeholder="https://github.com/you/your-product"
              className="mt-1 w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm text-ink"
            />
          </label>
          {!repoParsed && kit.repoUrl.trim() ? (
            <p className="text-xs text-amber-400">Couldn’t parse a GitHub owner/repo from this URL.</p>
          ) : null}
          {commitsUrl ? (
            <a
              href={commitsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-accent hover:underline"
            >
              Open commit history (verify latest)
            </a>
          ) : null}
        </section>

        {/* 2 Local */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            2. Local preview
          </h2>
          <p className="text-sm text-muted">
            Clone and run in your terminal. Adjust commands if your repo uses pnpm/yarn or a different dev
            script.
          </p>
          <CopyBlock text={cloneScript || "# Set a valid GitHub HTTPS URL in step 1"} label="Copy" />
          <StepCheck
            checked={kit.steps.localPreviewDone}
            label="I ran the app locally and clicked through my product."
            onChange={(v) => updateKit({ steps: { ...kit.steps, localPreviewDone: v } })}
          />
        </section>

        {/* 3 Sync */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            3. Sync with GitHub
          </h2>
          <p className="text-sm text-muted">
            Pull the latest default branch before recording demos or deploying.
          </p>
          <StepCheck
            checked={kit.syncedLatestConfirmed}
            label="I pulled the latest from my team / main branch."
            onChange={(v) => updateKit({ syncedLatestConfirmed: v, steps: { ...kit.steps, syncVerified: v } })}
          />
        </section>

        {/* 4 Vercel */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            4. Deploy (Vercel)
          </h2>
          {vercelUrl ? (
            <a href={vercelUrl} target="_blank" rel="noreferrer">
              <img
                src="https://vercel.com/button"
                alt="Deploy with Vercel"
                width={116}
                height={36}
              />
            </a>
          ) : (
            <p className="text-sm text-muted">Add a GitHub URL above to generate a deploy button.</p>
          )}
          <label className="block">
            <span className="text-xs text-muted uppercase tracking-wide">Production / preview URL</span>
            <input
              type="url"
              value={kit.deployUrl}
              onChange={(e) => updateKit({ deployUrl: e.target.value })}
              placeholder="https://your-app.vercel.app"
              className="mt-1 w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm text-ink"
            />
          </label>
          <StepCheck
            checked={kit.steps.deployDone}
            label="Deploy works; client routes behave like production (SPA rewrites)."
            onChange={(v) => updateKit({ steps: { ...kit.steps, deployDone: v } })}
          />
        </section>

        {/* 5 Stripe */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            5. Stripe test checkout
          </h2>
          <p className="text-sm text-muted">
            Create a Payment Link in Stripe Dashboard (test mode). Paste it here, then push it into this
            campaign’s checkout field.
          </p>
          <label className="block">
            <span className="text-xs text-muted uppercase tracking-wide">Stripe Payment Link (test)</span>
            <input
              type="url"
              value={kit.stripeTestUrl}
              onChange={(e) => updateKit({ stripeTestUrl: e.target.value })}
              placeholder="https://buy.stripe.com/test_..."
              className="mt-1 w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm text-ink"
            />
          </label>
          <button
            type="button"
            onClick={applyStripeToCheckout}
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-black hover:opacity-90"
          >
            Use as campaign checkout URL
          </button>
          <StepCheck
            checked={kit.steps.stripeLinked}
            label="This URL is also set on the campaign workspace (or I’ll paste manually)."
            onChange={(v) => updateKit({ steps: { ...kit.steps, stripeLinked: v } })}
          />
        </section>

        {/* 6 Videos */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            6. Intro & demo videos
          </h2>
          <label className="block">
            <span className="text-xs text-muted uppercase tracking-wide">Intro (Loom / YouTube)</span>
            <input
              type="url"
              value={kit.introVideoUrl}
              onChange={(e) => updateKit({ introVideoUrl: e.target.value })}
              placeholder="https://..."
              className="mt-1 w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="block">
            <span className="text-xs text-muted uppercase tracking-wide">Product demo</span>
            <input
              type="url"
              value={kit.demoVideoUrl}
              onChange={(e) => updateKit({ demoVideoUrl: e.target.value })}
              placeholder="https://..."
              className="mt-1 w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm text-ink"
            />
          </label>
          <StepCheck
            checked={kit.steps.videosReady}
            label="Both URLs are shareable (unlisted OK)."
            onChange={(v) => updateKit({ steps: { ...kit.steps, videosReady: v } })}
          />
        </section>

        {/* Scripts */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Scripts (optional)
          </h2>
          <p className="text-xs text-muted">Tied to this campaign’s title, offer, and public URL.</p>
          <p className="text-xs font-medium text-ink">Intro (~45s)</p>
          <CopyBlock text={introScript} label="Copy intro" />
          <p className="text-xs font-medium text-ink pt-2">Demo flow</p>
          <CopyBlock text={demoSteps} label="Copy demo outline" />
        </section>

        {/* Screen record */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Screen recording
          </h2>
          <ScreenRecorderHelper slug={c.slug} />
        </section>

        {/* Notes + bundle */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Notes & link bundle
          </h2>
          <label className="block">
            <span className="text-xs text-muted uppercase tracking-wide">Private notes</span>
            <textarea
              value={kit.notes}
              onChange={(e) => updateKit({ notes: e.target.value })}
              rows={3}
              placeholder="Deadlines, program name, things to mention in the pitch…"
              className="mt-1 w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm text-ink resize-y"
            />
          </label>
          <p className="text-sm text-muted">
            Paste the block below into Notion, your application form, or investor email — it includes repo,
            local commands, deploy, Stripe, videos, and your public campaign URL.
          </p>
          <CopyBlock text={bundle} label="Copy link bundle" />
        </section>

        <p className="text-xs text-muted border-t border-border pt-6">
          <Link to="/app/ship" className="text-accent hover:underline">
            All launch kits
          </Link>
          {" · "}
          <Link to="/app" className="text-accent hover:underline">
            Campaigns
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
