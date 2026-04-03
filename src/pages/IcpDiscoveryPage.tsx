import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { createDraftCampaign, getCampaign, upsertCampaign } from "@/lib/storage";
import { setPendingNewCampaignId } from "@/lib/newCampaignSession";

interface Icp {
  id: number;
  title: string;
  description: string;
  pain: string;
  where: string;
  offer_one_liner: string;
  audience_one_liner: string;
  cold_message: string;
  followup: string;
  pitch_points: { hook: string; detail: string }[];
}

function buildPrompt(product: string): string {
  return `You are a GTM expert helping solo founders find their first paying customer.

Product description:
${product}

Return ONLY valid JSON, no markdown, no preamble:
{
  "icps": [
    {
      "id": 1,
      "title": "ICP name (role/situation, 2-4 words)",
      "description": "Who this person is in 2 sentences.",
      "pain": "The specific pain they have without this product, 1 sentence.",
      "where": "Where to find them (platform, community, event).",
      "offer_one_liner": "One-line offer tailored to this ICP.",
      "audience_one_liner": "One-line audience description for campaign page.",
      "cold_message": "Cold DM or email to send this person. Natural and specific. Under 200 characters.",
      "followup": "Follow-up message 3 days later. Under 50 characters.",
      "pitch_points": [
        { "hook": "Demo opening line", "detail": "Why this hits hard for this person." },
        { "hook": "Core value prop", "detail": "Specific benefit with numbers or comparison." },
        { "hook": "Closing — payment nudge", "detail": "Why buy now. How to suggest price." }
      ]
    }
  ]
}

Generate 3 different ICPs for this product.`;
}

const MOCK_ICPS: Icp[] = [
  {
    id: 1,
    title: "Solo founder pre-launch",
    description: "A solo founder who has built a product but has never sold anything before. They know what they made but have no idea who to reach out to or what to say.",
    pain: "They have a working product and zero paying customers — not because no one wants it, but because they never sent the first message.",
    where: "Indie Hackers, X/Twitter #buildinpublic, Hacker News",
    offer_one_liner: "Go from 'I built something' to your first paid customer — in one flow.",
    audience_one_liner: "Solo founders who are ready to sell but don't know where to start.",
    cold_message: "Hey — do you have a product but no paying customers yet? I built a tool that closes that gap. Takes 10 min. Want to try it?",
    followup: "Still looking for your first customer? CloseGap can help.",
    pitch_points: [
      { hook: "When did you last actually try to sell?", detail: "Most founders build and wait. CloseGap forces the sell moment: one offer, one page, one path to payment." },
      { hook: "From idea to checkout in one session", detail: "Offer + scope + readiness check + payment link — assembled before you talk yourself out of it." },
      { hook: "First customer changes everything", detail: "Offer founder rate: $29 one-time. One customer covers it. Every customer after is pure signal." },
    ],
  },
  {
    id: 2,
    title: "YC applicant pre-deadline",
    description: "A founder applying to YC who knows traction is the deciding factor. They have a product but no MRR, and the deadline is weeks away.",
    pain: "They're polishing their application while the real blocker — zero paying customers — stays unsolved.",
    where: "YC forums, Startup School Slack, X/Twitter #ycombinator",
    offer_one_liner: "Get your first paying customer before the YC deadline.",
    audience_one_liner: "Pre-YC founders who need traction before the application window closes.",
    cold_message: "YC deadline is soon. Traction matters more than the application. CloseGap gets you to first revenue fast — want to see how?",
    followup: "Still no paying customers? Let's fix that before 5/4.",
    pitch_points: [
      { hook: "YC cares about one thing above all", detail: "$10k MRR beats a perfect application every time. CloseGap helps you get there before the deadline." },
      { hook: "One paying customer changes your narrative", detail: "You go from 'we're building' to 'we have paying customers.' That sentence alone changes the interview." },
      { hook: "Time is the real constraint", detail: "Offer urgency pricing: $49 until 5/4. Frame it as the cheapest YC prep they'll ever buy." },
    ],
  },
  {
    id: 3,
    title: "Seed-stage founder stalling",
    description: "A founder who raised a small pre-seed round and has been building for months. Investors are asking for traction updates and there's nothing to show yet.",
    pain: "They have runway, a product, and investor pressure — but no revenue because they keep waiting for the product to be 'ready enough' to sell.",
    where: "Lenny's Slack, First Round community, LinkedIn startup groups",
    offer_one_liner: "Turn your PMF signals into your first paid revenue — before your next investor update.",
    audience_one_liner: "Post-pre-seed founders who need revenue before their next check-in.",
    cold_message: "Investor update coming up with no revenue to show? CloseGap turns your product into a sellable campaign in one session.",
    followup: "Next investor call is closer than you think. CloseGap can help.",
    pitch_points: [
      { hook: "What does your next update say?", detail: "Investors funded a business, not a product. CloseGap creates the sell moment that turns signals into revenue." },
      { hook: "Readiness gate stops the endless polish", detail: "CloseGap forces you to publish when the offer is good enough — not when it's perfect." },
      { hook: "One campaign, one customer, one update", detail: "Offer monthly: $49/mo. First month pays for itself with one sale. Frame it as investor-update insurance." },
    ],
  },
];

export function IcpDiscoveryPage() {
  const navigate = useNavigate();
  const [product, setProduct] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [icps, setIcps] = useState<Icp[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [useMock] = useState(true); // TODO: set to false when API credits available

  async function discover() {
    if (!product.trim()) return;
    setLoading(true);
    setError("");
    setIcps([]);
    setSelected(null);

    if (useMock) {
      await new Promise((r) => setTimeout(r, 1200));
      setIcps(MOCK_ICPS);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-calls": "true",
        },
        body: JSON.stringify({
          model: "claude-opus-4-5",
          max_tokens: 2000,
          messages: [{ role: "user", content: buildPrompt(product) }],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? `HTTP ${res.status}`);
      const text: string = data.content[0].text;
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim()) as { icps: Icp[] };
      setIcps(parsed.icps);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  function launch(icp: Icp) {
    const c = createDraftCampaign(icp.title);
    const fresh = getCampaign(c.id);
    if (!fresh) return;
    upsertCampaign({
      ...fresh,
      offerOneLiner: icp.offer_one_liner,
      audienceOneLiner: icp.audience_one_liner,
      updatedAt: new Date().toISOString(),
    });
    setPendingNewCampaignId(c.id);
    navigate(`/app/campaign/${c.id}`);
  }

  return (
    <AppShell title="Find your first customer">
      <div className="max-w-2xl mx-auto py-8 space-y-6">

        {/* Inputs */}
        <div className="space-y-4">
          {!useMock && (
            <div>
              <label className="block text-xs text-muted mb-1 uppercase tracking-wide">
                Anthropic API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full bg-surface border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
              />
            </div>
          )}
          <div>
            <label className="block text-xs text-muted mb-1 uppercase tracking-wide">
              What did you build?
            </label>
            <textarea
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              rows={4}
              placeholder="Describe your product. What problem does it solve, and who is it for?"
              className="w-full bg-surface border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent resize-none"
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={discover}
              disabled={loading || !product.trim()}
              className="bg-accent text-black font-semibold text-sm px-5 py-2 rounded hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Analyzing…" : "Find ICPs →"}
            </button>
            <button
              onClick={() => navigate("/app/campaigns/new/skip")}
              className="text-xs text-muted hover:text-ink underline"
            >
              Skip — I already know my customer
            </button>
          </div>
          {error && (
            <p className="text-red-400 text-sm border border-red-400/30 rounded px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* ICP Cards */}
        {icps.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted uppercase tracking-wide">
              Select an ICP to see outreach messages
            </p>
            {icps.map((icp) => (
              <div
                key={icp.id}
                onClick={() => setSelected(selected === icp.id ? null : icp.id)}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selected === icp.id
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-border/80"
                }`}
              >
                <p className="text-xs text-accent mb-1 font-mono">ICP 0{icp.id}</p>
                <p className="font-semibold text-ink">{icp.title}</p>
                <p className="text-sm text-muted mt-1">{icp.description}</p>
                <p className="text-xs text-red-400 mt-2">▶ {icp.pain}</p>
                <p className="text-xs text-muted mt-1">📍 {icp.where}</p>

                {selected === icp.id && (
                  <div className="mt-4 pt-4 border-t border-border space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-muted uppercase tracking-wide">Cold message</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); copyText(icp.cold_message, `cold-${icp.id}`); }}
                          className="text-xs text-muted hover:text-accent"
                        >
                          {copied === `cold-${icp.id}` ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <p className="text-sm bg-surface rounded px-3 py-2">{icp.cold_message}</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-muted uppercase tracking-wide">Follow-up</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); copyText(icp.followup, `followup-${icp.id}`); }}
                          className="text-xs text-muted hover:text-accent"
                        >
                          {copied === `followup-${icp.id}` ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <p className="text-sm bg-surface rounded px-3 py-2">{icp.followup}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted uppercase tracking-wide mb-2">Demo script</p>
                      <div className="space-y-2">
                        {icp.pitch_points.map((p, i) => (
                          <div key={i} className="flex gap-3 bg-surface rounded px-3 py-2">
                            <span className="text-accent font-bold font-mono text-sm shrink-0">{i + 1}</span>
                            <div>
                              <p className="text-sm font-medium text-ink">{p.hook}</p>
                              <p className="text-xs text-muted mt-0.5">{p.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); launch(icp); }}
                      className="w-full bg-accent text-black font-semibold text-sm py-2 rounded hover:opacity-90"
                    >
                      Start campaign for this ICP →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {icps.length === 0 && !loading && (
          <p className="text-xs text-muted text-center pt-4">
            Describe your product above and click "Find ICPs" to get started.
          </p>
        )}

      </div>
    </AppShell>
  );
}
