/** Prevents duplicate draft creation when React Strict Mode runs effects twice. */
const SESSION_KEY = "closegap_pending_new_campaign_id";

export function takePendingNewCampaignId(): string | null {
  const id = sessionStorage.getItem(SESSION_KEY);
  if (id) {
    sessionStorage.removeItem(SESSION_KEY);
    return id;
  }
  return null;
}

export function setPendingNewCampaignId(id: string): void {
  sessionStorage.setItem(SESSION_KEY, id);
}

export function clearPendingNewCampaignId(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
