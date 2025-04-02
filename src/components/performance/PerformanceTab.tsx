
import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { DataTable } from '@/components/DataTable';
import { Check, X, Eye } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// Define the PerformanceHistoryItem interface
interface PerformanceHistoryItem {
  id: string;
  month: number;
  year: number;
  createdOn: string;
  updatedOn: string;
  status: boolean;
}

// Define the MetricData interface for chart data
interface MetricData {
  id: string;
  name: string;
  data: Array<{
    month: string;
    value: number;
  }>;
}

// Type guard function to check if the data is a MetricData array
function isMetricDataArray(data: unknown): data is MetricData[] {
  return Array.isArray(data) && data.length > 0 && 'name' in data[0] && 'data' in data[0];
}

// Helper function to convert month number to name
function getMonthName(monthNum: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthNum - 1] || '';
}

export function PerformanceTab() {
  const [activePerformanceTab, setActivePerformanceTab] = useState('selectMetrics');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [chartData, setChartData] = useState<unknown>([]);
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data - in a real app, this would be fetched from an API
    const fetchData = async () => {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (activePerformanceTab === 'selectMetrics') {
        // Data for individual metrics
        const metricsData: MetricData[] = [
          {
            id: '1',
            name: 'Revenue',
            data: [
              { month: 'Jan', value: 5000 },
              { month: 'Feb', value: 7000 },
              { month: 'Mar', value: 6500 },
              { month: 'Apr', value: 9000 },
              { month: 'May', value: 11000 },
              { month: 'Jun', value: 12000 },
            ]
          },
          {
            id: '2',
            name: 'GrossMargin',
            data: [
              { month: 'Jan', value: 45 },
              { month: 'Feb', value: 48 },
              { month: 'Mar', value: 50 },
              { month: 'Apr', value: 52 },
              { month: 'May', value: 55 },
              { month: 'Jun', value: 58 },
            ]
          },
          {
            id: '3',
            name: 'Customers',
            data: [
              { month: 'Jan', value: 50 },
              { month: 'Feb', value: 65 },
              { month: 'Mar', value: 75 },
              { month: 'Apr', value: 90 },
              { month: 'May', value: 100 },
              { month: 'Jun', value: 115 },
            ]
          },
          {
            id: '4',
            name: 'CAC',
            data: [
              { month: 'Jan', value: 80 },
              { month: 'Feb', value: 75 },
              { month: 'Mar', value: 72 },
              { month: 'Apr', value: 68 },
              { month: 'May', value: 65 },
              { month: 'Jun', value: 62 },
            ]
          },
          {
            id: '5',
            name: 'Runway',
            data: [
              { month: 'Jan', value: 9 },
              { month: 'Feb', value: 10 },
              { month: 'Mar', value: 11 },
              { month: 'Apr', value: 12 },
              { month: 'May', value: 14 },
              { month: 'Jun', value: 16 },
            ]
          }
        ];
        
        setChartData(metricsData);
      } else {
        // Combined data for other tabs
        const combinedData = [
          { month: 'Jan', revenue: 5000, margin: 45, customers: 50 },
          { month: 'Feb', revenue: 7000, margin: 48, customers: 65 },
          { month: 'Mar', revenue: 6500, margin: 50, customers: 75 },
          { month: 'Apr', revenue: 9000, margin: 52, customers: 90 },
          { month: 'May', revenue: 11000, margin: 55, customers: 100 },
          { month: 'Jun', revenue: 12000, margin: 58, customers: 115 },
        ];
        
        setChartData(combinedData);
      }
      
      // Mock history data
      const historyData: PerformanceHistoryItem[] = [
        { id: '1', month: 6, year: 2023, createdOn: '2023-06-15', updatedOn: '2023-06-20', status: true },
        { id: '2', month: 5, year: 2023, createdOn: '2023-05-12', updatedOn: '2023-05-18', status: true },
        { id: '3', month: 4, year: 2023, createdOn: '2023-04-10', updatedOn: '2023-04-15', status: true },
        { id: '4', month: 3, year: 2023, createdOn: '2023-03-08', updatedOn: '2023-03-14', status: false }
      ];
      
      setPerformanceHistory(historyData);
      setIsLoading(false);
    };
    
    fetchData();
  }, [activePerformanceTab]);
  
  // Handler for details view
  const handleViewDetails = (id: string) => {
    console.log('View details for:', id);
    // Implementation would go here - show modal, navigate to details page, etc.
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
          <LineChart data={chartData as any[]}>
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
                  render: (_, row: PerformanceHistoryItem) => `${getMonthName(row.month)} - ${row.year}` 
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
                  render: (_, row: PerformanceHistoryItem) => (
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
