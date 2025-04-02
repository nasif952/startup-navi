
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalysisListTable } from './AnalysisListTable';
import { AnalysisListLoading } from './AnalysisListLoading';
import { AnalysisListEmpty } from './AnalysisListEmpty';

interface Analysis {
  id: string;
  title: string;
  status: string;
  upload_date: string;
  overall_score: number | null;
}

export function AnalysisList() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const { data, error } = await supabase
          .from('pitch_deck_analyses')
          .select('id, title, status, upload_date, analysis')
          .order('upload_date', { ascending: false });
        
        if (error) throw error;
        
        const formattedData = data.map(item => ({
          id: item.id,
          title: item.title || 'Untitled Analysis',
          status: item.status || 'unknown',
          upload_date: item.upload_date,
          overall_score: item.analysis && typeof item.analysis === 'object' ? 
            (item.analysis as { overallScore?: number }).overallScore || null : 
            null,
        }));
        
        setAnalyses(formattedData);
      } catch (error) {
        console.error('Error fetching analyses:', error);
        toast({
          title: "Error",
          description: "Failed to load analysis records.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyses();
  }, [toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Previous Analyses</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <AnalysisListLoading />
        ) : analyses.length === 0 ? (
          <AnalysisListEmpty />
        ) : (
          <AnalysisListTable analyses={analyses} />
        )}
      </CardContent>
    </Card>
  );
}
