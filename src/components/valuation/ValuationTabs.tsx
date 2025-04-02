
import { useState, useEffect } from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs";
import { QuestionnaireContent } from '@/pages/valuation/QuestionnaireContent';
import { ValuationContent } from '@/pages/valuation/ValuationContent';
import { HistoryContent } from '@/pages/valuation/HistoryContent';
import { BenchmarksContent } from '@/pages/valuation/BenchmarksContent';
import { useLocation, useNavigate } from 'react-router-dom';

export function ValuationTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('questionnaire');
  
  // Handle tab from URL query parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    
    if (tabParam && ['questionnaire', 'valuation', 'history', 'benchmarks'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);
  
  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/valuation?tab=${value}`, { replace: true });
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="w-full"
    >
      <TabsList className="w-full max-w-md mb-6 bg-background border-b border-border rounded-none p-0">
        <TabsTrigger 
          value="questionnaire" 
          className={`px-6 py-3 rounded-none ${activeTab === 'questionnaire' ? 'border-b-2 border-primary' : ''}`}
        >
          Questionnaire
        </TabsTrigger>
        <TabsTrigger 
          value="valuation" 
          className={`px-6 py-3 rounded-none ${activeTab === 'valuation' ? 'border-b-2 border-primary' : ''}`}
        >
          Valuation
        </TabsTrigger>
        <TabsTrigger 
          value="benchmarks" 
          className={`px-6 py-3 rounded-none ${activeTab === 'benchmarks' ? 'border-b-2 border-primary' : ''}`}
        >
          Benchmarks
        </TabsTrigger>
        <TabsTrigger 
          value="history" 
          className={`px-6 py-3 rounded-none ${activeTab === 'history' ? 'border-b-2 border-primary' : ''}`}
        >
          History
        </TabsTrigger>
      </TabsList>

      <TabsContent value="questionnaire">
        <QuestionnaireContent setActiveTab={setActiveTab} />
      </TabsContent>
      <TabsContent value="valuation">
        <ValuationContent />
      </TabsContent>
      <TabsContent value="benchmarks">
        <BenchmarksContent />
      </TabsContent>
      <TabsContent value="history">
        <HistoryContent />
      </TabsContent>
    </Tabs>
  );
}
