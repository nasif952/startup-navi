
import { useState } from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs";
import { QuestionnaireContent } from '@/pages/valuation/QuestionnaireContent';
import { ValuationContent } from '@/pages/valuation/ValuationContent';
import { HistoryContent } from '@/pages/valuation/HistoryContent';

export function ValuationTabs() {
  const [activeTab, setActiveTab] = useState('questionnaire');

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
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
      <TabsContent value="history">
        <HistoryContent />
      </TabsContent>
    </Tabs>
  );
}
