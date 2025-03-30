import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/DataTable';
import { FileText, Loader2, ArrowRight, AlertCircle } from 'lucide-react';

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
  const navigate = useNavigate();

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

  const columns = [
    {
      key: 'title',
      header: 'Title',
      className: 'w-1/3',
      render: (value: string) => (
        <div className="flex items-center">
          <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: 'upload_date',
      header: 'Date',
      className: 'w-1/6',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'w-1/6',
      render: (value: string) => (
        <Badge variant={value === 'completed' ? 'default' : value === 'processing' ? 'outline' : 'destructive'}>
          {value === 'completed' ? 'Completed' : 
           value === 'processing' ? 'Processing' : 
           value === 'pending' ? 'Pending' : 'Failed'}
        </Badge>
      ),
    },
    {
      key: 'overall_score',
      header: 'Score',
      className: 'w-1/6',
      render: (value: number | null) => {
        if (value === null) return 'N/A';
        return (
          <span className={value >= 7 ? 'text-green-500' : value >= 5 ? 'text-amber-500' : 'text-red-500'}>
            {value}/10
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-1/6 text-right',
      render: (_: any, item: Analysis) => (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(`/pitch-deck-analysis/${item.id}`)}
          disabled={item.status !== 'completed'}
        >
          View
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Previous Analyses</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (analyses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Previous Analyses</CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No analyses found</h3>
            <p className="text-muted-foreground mb-4">
              Upload a pitch deck to start analyzing
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Previous Analyses</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable 
          columns={columns} 
          data={analyses} 
          emptyState="No analyses found"
          exportFilename="pitch-deck-analyses"
        />
      </CardContent>
    </Card>
  );
}
