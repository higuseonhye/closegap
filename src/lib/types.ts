export type CampaignStatus = "draft" | "ready" | "live" | "ended" | "archived";

export type PaymentProvider = "none" | "external_url";

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
}

export type ReadinessLevel = "green" | "amber" | "red";

export interface ReadinessItem {
  id: string;
  label: string;
  level: ReadinessLevel;
  detail: string;
}
