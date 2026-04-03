import { githubCommitsUrl, parseGithubRepo } from "./github";
import type { Campaign, CampaignShipKit } from "./types";

export function defaultShipKit(): CampaignShipKit {
  return {
    repoUrl: "",
    syncedLatestConfirmed: false,
    deployUrl: "",
    stripeTestUrl: "",
    introVideoUrl: "",
    demoVideoUrl: "",
    notes: "",
    steps: {
      localPreviewDone: false,
      syncVerified: false,
      deployDone: false,
      stripeLinked: false,
      videosReady: false,
    },
  };
}

export function mergeShipKit(raw: CampaignShipKit | undefined): CampaignShipKit {
  const d = defaultShipKit();
  if (!raw) return d;
  return {
    ...d,
    ...raw,
    steps: { ...d.steps, ...raw.steps },
  };
}

/** Normalize campaign loaded from storage (older saves may omit shipKit). */
export function withShipKit(c: Campaign): Campaign {
  return { ...c, shipKit: mergeShipKit(c.shipKit) };
}

export function buildLocalCloneScript(repoHttps: string): string {
  const p = parseGithubRepo(repoHttps);
  if (!p) {
    return `# Add a valid GitHub HTTPS URL, e.g. https://github.com/owner/repo`;
  }
  return `git clone ${p.httpsUrl}.git
cd ${p.repo}
npm install
npm run dev`;
}

export function buildIntroScriptTemplate(c: Campaign, repoHttps: string | null, publicUrl: string): string {
  return `Hi — I'm working on "${c.title}".

${c.offerOneLiner.trim() ? c.offerOneLiner.trim() : "One-line offer: (fill in your campaign pitch)."}

Repository: ${repoHttps ?? "(add your GitHub repo in Launch kit)"}
Public campaign URL (when live): ${publicUrl}

I'm running this as a time-boxed campaign — scope, window, readiness, and checkout in one flow.

Thank you.`;
}

export function buildDemoStepsTemplate(slug: string): string {
  return `1. Open the app (deployed URL or localhost).
2. Dashboard → New campaign → ICP discovery, or Skip if you already know your ICP.
3. Complete campaign workspace: price, window, scope, checkout link (Stripe test mode OK).
4. Readiness → Publish → open public page /c/${slug} in a new tab.
5. Confirm checkout link opens (test card in Stripe test mode).`;
}

export function buildLinkBundleMarkdown(
  c: Campaign,
  kit: CampaignShipKit,
  origin: string
): string {
  const publicUrl = `${origin}/c/${c.slug}`;
  const repoParsed = kit.repoUrl.trim() ? parseGithubRepo(kit.repoUrl) : null;
  const clone = repoParsed ? buildLocalCloneScript(repoParsed.httpsUrl) : "";
  const checkout = kit.stripeTestUrl.trim() || c.paymentUrl?.trim() || "(not set)";
  const deploy = kit.deployUrl.trim() || "(not set)";
  const commitsLine = repoParsed
    ? `- Latest commits: ${githubCommitsUrl(repoParsed.httpsUrl)}`
    : "";
  return `## ${c.title} — launch link bundle

### GitHub
- ${kit.repoUrl.trim() || "(add repository URL in Launch kit)"}
${commitsLine}

### Local preview
\`\`\`bash
${clone || "# Paste a valid GitHub HTTPS URL first"}
\`\`\`

### Deployed app (Vercel or other)
- ${deploy}

### Checkout (Stripe — test mode OK for demos)
- ${checkout}

### Program / investor videos (optional)
- Intro: ${kit.introVideoUrl.trim() || "(not set)"}
- Product demo: ${kit.demoVideoUrl.trim() || "(not set)"}

### Public campaign page
- ${publicUrl}

### Notes
${kit.notes.trim() || "—"}
`;
}
