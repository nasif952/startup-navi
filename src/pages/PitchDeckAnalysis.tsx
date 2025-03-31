
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadPitchDeck } from '@/components/pitch-deck/UploadPitchDeck';
import { AnalysisList } from '@/components/pitch-deck/AnalysisList';
import { AnalysisResult } from '@/components/pitch-deck/AnalysisResult';
import { ArrowLeft, Upload, BarChart3, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function PitchDeckAnalysis() {
  const { analysisId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("upload");

  // Redirect unauthenticated users after auth check completes
  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication required",
        description: "Please log in to access pitch deck analysis",
        variant: "destructive",
      });
      navigate('/auth', { state: { from: '/pitch-deck-analysis' } });
    }
  }, [user, loading, navigate, toast]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, don't render content
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Shield className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-medium">Authentication Required</h2>
        <p className="text-muted-foreground">Please log in to access pitch deck analysis</p>
        <Button onClick={() => navigate('/auth', { state: { from: '/pitch-deck-analysis' } })}>
          Log In
        </Button>
      </div>
    );
  }

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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
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
