import { Navigate, Route, Routes } from "react-router-dom";
import { CampaignWorkspacePage } from "./pages/CampaignWorkspacePage";
import { DashboardPage } from "./pages/DashboardPage";
import { HomePage } from "./pages/HomePage";
import { IcpDiscoveryPage } from "./pages/IcpDiscoveryPage";
import { NewCampaignPage } from "./pages/NewCampaignPage";
import { PublicCampaignPage } from "./pages/PublicCampaignPage";
import { ShipHubPage } from "./pages/ShipHubPage";
import { ShipPage } from "./pages/ShipPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/app" element={<DashboardPage />} />
      <Route path="/app/ship" element={<ShipHubPage />} />
      <Route path="/app/campaigns/new" element={<IcpDiscoveryPage />} />
      <Route path="/app/campaigns/new/skip" element={<NewCampaignPage />} />
      <Route path="/app/campaign/:id/ship" element={<ShipPage />} />
      <Route path="/app/campaign/:id" element={<CampaignWorkspacePage />} />
      <Route path="/c/:slug" element={<PublicCampaignPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
