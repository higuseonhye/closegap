import type { Campaign } from "./types";
import { makeUniqueSlug, shortId } from "./slug";

const KEY = "closegap_campaigns_v1";

function loadRaw(): Campaign[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as Campaign[];
  } catch {
    return [];
  }
}

function saveRaw(list: Campaign[]): void {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function listCampaigns(): Campaign[] {
  return loadRaw().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getCampaign(id: string): Campaign | undefined {
  return loadRaw().find((c) => c.id === id);
}

export function getCampaignBySlug(slug: string): Campaign | undefined {
  return loadRaw().find((c) => c.slug === slug);
}

export function upsertCampaign(c: Campaign): void {
  const list = loadRaw();
  const i = list.findIndex((x) => x.id === c.id);
  if (i >= 0) list[i] = c;
  else list.push(c);
  saveRaw(list);
}

export function deleteCampaign(id: string): void {
  saveRaw(loadRaw().filter((c) => c.id !== id));
}

export function createDraftCampaign(title: string): Campaign {
  const now = new Date().toISOString();
  const existing = new Set(loadRaw().map((c) => c.slug));
  const slug = makeUniqueSlug(title, existing);
  const start = new Date();
  const end = new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000);
  const c: Campaign = {
    id: crypto.randomUUID(),
    slug,
    title: title.trim() || "Untitled campaign",
    status: "draft",
    offerOneLiner: "",
    audienceOneLiner: "",
    priceCents: 0,
    currency: "USD",
    windowStart: start.toISOString(),
    windowEnd: end.toISOString(),
    scopeLines: [],
    minimalScopeAcknowledged: false,
    paymentProvider: "none",
    paymentUrl: null,
    brandName: null,
    publishWithWarnings: true,
    createdAt: now,
    updatedAt: now,
  };
  upsertCampaign(c);
  return c;
}

/** Ensure slug uniqueness when renaming (excluding self). */
export function ensureUniqueSlug(slug: string, excludeId: string): string {
  const set = new Set(loadRaw().filter((c) => c.id !== excludeId).map((c) => c.slug));
  let candidate = slug.trim() || `campaign-${shortId()}`;
  if (!set.has(candidate)) return candidate;
  return `${candidate}-${shortId()}`;
}
