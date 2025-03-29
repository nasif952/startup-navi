import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/Card';
import { DataTable } from '@/components/DataTable';
import { Check, Eye, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock API function to fetch performance history data
const fetchPerformanceHistory = async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return [
    { id: '1', month: '2', year: '2025', createdOn: '27 Mar 2025', updatedOn: '27 Mar 2025', status: true },
    { id: '2', month: '1', year: '2025', createdOn: '27 Mar 2025', updatedOn: '27 Mar 2025', status: true },
    { id: '3', month: '12', year: '2024', createdOn: '27 Mar 2025', updatedOn: '27 Mar 2025', status: false },
    { id: '4', month: '11', year: '2024', createdOn: '27 Mar 2025', updatedOn: '27 Mar 2025', status: true },
    { id: '5', month: '10', year: '2024', createdOn: '27 Mar 2025', updatedOn: '27 Mar 2025', status: false },
    { id: '6', month: '9', year: '2024', createdOn: '27 Mar 2025', updatedOn: '27 Mar 2025', status: false },
  ];
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

// Mock data for charts
const generateMetricData = (tab: string): ChartData => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  
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
    ];
  } else {
    // 'both' tab - combine data
    return [
      { month: 'Oct 2024', revenue: 48000, margin: 31, customers: 180 },
      { month: 'Nov 2024', revenue: 52000, margin: 32, customers: 195 },
      { month: 'Dec 2024', revenue: 55000, margin: 33, customers: 210 },
      { month: 'Jan 2025', revenue: 58000, margin: 34, customers: 220 },
      { month: 'Feb 2025', revenue: 62000, margin: 35, customers: 235 },
      { month: 'Mar 2025', revenue: 67000, margin: 36, customers: 250 },
    ];
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
  
  const chartData = generateMetricData(activePerformanceTab);
  
  const handleViewDetails = (recordId: string) => {
    const record = performanceHistory?.find(r => r.id === recordId);
    
    if (record) {
      toast({
        title: "Performance Record",
        description: `Viewing details for ${record.month}/${record.year}`
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
            <p className="text-muted-foreground">27 Mar 2025</p>
          </div>
          
          {isLoading ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Loading history data...</p>
            </div>
          ) : (
            <DataTable
              columns={[
                { key: 'monthYear', header: 'Month - Year', render: (_, row) => `${row.month} - ${row.year}` },
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
