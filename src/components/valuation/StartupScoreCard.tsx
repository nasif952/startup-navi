
import { Card } from '@/components/Card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/Button';
import { RefreshCw, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useStartupScore } from '@/hooks/useStartupScore';
import { useState } from 'react';

export function StartupScoreCard() {
  const { toast } = useToast();
  const { latestScore, calculateScore, loading } = useStartupScore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefreshScore = async () => {
    setIsRefreshing(true);
    try {
      await calculateScore();
      toast({
        title: "Score updated",
        description: "The startup score has been recalculated."
      });
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
  
  return (
    <Card className="p-0">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-lg">Startup Score</h3>
        <Button 
          variant="ghost" 
          onClick={handleRefreshScore} 
          isLoading={isRefreshing || loading}
          iconLeft={<RefreshCw size={16} />} 
          size="sm"
        >
          Refresh
        </Button>
      </div>
      
      <div className="p-4">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Your Startup Score</p>
            <p className={`text-4xl font-bold ${getScoreColor(latestScore?.total_score || 0)}`}>
              {latestScore?.total_score || 0}
            </p>
            <p className="text-xs text-muted-foreground">out of 100</p>
          </div>
          <Button 
            variant="link" 
            className="text-primary pb-1" 
            iconRight={<ChevronRight size={16} />}
            onClick={() => window.location.href = "/valuation?tab=benchmarks"}
          >
            View Details
          </Button>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Finance</span>
              <span className="text-sm font-medium">{latestScore?.finance_score || 0}/100</span>
            </div>
            <Progress value={latestScore?.finance_score || 0} className="h-2" />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Team</span>
              <span className="text-sm font-medium">{latestScore?.team_score || 0}/100</span>
            </div>
            <Progress value={latestScore?.team_score || 0} className="h-2" />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Growth</span>
              <span className="text-sm font-medium">{latestScore?.growth_score || 0}/100</span>
            </div>
            <Progress value={latestScore?.growth_score || 0} className="h-2" />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Market</span>
              <span className="text-sm font-medium">{latestScore?.market_score || 0}/100</span>
            </div>
            <Progress value={latestScore?.market_score || 0} className="h-2" />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Product</span>
              <span className="text-sm font-medium">{latestScore?.product_score || 0}/100</span>
            </div>
            <Progress value={latestScore?.product_score || 0} className="h-2" />
          </div>
        </div>
      </div>
    </Card>
  );
}
