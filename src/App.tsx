
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Valuation from "./pages/Valuation";
import FinancialOverview from "./pages/FinancialOverview";
import Performance from "./pages/Performance";
import CapTable from "./pages/CapTable";
import DataRoom from "./pages/DataRoom";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/valuation"
            element={
              <Layout>
                <Valuation />
              </Layout>
            }
          />
          <Route
            path="/financial-overview"
            element={
              <Layout>
                <FinancialOverview />
              </Layout>
            }
          />
          <Route
            path="/performance"
            element={
              <Layout>
                <Performance />
              </Layout>
            }
          />
          <Route
            path="/cap-table"
            element={
              <Layout>
                <CapTable />
              </Layout>
            }
          />
          <Route
            path="/data-room"
            element={
              <Layout>
                <DataRoom />
              </Layout>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
