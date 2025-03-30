
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadPitchDeck } from '@/components/pitch-deck/UploadPitchDeck';
import { AnalysisList } from '@/components/pitch-deck/AnalysisList';
import { AnalysisResult } from '@/components/pitch-deck/AnalysisResult';
import { ArrowLeft, Upload, BarChart3 } from 'lucide-react';

export default function PitchDeckAnalysis() {
  const { analysisId } = useParams();
  const navigate = useNavigate();

  if (analysisId) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/pitch-deck-analysis')}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold mb-2">Pitch Deck Analysis</h1>
            <p className="text-muted-foreground">Detailed results of your pitch deck analysis</p>
          </div>
        </div>

        <AnalysisResult 
          analysisId={analysisId} 
          onBack={() => navigate('/pitch-deck-analysis')}
        />
      </div>
    );
  }
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-2">Pitch Deck Analysis</h1>
        <p className="text-muted-foreground">Upload and analyze your pitch deck with AI</p>
      </div>
      
      <Tabs defaultValue="upload" className="space-y-8">
        <TabsList>
          <TabsTrigger value="upload" className="flex items-center">
            <Upload className="mr-2 h-4 w-4" />
            Upload New
          </TabsTrigger>
          <TabsTrigger value="previous" className="flex items-center">
            <BarChart3 className="mr-2 h-4 w-4" />
            Previous Analyses
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <UploadPitchDeck />
        </TabsContent>
        
        <TabsContent value="previous">
          <AnalysisList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
