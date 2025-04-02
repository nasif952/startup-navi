import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/Card';
import { DataTable } from '@/components/DataTable';
import { Check, Eye, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

// Function to get month name from month number (1-12)
const getMonthName = (month: number): string => {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return monthNames[month - 1];
};

// Function to fetch performance history data
const fetchPerformanceHistory = async () => {
  try {
    const { data, error } = await supabase
      .from('performance_values')
      .select('*, performance_metrics(name, unit)')
      .order('year', { ascending: false })
      .order('month', { ascending: false });
      
    if (error) throw error;
    
    // Group by month/year for display
    const groupedData = data.reduce((acc, item) => {
      const key = `${item.month}-${item.year}`;
      if (!acc[key]) {
        acc[key] = {
          id: key,
          month: item.month,
          year: item.year,
          createdOn: new Date(item.created_at).toLocaleDateString(),
          updatedOn: new Date(item.updated_at || item.created_at).toLocaleDateString(),
          status: Boolean(item.actual), // Consider it complete if there's an actual value
        };
      }
      return acc;
    }, {});
    
    return Object.values(groupedData);
  } catch (error) {
    console.error("Error fetching performance history:", error);
    // Return mock data if real data fetch fails
    return [
      { id: '1', month: 4, year: 2025, createdOn: '02 Apr 2025', updatedOn: '02 Apr 2025', status: true },
      { id: '2', month: 3, year: 2025, createdOn: '27 Mar 2025', updatedOn: '27 Mar 2025', status: true },
      { id: '3', month: 2, year: 2025, createdOn: '27 Feb 2025', updatedOn: '27 Feb 2025', status: true },
      { id: '4', month: 1, year: 2025, createdOn: '27 Jan 2025', updatedOn: '27 Jan 2025', status: false },
      { id: '5', month: 12, year: 2024, createdOn: '27 Dec 2024', updatedOn: '27 Dec 2024', status: true },
      { id: '6', month: 11, year: 2024, createdOn: '27 Nov 2024', updatedOn: '27 Nov 2024', status: false },
    ];
  }
};

// Define types for our chart data
type MetricData = {
  month: string;
  value: number;
};

type SingleMetric = {
  id: string;
  name: string;
  data: MetricData[];
};

type CombinedDataPoint = {
  month: string;
  revenue: number;
  margin: number;
  customers: number;
};

type ChartData = SingleMetric[] | CombinedDataPoint[];

// Function to fetch metrics data for charts
const fetchMetricsChartData = async (tab: string): Promise<ChartData> => {
  try {
    // Get current date to determine range
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();
    
    // Calculate the last 6 months
    let months = [];
    let month = currentMonth;
    let year = currentYear;
    
    for (let i = 0; i < 6; i++) {
      months.push({ month, year });
      month--;
      if (month === 0) {
        month = 12;
        year--;
      }
    }
    
    // Reverse to get chronological order
    months.reverse();
    
    if (tab === 'selectMetrics') {
      // Fetch revenue and margin data
      const { data, error } = await supabase
        .from('performance_values')
        .select('*, performance_metrics(name, unit)')
        .in('month', months.map(m => m.month))
        .in('year', [...new Set(months.map(m => m.year))]) // Get unique years
        .in('performance_metrics.name', ['Revenue', 'Gross Margin']);
        
      if (error) throw error;
      
      // Organize data by metric
      const metricsMap: Record<string, SingleMetric> = {};
      
      data.forEach(item => {
        const metricName = item.performance_metrics.name;
        if (!metricsMap[metricName]) {
          metricsMap[metricName] = {
            id: item.metric_id,
            name: metricName,
            data: []
          };
        }
        
        metricsMap[metricName].data.push({
          month: `${getMonthName(item.month)} ${item.year}`,
          value: item.actual || 0
        });
      });
      
      // Fill in missing months with zero values
      months.forEach(({ month, year }) => {
        const monthStr = `${getMonthName(month)} ${year}`;
        
        Object.values(metricsMap).forEach(metric => {
          if (!metric.data.find(d => d.month === monthStr)) {
            metric.data.push({ month: monthStr, value: 0 });
          }
        });
      });
      
      // Sort data chronologically
      Object.values(metricsMap).forEach(metric => {
        metric.data.sort((a, b) => {
          const [aMonth, aYear] = a.month.split(' ');
          const [bMonth, bYear] = b.month.split(' ');
          if (aYear !== bYear) return Number(aYear) - Number(bYear);
          return months.findIndex(m => getMonthName(m.month) === aMonth) - 
                 months.findIndex(m => getMonthName(m.month) === bMonth);
        });
      });
      
      return Object.values(metricsMap);
      
    } else {
      // For monthly, 2025, both tabs - fetch all metrics
      const { data, error } = await supabase
        .from('performance_values')
        .select('*, performance_metrics(name, unit)')
        .in('month', months.map(m => m.month))
        .in('year', [...new Set(months.map(m => m.year))])
        .in('performance_metrics.name', ['Revenue', 'Gross Margin', 'No. of Paying Customers']);
        
      if (error) throw error;
      
      // Create combined data points
      const combinedData: Record<string, CombinedDataPoint> = {};
      
      months.forEach(({ month, year }) => {
        const monthKey = `${getMonthName(month)} ${year}`;
        combinedData[monthKey] = {
          month: monthKey,
          revenue: 0,
          margin: 0,
          customers: 0
        };
      });
      
      // Fill in actual data
      data.forEach(item => {
        const monthKey = `${getMonthName(item.month)} ${item.year}`;
        const metricName = item.performance_metrics.name;
        
        if (metricName === 'Revenue') {
          combinedData[monthKey].revenue = item.actual || 0;
        } else if (metricName === 'Gross Margin') {
          combinedData[monthKey].margin = item.actual || 0;
        } else if (metricName === 'No. of Paying Customers') {
          combinedData[monthKey].customers = item.actual || 0;
        }
      });
      
      // Filter data based on the tab
      let filteredData = Object.values(combinedData);
      
      if (tab === '2025') {
        filteredData = filteredData.filter(item => item.month.includes('2025'));
      } else if (tab === 'monthly') {
        // Keep all data for monthly view
      } else {
        // 'both' tab - keep all data
      }
      
      // Sort chronologically
      filteredData.sort((a, b) => {
        const [aMonth, aYear] = a.month.split(' ');
        const [bMonth, bYear] = b.month.split(' ');
        if (aYear !== bYear) return Number(aYear) - Number(bYear);
        return months.findIndex(m => getMonthName(m.month) === aMonth) - 
               months.findIndex(m => getMonthName(m.month) === bMonth);
      });
      
      return filteredData;
    }
    
  } catch (error) {
    console.error("Error fetching chart data:", error);
    
    // Return mock data
    const months = ['Nov 2024', 'Dec 2024', 'Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025'];
    
    if (tab === 'selectMetrics') {
      return [
        { id: '1', name: 'Revenue', data: months.map((month, i) => ({ month, value: 50000 + Math.random() * 20000 })) },
        { id: '2', name: 'Gross Margin', data: months.map((month, i) => ({ month, value: 30 + Math.random() * 10 })) }
      ];
    } else if (tab === 'monthly') {
      return months.map(month => ({
        month,
        revenue: 50000 + Math.random() * 20000,
        margin: 30 + Math.random() * 10,
        customers: 200 + Math.round(Math.random() * 50)
      }));
    } else if (tab === '2025') {
      return [
        { month: 'Jan 2025', revenue: 58000, margin: 34, customers: 220 },
        { month: 'Feb 2025', revenue: 62000, margin: 35, customers: 235 },
        { month: 'Mar 2025', revenue: 67000, margin: 36, customers: 250 },
        { month: 'Apr 2025', revenue: 71000, margin: 37, customers: 265 },
      ];
    } else {
      // 'both' tab - combine data
      return [
        { month: 'Nov 2024', revenue: 48000, margin: 31, customers: 180 },
        { month: 'Dec 2024', revenue: 52000, margin: 32, customers: 195 },
        { month: 'Jan 2025', revenue: 58000, margin: 34, customers: 220 },
        { month: 'Feb 2025', revenue: 62000, margin: 35, customers: 235 },
        { month: 'Mar 2025', revenue: 67000, margin: 36, customers: 250 },
        { month: 'Apr 2025', revenue: 71000, margin: 37, customers: 265 },
      ];
    }
  }
};

// Type guard to check if data is in SingleMetric format
function isMetricDataArray(data: ChartData): data is SingleMetric[] {
  return data.length > 0 && 'name' in data[0] && 'data' in data[0];
}

export function PerformanceTab() {
  const [activePerformanceTab, setActivePerformanceTab] = useState('selectMetrics');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['Revenue']);
  const { toast } = useToast();
  
  const { data: performanceHistory, isLoading } = useQuery({
    queryKey: ['metrics-history'],
    queryFn: fetchPerformanceHistory,
  });
  
  const { data: chartData = [] } = useQuery({
    queryKey: ['metrics-chart', activePerformanceTab],
    queryFn: () => fetchMetricsChartData(activePerformanceTab),
  });
  
  const handleViewDetails = (recordId: string) => {
    const record = performanceHistory?.find(r => r.id === recordId);
    
    if (record) {
      toast({
        title: "Performance Record",
        description: `Viewing details for ${getMonthName(record.month)} ${record.year}`
      });
    }
  };
  
  const renderChartContent = () => {
    if (activePerformanceTab === 'selectMetrics') {
      const availableMetrics = [
        { id: 'Revenue', label: 'Revenue' },
        { id: 'GrossMargin', label: 'Gross Margin' },
        { id: 'Customers', label: 'Customers' },
        { id: 'CAC', label: 'Customer Acquisition Cost' },
        { id: 'Runway', label: 'Runway' }
      ];
      
      return (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {availableMetrics.map(metric => (
              <button
                key={metric.id}
                className={`px-3 py-1 text-sm rounded-full ${
                  selectedMetrics.includes(metric.id)
                    ? 'bg-primary text-white'
                    : 'bg-muted text-foreground'
                }`}
                onClick={() => {
                  if (selectedMetrics.includes(metric.id)) {
                    setSelectedMetrics(selectedMetrics.filter(m => m !== metric.id));
                  } else {
                    setSelectedMetrics([...selectedMetrics, metric.id]);
                  }
                }}
              >
                {metric.label}
              </button>
            ))}
          </div>
          
          {selectedMetrics.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  type="category"
                  allowDuplicatedCategory={false}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                {isMetricDataArray(chartData) && 
                  chartData
                    .filter(metric => selectedMetrics.includes(metric.name))
                    .map((metric, index) => (
                      <Line 
                        key={metric.id}
                        data={metric.data} 
                        dataKey="value" 
                        name={metric.name}
                        stroke={index === 0 ? "#8884d8" : "#82ca9d"}
                      />
                    ))
                }
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-16 text-muted-foreground">Select metrics to display</p>
          )}
        </div>
      );
    } else {
      // For monthly, 2025, and both tabs
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
            <Line type="monotone" dataKey="margin" stroke="#82ca9d" name="Margin %" />
            <Line type="monotone" dataKey="customers" stroke="#ffc658" name="Customers" />
          </LineChart>
        </ResponsiveContainer>
      );
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Performance</h2>
        
        <div className="flex border rounded-md overflow-hidden mb-6">
          {['selectMetrics', 'monthly', '2025', 'both'].map((tab) => {
            const isActive = tab === activePerformanceTab;
            const label = tab === 'selectMetrics' 
              ? 'Select Metrics' 
              : tab === 'monthly' 
                ? 'Monthly' 
                : tab === 'both' 
                  ? 'Both' 
                  : tab;
                  
            return (
              <button
                key={tab}
                className={`py-2 px-4 ${
                  isActive 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-muted-foreground hover:bg-muted/50'
                }`}
                onClick={() => setActivePerformanceTab(tab)}
              >
                {label}
              </button>
            );
          })}
        </div>
        
        <Card className="mb-6 p-4">
          {renderChartContent()}
        </Card>
      </div>
      
      <div>
        <h2 className="text-xl font-bold mb-4">History</h2>
        
        <Card>
          <div className="mb-4 p-4">
            <p className="font-medium">Last Updated</p>
            <p className="text-muted-foreground">
              {performanceHistory && performanceHistory.length > 0 
                ? performanceHistory[0].updatedOn
                : new Date().toLocaleDateString()}
            </p>
          </div>
          
          {isLoading ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Loading history data...</p>
            </div>
          ) : (
            <DataTable
              columns={[
                { 
                  key: 'monthYear', 
                  header: 'Month - Year', 
                  render: (_, row) => `${getMonthName(row.month)} - ${row.year}` 
                },
                { key: 'createdOn', header: 'Created On' },
                { key: 'updatedOn', header: 'Updated On' },
                { 
                  key: 'status', 
                  header: 'Status',
                  render: (value) => (
                    <span className={value ? "text-green-600" : "text-destructive"}>
                      {value ? <Check size={18} /> : <X size={18} />}
                    </span>
                  ) 
                },
                { 
                  key: 'view', 
                  header: 'View',
                  render: (_, row) => (
                    <button 
                      className="text-primary hover:text-primary/80"
                      onClick={() => handleViewDetails(row.id)}
                    >
                      <Eye size={18} />
                    </button>
                  ) 
                },
              ]}
              data={performanceHistory || []}
              emptyState="No history data available"
            />
          )}
        </Card>
      </div>
    </div>
  );
}
