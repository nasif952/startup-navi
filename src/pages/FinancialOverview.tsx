
import { Card } from '@/components/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const financialData = [
  { month: '10/2024', Revenue: 0, 'Gross Margin': 0 },
  { month: '11/2024', Revenue: 0, 'Gross Margin': 0 },
  { month: '12/2024', Revenue: 0, 'Gross Margin': 0 },
  { month: '1/2025', Revenue: 0, 'Gross Margin': 0 },
  { month: '2/2025', Revenue: 0, 'Gross Margin': 0 }
];

const forecastData = [
  { year: '2025', value: 0 },
  { year: '2026', value: 0 },
  { year: '2027', value: 0 }
];

export default function FinancialOverview() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-2">Financial Overview</h1>
        <p className="text-muted-foreground">Track and analyze your company's financial performance</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FinancialMetricCard 
          title="Revenue This Month" 
          value="$0.00" 
          target="0% vs. Target" 
          lastMonth="0% vs. Last Month" 
        />
        <FinancialMetricCard 
          title="Gross Margin This Month" 
          value="0%" 
          target="0% vs. Target" 
          lastMonth="0% vs. Last Month" 
        />
        <FinancialMetricCard 
          title="Cash on Hand This Month" 
          value="$0.00" 
          target="0% vs. Target" 
          lastMonth="0% vs. Last Month" 
        />
        <FinancialMetricCard 
          title="No. of Paying Customers This Month" 
          value="0" 
          target="0% vs. Target" 
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
                <Tooltip />
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
                <Tooltip />
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
          <p className="text-3xl font-bold">0</p>
        </Card>
        
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Market Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-primary font-medium mb-1">Total Addressable Market</h3>
              <p className="text-muted-foreground">N/A</p>
            </div>
            <div>
              <h3 className="text-primary font-medium mb-1">Annual Growth Rate</h3>
              <p className="text-muted-foreground">N/A</p>
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
