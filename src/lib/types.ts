export type CampaignStatus = "draft" | "ready" | "live" | "ended" | "archived";

export type PaymentProvider = "none" | "external_url";

/** Per-campaign launch kit: repo → local → sync → deploy → Stripe → videos → link bundle. */
export interface CampaignShipKit {
  /** GitHub repository HTTPS URL */
  repoUrl: string;
  /** User confirmed they pulled latest from default branch */
  syncedLatestConfirmed: boolean;
  /** Production / preview URL of the web app (e.g. Vercel) */
  deployUrl: string;
  /** Stripe Payment Link (test mode OK) — can be copied into campaign checkout */
  stripeTestUrl: string;
  introVideoUrl: string;
  demoVideoUrl: string;
  notes: string;
  steps: {
    localPreviewDone: boolean;
    syncVerified: boolean;
    deployDone: boolean;
    stripeLinked: boolean;
    videosReady: boolean;
  };
}

export interface Campaign {
  id: string;
  slug: string;
  title: string;
  status: CampaignStatus;
  offerOneLiner: string;
  audienceOneLiner: string;
  priceCents: number;
  currency: string;
  windowStart: string;
  windowEnd: string;
  scopeLines: string[];
  minimalScopeAcknowledged: boolean;
  paymentProvider: PaymentProvider;
  paymentUrl: string | null;
  brandName: string | null;
  publishWithWarnings: boolean;
  createdAt: string;
  updatedAt: string;
  /** Launch checklist + URLs for this campaign (localStorage until sync). */
  shipKit: CampaignShipKit;
}

export type ReadinessLevel = "green" | "amber" | "red";

export interface ReadinessItem {
  id: string;
  label: string;
  level: ReadinessLevel;
  detail: string;
}
