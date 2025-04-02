import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3, PieChart, TrendingUp, DollarSign, Users, Briefcase, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/formatters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InvestmentPortfolio } from '@/components/investor/InvestmentPortfolio';
import { InvestmentMetrics } from '@/components/investor/InvestmentMetrics';
import { FundingRounds } from '@/components/investor/FundingRounds';

export default function InvestorDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch investments data
  const { data: investments, isLoading: investmentsLoading } = useQuery({
    queryKey: ['investments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investments')
        .select(`
          id, 
          capital_invested, 
          number_of_shares, 
          share_price,
          shareholders(id, name),
          share_classes(id, name)
        `);
      
      if (error) {
        toast({
          title: "Error loading investments",
          description: error.message,
          variant: "destructive"
        });
        return [];
      }
      
      return data || [];
    },
  });
  
  // Fetch funding rounds data
  const { data: fundingRounds, isLoading: roundsLoading } = useQuery({
    queryKey: ['funding-rounds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('funding_rounds')
        .select('*, round_summaries(*)');
      
      if (error) {
        console.error("Error fetching funding rounds:", error);
        return [];
      }
      
      return data || [];
    },
  });

  // Fetch valuation data
  const { data: valuation } = useQuery({
    queryKey: ['valuation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('valuations')
        .select('*')
        .limit(1)
        .single();
      
      if (error) {
        console.error("Error fetching valuation:", error);
        return null;
      }
      
      return data;
    },
  });

  // Calculate key metrics
  const totalInvestment = investments?.reduce((sum, inv) => 
    sum + (inv.capital_invested || 0), 0) || 0;
  
  const totalShares = investments?.reduce((sum, inv) => 
    sum + (inv.number_of_shares || 0), 0) || 0;
  
  const averageSharePrice = totalShares > 0 ? totalInvestment / totalShares : 0;
  
  const uniqueInvestors = investments?.reduce((investors, inv) => {
    if (inv.shareholders && !investors.includes(inv.shareholders.name)) {
      investors.push(inv.shareholders.name);
    }
    return investors;
  }, [] as string[]) || [];
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-2">Investor Dashboard</h1>
        <p className="text-muted-foreground">Track investments and portfolio performance</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Investment" 
          value={formatCurrency(totalInvestment)}
          icon={<DollarSign className="h-4 w-4" />}
          trend={{ value: "12%", isPositive: true }}
        />
        
        <MetricCard 
          title="Company Valuation" 
          value={formatCurrency(valuation?.selected_valuation || 0)}
          icon={<TrendingUp className="h-4 w-4" />}
          trend={{ value: "8%", isPositive: true }}
        />
        
        <MetricCard 
          title="Total Shares" 
          value={totalShares.toLocaleString()}
          icon={<Briefcase className="h-4 w-4" />}
          trend={{ value: "3%", isPositive: true }}
        />
        
        <MetricCard 
          title="Investors" 
          value={uniqueInvestors.length.toString()}
          icon={<Users className="h-4 w-4" />}
          trend={{ value: "2", isPositive: true, isNumber: true }}
        />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="portfolio">Investment Portfolio</TabsTrigger>
          <TabsTrigger value="rounds">Funding Rounds</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Shares Distribution</CardTitle>
                <CardDescription>Distribution of shares across investors</CardDescription>
              </CardHeader>
              <CardContent>
                <InvestmentMetrics investments={investments || []} />
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Investment Growth</CardTitle>
                <CardDescription>Cumulative investment over time</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <InvestmentGrowthChart fundingRounds={fundingRounds || []} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="portfolio">
          <Card>
            <CardHeader>
              <CardTitle>Investment Portfolio</CardTitle>
              <CardDescription>Detailed breakdown of all investments</CardDescription>
            </CardHeader>
            <CardContent>
              <InvestmentPortfolio investments={investments || []} isLoading={investmentsLoading} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rounds">
          <Card>
            <CardHeader>
              <CardTitle>Funding Rounds</CardTitle>
              <CardDescription>History of all funding rounds</CardDescription>
            </CardHeader>
            <CardContent>
              <FundingRounds rounds={fundingRounds || []} isLoading={roundsLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// MetricCard Component
interface TrendProps {
  value: string;
  isPositive: boolean;
  isNumber?: boolean;
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: TrendProps;
}

function MetricCard({ title, value, icon, trend }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline">
              <h3 className="text-2xl font-bold">{value}</h3>
              <div className={`ml-2 flex items-center text-xs ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {trend.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                <span className="ml-0.5">
                  {trend.isNumber ? `+${trend.value}` : trend.value}
                </span>
              </div>
            </div>
          </div>
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Investment Growth Chart Component
interface InvestmentGrowthChartProps {
  fundingRounds: any[];
}

function InvestmentGrowthChart({ fundingRounds }: InvestmentGrowthChartProps) {
  if (!fundingRounds.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">No funding rounds data available</p>
      </div>
    );
  }
  
  // In a real implementation, you would use a charting library like recharts
  // This is a placeholder for the chart
  return (
    <div className="h-full flex items-center justify-center">
      <p>Chart will be implemented with real data</p>
    </div>
  );
}
