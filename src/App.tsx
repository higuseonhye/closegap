import { Navigate, Route, Routes } from "react-router-dom";
import { CampaignWorkspacePage } from "./pages/CampaignWorkspacePage";
import { DashboardPage } from "./pages/DashboardPage";
import { HomePage } from "./pages/HomePage";
import { NewCampaignPage } from "./pages/NewCampaignPage";
import { PublicCampaignPage } from "./pages/PublicCampaignPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/app" element={<DashboardPage />} />
      <Route path="/app/campaigns/new" element={<NewCampaignPage />} />
      <Route path="/app/campaign/:id" element={<CampaignWorkspacePage />} />
      <Route path="/c/:slug" element={<PublicCampaignPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
