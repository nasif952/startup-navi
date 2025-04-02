
import { useState } from 'react';
import { Card } from '@/components/Card';
import { useStartupScore } from '@/hooks/useStartupScore';
import { useToast } from '@/hooks/use-toast';
import { ScoreData } from '@/lib/calculateScore';
import { Button } from '@/components/Button';
import { RefreshCw, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BenchmarkComparisonCard } from '@/components/valuation/BenchmarkComparisonCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatPercentage } from '@/lib/formatters';

export function BenchmarksContent() {
  const { toast } = useToast();
  const { latestScore, calculateScore, loading, companyData } = useStartupScore();
  const [scoreDetails, setScoreDetails] = useState<ScoreData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefreshScore = async () => {
    setIsRefreshing(true);
    try {
      const newScore = await calculateScore();
      if (newScore) {
        setScoreDetails(newScore);
        toast({
          title: "Score updated",
          description: "The startup score has been recalculated."
        });
      }
    } catch (error) {
      toast({
        title: "Error updating score",
        description: "There was a problem updating the startup score.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Function to determine score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };
  
  const getScoreTier = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Very Good";
    if (score >= 60) return "Good";
    if (score >= 50) return "Average";
    if (score >= 40) return "Below Average";
    if (score >= 30) return "Poor";
    return "Critical";
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Startup Scoring & Benchmarks</h1>
        <p className="text-muted-foreground">Track your startup's performance against industry benchmarks</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-xl font-bold">Performance Score</h2>
            <Button 
              variant="outline" 
              onClick={handleRefreshScore} 
              isLoading={isRefreshing || loading}
              iconLeft={<RefreshCw size={16} />} 
              size="sm"
            >
              Recalculate Score
            </Button>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
              <div>
                <div className="flex items-center gap-2">
                  <p className={`text-5xl font-bold ${getScoreColor(latestScore?.total_score || 0)}`}>
                    {latestScore?.total_score || 0}
                  </p>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
                <p className="text-lg font-medium mt-1">{getScoreTier(latestScore?.total_score || 0)}</p>
                <p className="text-sm text-muted-foreground mt-1">Last updated: {latestScore ? new Date(latestScore.calculation_date).toLocaleDateString() : 'Never'}</p>
              </div>
              
              <div className="flex items-center mt-4 md:mt-0">
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium">{companyData?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Industry</p>
                    <p className="font-medium">{companyData?.industry || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Founded</p>
                    <p className="font-medium">{companyData?.founded_year || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Employees</p>
                    <p className="font-medium">{companyData?.total_employees || 'Unknown'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Finance Score</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span><Info size={14} className="text-muted-foreground" /></span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Based on revenue, gross margin, cash on hand, and valuation.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="font-medium">{latestScore?.finance_score || 0}/100</span>
                </div>
                <Progress value={latestScore?.finance_score || 0} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Team Score</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span><Info size={14} className="text-muted-foreground" /></span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Based on team size and composition.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="font-medium">{latestScore?.team_score || 0}/100</span>
                </div>
                <Progress value={latestScore?.team_score || 0} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Growth Score</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span><Info size={14} className="text-muted-foreground" /></span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Based on growth rate and annual ROI.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="font-medium">{latestScore?.growth_score || 0}/100</span>
                </div>
                <Progress value={latestScore?.growth_score || 0} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Market Score</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span><Info size={14} className="text-muted-foreground" /></span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Based on market size and competition.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="font-medium">{latestScore?.market_score || 0}/100</span>
                </div>
                <Progress value={latestScore?.market_score || 0} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Product Score</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span><Info size={14} className="text-muted-foreground" /></span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Based on product readiness and innovation.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="font-medium">{latestScore?.product_score || 0}/100</span>
                </div>
                <Progress value={latestScore?.product_score || 0} className="h-2" />
              </div>
            </div>
          </div>
        </Card>
        
        <BenchmarkComparisonCard />
      </div>
      
      <Card>
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-bold">Detailed Metrics Analysis</h2>
        </div>
        <div className="p-4">
          {scoreDetails ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Your Value</TableHead>
                  <TableHead>Benchmark</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Weight</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(scoreDetails.details).map(([key, detail]) => (
                  <TableRow key={key}>
                    <TableCell className="font-medium">
                      {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </TableCell>
                    <TableCell>
                      {key.includes('revenue') || key.includes('valuation') || key.includes('cash') ? 
                        formatCurrency(detail.value || 0) : 
                        key.includes('margin') || key.includes('growth') || key.includes('roi') ? 
                          `${detail.value || 0}%` : 
                          detail.value?.toString() || '0'}
                    </TableCell>
                    <TableCell>
                      {key.includes('revenue') || key.includes('valuation') || key.includes('cash') ? 
                        formatCurrency(detail.benchmark) : 
                        key.includes('margin') || key.includes('growth') || key.includes('roi') ? 
                          `${detail.benchmark}%` : 
                          detail.benchmark.toString()}
                    </TableCell>
                    <TableCell>{detail.score.toFixed(1)}/100</TableCell>
                    <TableCell>{Math.round(detail.weight * 100)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Click "Recalculate Score" to see detailed metrics.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
