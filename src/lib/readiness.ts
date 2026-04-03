import type { Campaign, ReadinessItem, ReadinessLevel } from "./types";

const OFFER_MAX = 280;

function level(ok: boolean, warn?: boolean): ReadinessLevel {
  if (ok) return "green";
  if (warn) return "amber";
  return "red";
}

function isHttpsUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

export function computeReadiness(c: Campaign, now: Date = new Date()): ReadinessItem[] {
  const offerOk =
    c.offerOneLiner.trim().length > 0 && c.offerOneLiner.trim().length <= OFFER_MAX;
  const priceOk = Number.isFinite(c.priceCents) && c.priceCents > 0 && Boolean(c.currency);
  let windowOk = false;
  let windowDetail = "Set a valid start and end.";
  const start = new Date(c.windowStart);
  const end = new Date(c.windowEnd);
  if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
    windowOk = end.getTime() > start.getTime();
    windowDetail = windowOk ? "Window is valid." : "End must be after start.";
    if (windowOk && c.status === "live" && end.getTime() < now.getTime()) {
      windowDetail = "Window has ended; campaign shows as ended to visitors.";
    }
  }

  const scopeOk =
    c.scopeLines.some((line) => line.trim().length > 0) || c.minimalScopeAcknowledged;

  let paymentOk = false;
  let paymentDetail =
    "Add an HTTPS checkout link when you have one — or allow publish without it (see form).";
  if (c.paymentProvider === "external_url" && c.paymentUrl) {
    paymentOk = isHttpsUrl(c.paymentUrl.trim());
    paymentDetail = paymentOk ? "Payment link looks valid (HTTPS)." : "Use a full https:// URL.";
  } else if (c.publishWithWarnings) {
    paymentDetail =
      "No checkout link yet — OK while “publish without payment link” is on. Paste the link when ready.";
  }

  const slugOk = c.slug.trim().length > 0;

  const items: ReadinessItem[] = [
    {
      id: "offer",
      label: "Offer",
      level: level(offerOk),
      detail: offerOk
        ? "Offer one-liner is set."
        : `Offer must be 1–${OFFER_MAX} characters.`,
    },
    {
      id: "price",
      label: "Price",
      level: level(priceOk),
      detail: priceOk ? "Price and currency are set." : "Set a price above zero and currency.",
    },
    {
      id: "window",
      label: "Window",
      level: level(windowOk),
      detail: windowDetail,
    },
    {
      id: "scope",
      label: "Scope",
      level: level(scopeOk, !scopeOk),
      detail: scopeOk
        ? "Scope line(s) or minimal-scope acknowledgment is set."
        : "Add a scope bullet or check minimal scope for this launch.",
    },
    {
      id: "payment",
      label: "Payment",
      level: level(paymentOk, !paymentOk),
      detail: paymentDetail,
    },
    {
      id: "slug",
      label: "URL slug",
      level: level(slugOk),
      detail: slugOk ? "Slug is set." : "Save a URL slug for the public page.",
    },
  ];

  return items;
}

export function allGreen(items: ReadinessItem[]): boolean {
  return items.every((i) => i.level === "green");
}

/** Ready to publish: all green, or warnings mode with no red items. */
export function isReadyToPublish(
  items: ReadinessItem[],
  publishWithWarnings: boolean
): boolean {
  if (allGreen(items)) return true;
  if (publishWithWarnings && items.every((i) => i.level !== "red")) return true;
  return false;
}

/** Derive stored status from readiness (preserves live / archived unless window ended). */
export function computeNextStatus(
  c: Campaign,
  items: ReadinessItem[],
  now: Date = new Date()
): Campaign["status"] {
  if (c.status === "archived") return "archived";
  const end = new Date(c.windowEnd);
  if (c.status === "live" && !Number.isNaN(end.getTime()) && end.getTime() < now.getTime()) {
    return "ended";
  }
  if (c.status === "live") return "live";
  if (c.status === "ended") {
    if (!Number.isNaN(end.getTime()) && end.getTime() >= now.getTime()) {
      return isReadyToPublish(items, c.publishWithWarnings) ? "ready" : "draft";
    }
    return "ended";
  }
  if (isReadyToPublish(items, c.publishWithWarnings)) return "ready";
  return "draft";
}
