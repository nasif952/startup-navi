
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/Button';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs";
import { QuestionnaireContent } from './valuation/QuestionnaireContent';
import { ValuationContent } from './valuation/ValuationContent';
import { HistoryContent } from './valuation/HistoryContent';
import { Progress } from '@/components/ui/progress';

export default function Valuation() {
  const [activeTab, setActiveTab] = useState('questionnaire');
  const { toast } = useToast();
  
  // Calculate days remaining in trial (mock data)
  const daysRemaining = 62;
  const hoursRemaining = 3;
  const minutesRemaining = 46;
  const secondsRemaining = 11;
  
  // Calculate progress percentage (for future feature)
  const progressPercentage = 14; // Represents completion of questionnaire (1 of 7 steps)
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-destructive text-destructive-foreground px-4 py-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="space-y-1">
          <p className="text-sm">Your Valuation Free Trial is Expiring in {daysRemaining}d {hoursRemaining}h {minutesRemaining}m {secondsRemaining}s</p>
          <Progress value={progressPercentage} className="h-2 w-full max-w-xs" />
        </div>
        <Button variant="primary" className="bg-white text-destructive hover:bg-white/90 whitespace-nowrap">Upgrade Now</Button>
      </div>

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
    </div>
  );
}
