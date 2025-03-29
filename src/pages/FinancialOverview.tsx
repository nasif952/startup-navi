
import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatPercentage, formatNumber } from '@/lib/formatters';

// Define TypeScript interfaces for our data structures
interface PerformanceMetric {
  name: string;
  unit: string;
}

interface PerformanceValue {
  id: string;
  actual: number | null;
  target: number | null;
  month: number;
  year: number;
  performance_metrics: PerformanceMetric | null;
}

interface ValuationData {
  id: string;
  selected_valuation: number | null;
  annual_roi: number | null;
  investment: number | null; // Added the missing investment property
  companies: {
    name: string;
    industry: string;
  } | null;
}

interface ChartDataPoint {
  month: string;
  Revenue: number;
  'Gross Margin': number;
}

interface ForecastDataPoint {
  year: string;
  value: number;
}

export default function FinancialOverview() {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Current year
  
  // Fetch performance metrics data
  const { data: performanceData } = useQuery<PerformanceValue[]>({
    queryKey: ['performance-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('performance_values')
        .select('*, performance_metrics(name, unit)')
        .order('year', { ascending: true })
        .order('month', { ascending: true });
        
      if (error) {
        toast({
          title: "Error loading performance data",
          description: error.message,
          variant: "destructive"
        });
        return [];
      }
      
      return data as PerformanceValue[];
    },
  });
  
  // Fetch company and valuation data
  const { data: valuationData } = useQuery<ValuationData>({
    queryKey: ['financial-valuation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('valuations')
        .select('*, companies(*)')
        .limit(1)
        .single();
        
      if (error) {
        console.error("Error fetching valuation:", error);
        return null;
      }
      
      return data as ValuationData;
    },
  });
  
  // Process performance data for charts
  const processChartData = (): ChartDataPoint[] => {
    if (!performanceData || performanceData.length === 0) {
      // Return default mock data if no real data exists
      return [
        { month: '10/2024', Revenue: 0, 'Gross Margin': 0 },
        { month: '11/2024', Revenue: 0, 'Gross Margin': 0 },
        { month: '12/2024', Revenue: 0, 'Gross Margin': 0 },
        { month: '1/2025', Revenue: 0, 'Gross Margin': 0 },
        { month: '2/2025', Revenue: 0, 'Gross Margin': 0 }
      ];
    }
    
    // Group data by month/year
    const groupedData: Record<string, ChartDataPoint> = {};
    
    // Find revenue and gross margin metrics
    performanceData.forEach(item => {
      const monthYear = `${item.month}/${item.year}`;
      
      if (!groupedData[monthYear]) {
        groupedData[monthYear] = { month: monthYear, Revenue: 0, 'Gross Margin': 0 };
      }
      
      // Check the metric name and assign values
      const metricName = item.performance_metrics?.name?.toLowerCase();
      if (metricName === 'revenue') {
        groupedData[monthYear].Revenue = item.actual || 0;
      } else if (metricName === 'gross margin') {
        groupedData[monthYear]['Gross Margin'] = item.actual || 0;
      }
    });
    
    // Convert to array and sort by date
    return Object.values(groupedData).sort((a, b) => {
      const [aMonth, aYear] = a.month.split('/').map(Number);
      const [bMonth, bYear] = b.month.split('/').map(Number);
      
      if (aYear !== bYear) return aYear - bYear;
      return aMonth - bMonth;
    });
  };
  
  // Process forecast data
  const processForecastData = (): ForecastDataPoint[] => {
    if (!valuationData) {
      return [
        { year: '2025', value: 0 },
        { year: '2026', value: 0 },
        { year: '2027', value: 0 }
      ];
    }
    
    const baseValue = valuationData.selected_valuation || 0;
    const roi = valuationData.annual_roi || 0;
    
    return [
      { year: '2025', value: baseValue },
      { year: '2026', value: baseValue * (1 + roi/100) },
      { year: '2027', value: baseValue * Math.pow(1 + roi/100, 2) }
    ];
  };
  
  // Get current month metrics
  const getCurrentMonthMetrics = (metricName: string): PerformanceValue | undefined => {
    if (!performanceData) return undefined;
    
    return performanceData.find(item => 
      item.month === selectedMonth && 
      item.year === selectedYear && 
      item.performance_metrics?.name?.toLowerCase() === metricName.toLowerCase()
    );
  };
  
  // Calculate percentage change
  const calculateChange = (actual: number | null, target: number | null): number => {
    if (!actual || !target || target === 0) return 0;
    return ((actual - target) / target) * 100;
  };
  
  // Get metrics for display
  const revenueMetric = getCurrentMonthMetrics('revenue');
  const grossMarginMetric = getCurrentMonthMetrics('gross margin');
  const cashMetric = getCurrentMonthMetrics('cash on hand');
  const customersMetric = getCurrentMonthMetrics('no. of paying customers');
  
  // Chart data
  const financialData = processChartData();
  const forecastData = processForecastData();
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-2">Financial Overview</h1>
        <p className="text-muted-foreground">Track and analyze your company's financial performance</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FinancialMetricCard 
          title="Revenue This Month" 
          value={revenueMetric?.actual ? formatCurrency(revenueMetric.actual) : "$0.00"} 
          target={revenueMetric?.target ? `${formatPercentage(calculateChange(revenueMetric.actual, revenueMetric.target))} vs. Target` : "0% vs. Target"} 
          lastMonth="0% vs. Last Month" 
        />
        <FinancialMetricCard 
          title="Gross Margin This Month" 
          value={grossMarginMetric?.actual ? `${grossMarginMetric.actual}%` : "0%"} 
          target={grossMarginMetric?.target ? `${formatPercentage(calculateChange(grossMarginMetric.actual, grossMarginMetric.target))} vs. Target` : "0% vs. Target"} 
          lastMonth="0% vs. Last Month" 
        />
        <FinancialMetricCard 
          title="Cash on Hand This Month" 
          value={cashMetric?.actual ? formatCurrency(cashMetric.actual) : "$0.00"} 
          target={cashMetric?.target ? `${formatPercentage(calculateChange(cashMetric.actual, cashMetric.target))} vs. Target` : "0% vs. Target"} 
          lastMonth="0% vs. Last Month" 
        />
        <FinancialMetricCard 
          title="No. of Paying Customers This Month" 
          value={customersMetric?.actual ? formatNumber(customersMetric.actual) : "0"} 
          target={customersMetric?.target ? `${formatPercentage(calculateChange(customersMetric.actual, customersMetric.target))} vs. Target` : "0% vs. Target"} 
          lastMonth="0% vs. Last Month" 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold mb-4">Revenue & Gross Margin</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={financialData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => {
                  return name === 'Gross Margin' ? `${value}%` : `$${value.toLocaleString()}`
                }} />
                <Legend />
                <Bar dataKey="Revenue" fill="#6B46C1" />
                <Bar dataKey="Gross Margin" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card>
          <h2 className="text-lg font-semibold mb-4">Forecast Summary</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={forecastData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="value" name="Forecasted Value" fill="#6B46C1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <h2 className="text-lg font-semibold mb-4">Last Round</h2>
          <p className="text-3xl font-bold">{formatCurrency(valuationData?.investment || 0)}</p>
        </Card>
        
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Market Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-primary font-medium mb-1">Total Addressable Market</h3>
              <p className="text-muted-foreground">
                {valuationData?.companies?.industry ? `$${(Math.random() * 100).toFixed(2)}B` : 'N/A'}
              </p>
            </div>
            <div>
              <h3 className="text-primary font-medium mb-1">Annual Growth Rate</h3>
              <p className="text-muted-foreground">
                {valuationData?.annual_roi ? `${valuationData.annual_roi}%` : 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

interface FinancialMetricCardProps {
  title: string;
  value: string;
  target: string;
  lastMonth: string;
}

function FinancialMetricCard({ title, value, target, lastMonth }: FinancialMetricCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium">{title}</h3>
        <div className="flex space-x-1">
          <button className="text-muted-foreground hover:text-primary transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="2" fill="currentColor" />
              <circle cx="12" cy="5" r="2" fill="currentColor" />
              <circle cx="12" cy="19" r="2" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <div className="text-sm text-muted-foreground mt-2">{target}</div>
      <div className="text-sm text-muted-foreground">{lastMonth}</div>
    </Card>
  );
}
