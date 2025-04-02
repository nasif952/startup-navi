
import { Card } from '@/components/Card';
import { useStartupScore } from '@/hooks/useStartupScore';
import { useQuery } from '@tanstack/react-query';
import { extendedSupabase } from '@/integrations/supabase/client-extension';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { IndustryBenchmark } from '@/integrations/supabase/client-extension';

export function BenchmarkComparisonCard() {
  const { companyData } = useStartupScore();
  
  // Fetch benchmarks for the company's industry
  const { data: benchmarks, isLoading } = useQuery({
    queryKey: ['industry-benchmarks', companyData?.industry],
    queryFn: async () => {
      if (!companyData?.industry) return [];
      
      const { data, error } = await extendedSupabase
        .from('industry_benchmarks')
        .select('*')
        .eq('industry', companyData.industry);
        
      if (error) throw error;
      return data as IndustryBenchmark[] || [];
    },
    enabled: !!companyData?.industry,
  });
  
  const findBenchmark = (metric: string) => {
    if (!benchmarks) return null;
    return benchmarks.find(b => b.metric === metric);
  };
  
  const formatBenchmarkValue = (metric: string, value: number) => {
    if (metric === 'avg_valuation' || metric === 'avg_revenue') {
      return formatCurrency(value);
    } else if (metric === 'avg_growth_rate' || metric === 'avg_gross_margin') {
      return `${value}%`;
    } else {
      return value.toString();
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">Industry Benchmarks</h3>
          <p className="text-muted-foreground text-sm">Loading benchmarks...</p>
        </div>
      </Card>
    );
  }
  
  if (!benchmarks || benchmarks.length === 0) {
    return (
      <Card>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">Industry Benchmarks</h3>
          <p className="text-muted-foreground text-sm">No benchmark data available for {companyData?.industry || 'this industry'}.</p>
        </div>
      </Card>
    );
  }
  
  return (
    <Card>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-4">Industry Benchmarks: {companyData?.industry}</h3>
        
        <div className="space-y-4">
          <BenchmarkItem 
            label="Average Valuation"
            benchmark={findBenchmark('avg_valuation')}
          />
          
          <BenchmarkItem 
            label="Average Revenue"
            benchmark={findBenchmark('avg_revenue')}
          />
          
          <BenchmarkItem 
            label="Average Growth Rate"
            benchmark={findBenchmark('avg_growth_rate')}
          />
          
          <BenchmarkItem 
            label="Average Team Size"
            benchmark={findBenchmark('avg_team_size')}
          />
          
          <BenchmarkItem 
            label="Average Gross Margin"
            benchmark={findBenchmark('avg_gross_margin')}
          />
        </div>
      </div>
    </Card>
  );
}

interface BenchmarkItemProps {
  label: string;
  benchmark: IndustryBenchmark | null | undefined;
}

function BenchmarkItem({ label, benchmark }: BenchmarkItemProps) {
  if (!benchmark) return null;
  
  const formatValue = (metric: string, value: number) => {
    if (metric === 'avg_valuation' || metric === 'avg_revenue') {
      return formatCurrency(value);
    } else if (metric === 'avg_growth_rate' || metric === 'avg_gross_margin') {
      return `${value}%`;
    } else {
      return value.toString();
    }
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-medium">{formatValue(benchmark.metric, benchmark.value)}</span>
      </div>
    </div>
  );
}
