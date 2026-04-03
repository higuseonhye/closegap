import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { setPendingNewCampaignId, takePendingNewCampaignId } from "@/lib/newCampaignSession";
import { createDraftCampaign } from "@/lib/storage";

/** Creates a draft and opens the workspace—no extra form. */
export function NewCampaignPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const reused = takePendingNewCampaignId();
    if (reused) {
      navigate(`/app/campaign/${reused}`, { replace: true });
      return;
    }
    const c = createDraftCampaign("Untitled campaign");
    setPendingNewCampaignId(c.id);
    navigate(`/app/campaign/${c.id}`, { replace: true });
  }, [navigate]);

  return (
    <AppShell title="New campaign">
      <p className="text-muted text-sm">Opening your draft…</p>
    </AppShell>
  );
}
