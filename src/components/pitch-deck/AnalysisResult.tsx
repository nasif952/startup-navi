
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Metric {
  score: number;
  feedback: string;
}

interface AnalysisResult {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  metrics: {
    problemDefinition: Metric;
    solutionClarity: Metric;
    marketAnalysis: Metric;
    businessModel: Metric;
    teamQualifications: Metric;
    financialProjections: Metric;
    visualDesign: Metric;
  };
  recommendations: string[];
}

interface AnalysisData {
  id: string;
  title: string;
  status: string;
  upload_date: string;
  analysis: AnalysisResult;
}

interface AnalysisResultProps {
  analysisId: string;
  onBack?: () => void;
}

export function AnalysisResult({ analysisId, onBack }: AnalysisResultProps) {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch(`/api/pitch-deck-analysis/${analysisId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch analysis');
        }
        const data = await response.json();
        setAnalysis(data);
      } catch (error) {
        console.error('Error fetching analysis:', error);
        toast({
          title: "Error",
          description: "Failed to load analysis results.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (analysisId) {
      fetchAnalysis();
    }
  }, [analysisId, toast]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Loading Analysis...</CardTitle>
          <CardDescription>Please wait while we load your pitch deck analysis</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">This may take a minute...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Analysis Not Found</CardTitle>
          <CardDescription>We couldn't find the analysis you're looking for</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <XCircle className="h-16 w-16 text-destructive mb-4" />
            <p>The analysis may have been deleted or the ID is incorrect.</p>
            {onBack && (
              <button 
                onClick={onBack}
                className="mt-4 rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
              >
                Go Back
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-amber-500';
    return 'text-red-500';
  };

  const getProgressColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const formatMetricName = (name: string) => {
    return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold">{analysis.title}</CardTitle>
            <CardDescription>Analyzed on {new Date(analysis.upload_date).toLocaleDateString()}</CardDescription>
          </div>
          <div className="flex items-center">
            <Badge variant={analysis.status === 'completed' ? 'default' : 'destructive'}>
              {analysis.status === 'completed' ? 'Complete' : 'Failed'}
            </Badge>
            <div className="ml-4 text-4xl font-bold flex items-center">
              <span className={getScoreColor(analysis.analysis.overallScore)}>
                {analysis.analysis.overallScore}/10
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Score Breakdown</TabsTrigger>
            <TabsTrigger value="strengths">Strengths</TabsTrigger>
            <TabsTrigger value="improvements">Improvements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Key Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.analysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Areas to Improve</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.analysis.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 shrink-0" />
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.analysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="metrics">
            <Card>
              <CardHeader>
                <CardTitle>Score Breakdown</CardTitle>
                <CardDescription>Detailed scores for different aspects of your pitch deck</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(analysis.analysis.metrics).map(([key, metric]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{formatMetricName(key)}</span>
                        <span className={`font-bold ${getScoreColor(metric.score)}`}>
                          {metric.score}/10
                        </span>
                      </div>
                      <Progress 
                        value={metric.score * 10} 
                        className={getProgressColor(metric.score)}
                      />
                      <p className="text-sm text-muted-foreground mt-1">{metric.feedback}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="strengths">
            <Card>
              <CardHeader>
                <CardTitle>Key Strengths</CardTitle>
                <CardDescription>What your pitch deck does well</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {analysis.analysis.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start p-4 bg-muted/50 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-medium">Strength {index + 1}</h4>
                        <p>{strength}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="improvements">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Improvements</CardTitle>
                <CardDescription>Actions you can take to enhance your pitch deck</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <h3 className="font-semibold">Weaknesses to Address</h3>
                  <ul className="space-y-4 mb-8">
                    {analysis.analysis.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start p-4 bg-muted/50 rounded-lg">
                        <XCircle className="h-6 w-6 text-red-500 mr-3 mt-0.5 shrink-0" />
                        <div>
                          <h4 className="font-medium">Weakness {index + 1}</h4>
                          <p>{weakness}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  
                  <h3 className="font-semibold">Specific Recommendations</h3>
                  <ul className="space-y-4">
                    {analysis.analysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start p-4 bg-muted/50 rounded-lg">
                        <AlertCircle className="h-6 w-6 text-blue-500 mr-3 mt-0.5 shrink-0" />
                        <div>
                          <h4 className="font-medium">Recommendation {index + 1}</h4>
                          <p>{rec}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {onBack && (
          <div className="mt-6">
            <button 
              onClick={onBack}
              className="rounded bg-secondary px-4 py-2 text-secondary-foreground hover:bg-secondary/80"
            >
              Back to All Analyses
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
