import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "./components/layout/AppShell";
import { Loader } from "./components/ui/Loader";
import { FacilityDetailModal } from "./components/features/FacilityDetailModal";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const AgentPage = lazy(() => import("./pages/AgentPage"));

function PageFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader label="Loading…" />
    </div>
  );
}

export default function App() {
  return (
    <AppShell>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/agent" element={<AgentPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <FacilityDetailModal />
    </AppShell>
  );
}
