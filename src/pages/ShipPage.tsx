import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";

const STORAGE_KEY = "closegap_ship_checklist_v1";
const VERCEL_DEPLOY =
  "https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fhiguseonhye%2Fclosegap&project-name=closegap&repository-name=closegap";
const REPO = "https://github.com/higuseonhye/closegap";

const INTRO_SCRIPT = `Hi, I'm Seonhye Gu, based in Seoul, building under ODD Playground.

Closegap is for founders who have PMF-style signals but stall before first paid revenue—because offer, scope, and checkout live in different places.

We assemble a time-boxed campaign in one flow: optional ICP discovery, then pitch, window, readiness, and a path to payment—without promising revenue we can't deliver.

I'm pushing for a deployed URL strangers can try, and synced storage next so shared links work on any device.

GitHub: higuseonhye/closegap — thank you.`;

const DEMO_STEPS = `1. Open the app (deployed URL or localhost).
2. Dashboard → New campaign → ICP discovery (/app/campaigns/new).
3. Paste a short product description → Find ICPs → expand one ICP → optional Copy on a message.
4. Start campaign for this ICP → campaign workspace (offer/audience seeded).
5. Set price, window, scope, paste a Stripe Payment Link (test mode OK).
6. Readiness → Publish → open public /c/{slug} in a new tab.
7. Optional: from ICP page, click Skip — I already know my customer to show the alternate path.`;

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

function CheckRow({
  id,
  label,
  checked,
  onToggle,
}: {
  id: string;
  label: string;
  checked: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(id)}
        className="mt-1 rounded border-border bg-white/5 text-accent focus:ring-accent"
      />
      <span className="text-sm text-ink group-hover:text-ink/90">{label}</span>
    </label>
  );
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

function ScreenRecorderHelper() {
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
        a.download = `closegap-screen-${Date.now()}.webm`;
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
        Records your screen + tab audio (browser will ask which screen or window). Downloads a{" "}
        <strong className="text-ink">.webm</strong> file when you stop. Upload that file to Loom,
        Descript, or convert to MP4 locally if your program requires MP4.
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
            {state === "stopping" ? "Finishing…" : "Stop & download .webm"}
          </button>
        )}
      </div>
      {error ? (
        <p className="text-xs text-red-400 border border-red-400/30 rounded px-2 py-1">{error}</p>
      ) : null}
    </div>
  );
}

const DEPLOY_IDS = [
  "d1",
  "d2",
  "d3",
  "d4",
  "d5",
  "d6",
] as const;
const INTRO_IDS = ["i1", "i2", "i3", "i4", "i5"] as const;
const DEMO_IDS = ["m1", "m2", "m3", "m4", "m5"] as const;

const DEPLOY_LABELS: Record<(typeof DEPLOY_IDS)[number], string> = {
  d1: "Open the Deploy flow and connect the GitHub repo (or import this clone URL).",
  d2: "Framework: Vite — or Other with Build: npm run build, Output: dist.",
  d3: "First production deploy succeeded; SPA routes work (vercel.json rewrites).",
  d4: "Copied the production URL (e.g. https://….vercel.app) for your application form.",
  d5: "Understood: campaign data stays in localStorage per browser until you ship Phase B sync.",
  d6: "Optional: set a custom domain in Vercel when ready.",
};

const INTRO_LABELS: Record<(typeof INTRO_IDS)[number], string> = {
  i1: "Quiet space, face visible, mic tested (30–60s target).",
  i2: "Recorded intro using the script below (or your own words, same facts).",
  i3: "Uploaded to Loom or YouTube (unlisted is fine).",
  i4: "Pasted the video URL into your application form.",
  i5: "Optional: subtitles or captions for reviewers.",
};

const DEMO_LABELS: Record<(typeof DEMO_IDS)[number], string> = {
  m1: "Deployed URL or localhost ready; Stripe test Payment Link prepared if showing checkout.",
  m2: "Recorded screen following the demo steps below (3–5 min).",
  m3: "Showed ICP discovery + at least one path to publish + public /c/ page.",
  m4: "Uploaded demo video; pasted URL into the form.",
  m5: "If file was .webm: converted or re-uploaded via a host that gives a shareable link.",
};

export function ShipPage() {
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setChecks(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checks));
  }, [checks]);

  function toggle(id: string) {
    setChecks((c) => ({ ...c, [id]: !c[id] }));
  }

  return (
    <AppShell title="Ship" wide>
      <div className="space-y-10">
        <div>
          <h1 className="text-xl font-semibold text-ink">Ship checklist</h1>
          <p className="text-sm text-muted mt-1 max-w-2xl">
            Deploy Closegap, record an intro and a product demo, then paste URLs into your program
            application. Progress is saved in <strong className="text-ink">this browser</strong>{" "}
            only.
          </p>
        </div>

        {/* Deploy */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            1. Deploy (Vercel)
          </h2>
          <p className="text-sm text-muted">
            Connect GitHub and deploy automatically on every push. Repository:{" "}
            <a href={REPO} className="text-accent hover:underline" target="_blank" rel="noreferrer">
              {REPO}
            </a>
          </p>
          <a href={VERCEL_DEPLOY} target="_blank" rel="noreferrer">
            <img
              src="https://vercel.com/button"
              alt="Deploy with Vercel"
              width={116}
              height={36}
            />
          </a>
          <div className="space-y-2">
            {DEPLOY_IDS.map((id) => (
              <CheckRow
                key={id}
                id={id}
                label={DEPLOY_LABELS[id]}
                checked={!!checks[id]}
                onToggle={toggle}
              />
            ))}
          </div>
        </section>

        {/* Intro */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            2. Intro video (~45s)
          </h2>
          <div className="space-y-2">
            {INTRO_IDS.map((id) => (
              <CheckRow
                key={id}
                id={id}
                label={INTRO_LABELS[id]}
                checked={!!checks[id]}
                onToggle={toggle}
              />
            ))}
          </div>
          <CopyBlock text={INTRO_SCRIPT} label="Copy script" />
        </section>

        {/* Demo */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            3. Demo video (~3–5 min)
          </h2>
          <div className="space-y-2">
            {DEMO_IDS.map((id) => (
              <CheckRow
                key={id}
                id={id}
                label={DEMO_LABELS[id]}
                checked={!!checks[id]}
                onToggle={toggle}
              />
            ))}
          </div>
          <CopyBlock text={DEMO_STEPS} label="Copy steps" />
        </section>

        {/* Screen recorder */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            4. Screen recording (optional)
          </h2>
          <ScreenRecorderHelper />
        </section>

        <p className="text-xs text-muted border-t border-border pt-6">
          Back to{" "}
          <Link to="/app" className="text-accent hover:underline">
            Campaigns
          </Link>{" "}
          or{" "}
          <Link to="/app/campaigns/new" className="text-accent hover:underline">
            New campaign
          </Link>
          .
        </p>
      </div>
    </AppShell>
  );
}
