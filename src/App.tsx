
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "./components/Layout";
import AuthGuard from "./components/AuthGuard";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Valuation from "./pages/Valuation";
import FinancialOverview from "./pages/FinancialOverview";
import Performance from "./pages/Performance";
import CapTable from "./pages/CapTable";
import DataRoom from "./pages/DataRoom";
import NotFound from "./pages/NotFound";
import PitchDeckAnalysis from "./pages/PitchDeckAnalysis";
import DueDiligence from "./pages/DueDiligence";
import InvestorDashboard from "./pages/InvestorDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={
                <AuthGuard>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </AuthGuard>
              }
            />
            <Route
              path="/valuation"
              element={
                <AuthGuard>
                  <Layout>
                    <Valuation />
                  </Layout>
                </AuthGuard>
              }
            />
            <Route
              path="/financial-overview"
              element={
                <AuthGuard>
                  <Layout>
                    <FinancialOverview />
                  </Layout>
                </AuthGuard>
              }
            />
            <Route
              path="/performance"
              element={
                <AuthGuard>
                  <Layout>
                    <Performance />
                  </Layout>
                </AuthGuard>
              }
            />
            <Route
              path="/cap-table"
              element={
                <AuthGuard>
                  <Layout>
                    <CapTable />
                  </Layout>
                </AuthGuard>
              }
            />
            <Route
              path="/data-room"
              element={
                <AuthGuard>
                  <Layout>
                    <DataRoom />
                  </Layout>
                </AuthGuard>
              }
            />
            <Route
              path="/pitch-deck-analysis"
              element={
                <AuthGuard>
                  <Layout>
                    <PitchDeckAnalysis />
                  </Layout>
                </AuthGuard>
              }
            />
            <Route
              path="/pitch-deck-analysis/:analysisId"
              element={
                <AuthGuard>
                  <Layout>
                    <PitchDeckAnalysis />
                  </Layout>
                </AuthGuard>
              }
            />
            <Route
              path="/due-diligence"
              element={
                <AuthGuard>
                  <Layout>
                    <DueDiligence />
                  </Layout>
                </AuthGuard>
              }
            />
            <Route
              path="/investor-dashboard"
              element={
                <AuthGuard>
                  <Layout>
                    <InvestorDashboard />
                  </Layout>
                </AuthGuard>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
