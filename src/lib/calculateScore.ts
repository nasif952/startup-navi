
import { extendedSupabase } from "@/integrations/supabase/client-extension";
import { supabase } from "@/integrations/supabase/client";

interface CompanyData {
  total_employees?: number | null;
  founded_year?: number | null;
  last_revenue?: number | null;
  industry?: string | null;
}

interface PerformanceData {
  revenue?: number | null;
  gross_margin?: number | null;
  cash_on_hand?: number | null;
  customers?: number | null;
}

interface ValuationData {
  pre_money_valuation?: number | null;
  selected_valuation?: number | null;
  annual_roi?: number | null;
}

export interface ScoreData {
  totalScore: number;
  growthScore: number;
  teamScore: number;
  financeScore: number;
  marketScore: number;
  productScore: number;
  details: {
    [key: string]: {
      score: number;
      benchmark: number;
      value: number | null;
      percentage: number;
      weight: number;
    };
  };
}

// Function to calculate the startup score based on available metrics
export async function calculateStartupScore(
  companyData: CompanyData,
  performanceData: PerformanceData,
  valuationData: ValuationData
): Promise<ScoreData> {
  // Fetch relevant benchmarks for the company's industry
  const industry = companyData.industry || 'Business Support Services';
  
  const { data: benchmarks } = await extendedSupabase
    .from('industry_benchmarks')
    .select('*')
    .eq('industry', industry);
  
  // Create a mapping of benchmark metrics
  const benchmarkMap: Record<string, number> = {};
  if (benchmarks) {
    benchmarks.forEach(benchmark => {
      benchmarkMap[benchmark.metric] = benchmark.value;
    });
  }
  
  // Define metric weights for each category
  const weights = {
    // Finance metrics (30% of total)
    revenue: 0.10,
    gross_margin: 0.10,
    cash_on_hand: 0.05,
    valuation: 0.05,
    
    // Team metrics (15% of total)
    team_size: 0.15,
    
    // Growth metrics (25% of total)
    annual_roi: 0.10,
    growth_rate: 0.15,
    
    // Market metrics (15% of total)
    market_size: 0.15,
    
    // Product metrics (15% of total)
    product_readiness: 0.15,
  };
  
  // Calculate scores per metric
  const details: ScoreData['details'] = {};
  
  // Revenue score
  const revenueValue = performanceData.revenue || 0;
  const revenueBenchmark = benchmarkMap['avg_revenue'] || 350000;
  const revenuePercentage = Math.min(revenueValue / revenueBenchmark, 1.5) * 100;
  const revenueScore = Math.min(100, revenuePercentage);
  
  details['revenue'] = {
    score: revenueScore,
    benchmark: revenueBenchmark,
    value: revenueValue,
    percentage: revenuePercentage,
    weight: weights.revenue,
  };
  
  // Gross margin score
  const marginValue = performanceData.gross_margin || 0;
  const marginBenchmark = benchmarkMap['avg_gross_margin'] || 65;
  const marginPercentage = (marginValue / marginBenchmark) * 100;
  const marginScore = Math.min(100, marginPercentage);
  
  details['gross_margin'] = {
    score: marginScore,
    benchmark: marginBenchmark,
    value: marginValue,
    percentage: marginPercentage,
    weight: weights.gross_margin,
  };
  
  // Team size score
  const teamSizeValue = companyData.total_employees || 0;
  const teamSizeBenchmark = benchmarkMap['avg_team_size'] || 15;
  const teamSizePercentage = (teamSizeValue / teamSizeBenchmark) * 100;
  const teamSizeScore = Math.min(100, teamSizePercentage);
  
  details['team_size'] = {
    score: teamSizeScore,
    benchmark: teamSizeBenchmark,
    value: teamSizeValue,
    percentage: teamSizePercentage,
    weight: weights.team_size,
  };
  
  // Valuation score
  const valuationValue = valuationData.selected_valuation || 0;
  const valuationBenchmark = benchmarkMap['avg_valuation'] || 1500000;
  const valuationPercentage = (valuationValue / valuationBenchmark) * 100;
  const valuationScore = Math.min(100, valuationPercentage);
  
  details['valuation'] = {
    score: valuationScore,
    benchmark: valuationBenchmark,
    value: valuationValue,
    percentage: valuationPercentage,
    weight: weights.valuation,
  };
  
  // Growth rate score
  const growthRateValue = valuationData.annual_roi || 0;
  const growthRateBenchmark = benchmarkMap['avg_growth_rate'] || 25;
  const growthRatePercentage = (growthRateValue / growthRateBenchmark) * 100;
  const growthRateScore = Math.min(100, growthRatePercentage);
  
  details['growth_rate'] = {
    score: growthRateScore,
    benchmark: growthRateBenchmark,
    value: growthRateValue,
    percentage: growthRatePercentage,
    weight: weights.growth_rate,
  };
  
  // For other metrics where we don't have actual data, use default values for now
  details['cash_on_hand'] = {
    score: 70,
    benchmark: 150000,
    value: performanceData.cash_on_hand || 0,
    percentage: 70,
    weight: weights.cash_on_hand,
  };
  
  details['annual_roi'] = {
    score: 65,
    benchmark: 20,
    value: valuationData.annual_roi || 0,
    percentage: 65,
    weight: weights.annual_roi,
  };
  
  details['market_size'] = {
    score: 80,
    benchmark: 5000000,
    value: 4000000,
    percentage: 80,
    weight: weights.market_size,
  };
  
  details['product_readiness'] = {
    score: 75,
    benchmark: 100,
    value: 75,
    percentage: 75,
    weight: weights.product_readiness,
  };
  
  // Calculate category scores
  const financeScore = (
    details['revenue'].score * (weights.revenue / 0.3) +
    details['gross_margin'].score * (weights.gross_margin / 0.3) +
    details['cash_on_hand'].score * (weights.cash_on_hand / 0.3) +
    details['valuation'].score * (weights.valuation / 0.3)
  );
  
  const teamScore = details['team_size'].score;
  
  const growthCategoryScore = (
    details['growth_rate'].score * (weights.growth_rate / 0.25) +
    details['annual_roi'].score * (weights.annual_roi / 0.25)
  );
  
  const marketScore = details['market_size'].score;
  
  const productScore = details['product_readiness'].score;
  
  // Calculate total score
  const totalScore = (
    details['revenue'].score * weights.revenue +
    details['gross_margin'].score * weights.gross_margin +
    details['cash_on_hand'].score * weights.cash_on_hand +
    details['valuation'].score * weights.valuation +
    details['team_size'].score * weights.team_size +
    details['growth_rate'].score * weights.growth_rate +
    details['annual_roi'].score * weights.annual_roi +
    details['market_size'].score * weights.market_size +
    details['product_readiness'].score * weights.product_readiness
  );
  
  return {
    totalScore: Math.round(totalScore),
    growthScore: Math.round(growthCategoryScore),
    teamScore: Math.round(teamScore),
    financeScore: Math.round(financeScore),
    marketScore: Math.round(marketScore),
    productScore: Math.round(productScore),
    details,
  };
}

// Save the score to the database
export async function saveStartupScore(
  companyId: string, 
  scoreData: ScoreData
): Promise<void> {
  try {
    await extendedSupabase
      .from('startup_scores')
      .upsert({
        company_id: companyId,
        total_score: scoreData.totalScore,
        growth_score: scoreData.growthScore,
        team_score: scoreData.teamScore,
        finance_score: scoreData.financeScore,
        market_score: scoreData.marketScore,
        product_score: scoreData.productScore,
        calculation_date: new Date().toISOString(),
      }, { onConflict: 'company_id' });
  } catch (error) {
    console.error('Error saving startup score:', error);
    throw error;
  }
}
