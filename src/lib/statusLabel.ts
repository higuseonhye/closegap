import type { Campaign } from "./types";

/** Human-readable status for UI (English). */
export function campaignStatusLabel(s: Campaign["status"]): string {
  switch (s) {
    case "draft":
      return "Draft";
    case "ready":
      return "Ready";
    case "live":
      return "Live";
    case "ended":
      return "Ended";
    case "archived":
      return "Archived";
    default:
      return s;
  }
}
