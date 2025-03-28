
import { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { DataTable } from '@/components/DataTable';
import { Eye, FileUp, Plus, X } from 'lucide-react';

const performanceHistory = [
  { month: '2', year: '2025', createdOn: '27 Mar 2025', updatedOn: '27 Mar 2025', status: false },
  { month: '1', year: '2025', createdOn: '27 Mar 2025', updatedOn: '27 Mar 2025', status: false },
  { month: '12', year: '2024', createdOn: '27 Mar 2025', updatedOn: '27 Mar 2025', status: false },
  { month: '11', year: '2024', createdOn: '27 Mar 2025', updatedOn: '27 Mar 2025', status: false },
  { month: '10', year: '2024', createdOn: '27 Mar 2025', updatedOn: '27 Mar 2025', status: false },
  { month: '9', year: '2024', createdOn: '27 Mar 2025', updatedOn: '27 Mar 2025', status: false },
];

export default function Performance() {
  const [activeTab, setActiveTab] = useState('update');
  const [activePerformanceTab, setActivePerformanceTab] = useState('selectMetrics');
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-2">Performance</h1>
        <p className="text-muted-foreground">Track and update your key performance metrics</p>
      </div>
      
      <div className="flex border-b border-border mb-6">
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'update' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('update')}
        >
          Update
        </button>
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'metrics' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('metrics')}
        >
          Metrics
        </button>
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'custom' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('custom')}
        >
          Custom
        </button>
      </div>
      
      {activeTab === 'update' && <DefaultMetricsTab />}
      {activeTab === 'metrics' && <PerformanceTab />}
      {activeTab === 'custom' && <CustomMetricsTab />}
    </div>
  );
}

function DefaultMetricsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">My Default Metrics</h2>
        <div className="flex space-x-2">
          <Button variant="primary" size="sm" iconLeft={<Plus size={16} />}>Add Metric</Button>
          <Button variant="outline" size="sm" iconLeft={<FileUp size={16} />}>Bulk Upload</Button>
        </div>
      </div>
      
      <Card>
        <div className="flex justify-end space-x-4 mb-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Month</label>
            <select className="w-36 rounded-md border border-border p-2">
              <option>March</option>
              <option>February</option>
              <option>January</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Year</label>
            <select className="w-36 rounded-md border border-border p-2">
              <option>2025</option>
              <option>2024</option>
            </select>
          </div>
        </div>
        
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="text-left py-3 px-4">#</th>
              <th className="text-left py-3 px-4">Metric</th>
              <th className="text-left py-3 px-4">Target</th>
              <th className="text-left py-3 px-4">Actuals</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-3 px-4">1</td>
              <td className="py-3 px-4">Revenue</td>
              <td className="py-3 px-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <input type="text" className="w-full border border-border rounded-md p-2 pl-8" />
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <input type="text" className="w-full border border-border rounded-md p-2 pl-8" />
                </div>
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-3 px-4">2</td>
              <td className="py-3 px-4">Gross Margin</td>
              <td className="py-3 px-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                  <input type="text" className="w-full border border-border rounded-md p-2 pl-8" />
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                  <input type="text" className="w-full border border-border rounded-md p-2 pl-8" />
                </div>
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-3 px-4">3</td>
              <td className="py-3 px-4">Cash on Hand</td>
              <td className="py-3 px-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <input type="text" className="w-full border border-border rounded-md p-2 pl-8" />
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <input type="text" className="w-full border border-border rounded-md p-2 pl-8" />
                </div>
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4">4</td>
              <td className="py-3 px-4">No. of Paying Customers</td>
              <td className="py-3 px-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">#</span>
                  <input type="text" className="w-full border border-border rounded-md p-2 pl-8" />
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">#</span>
                  <input type="text" className="w-full border border-border rounded-md p-2 pl-8" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div className="flex justify-end mt-6">
          <Button variant="primary">Save</Button>
        </div>
      </Card>
    </div>
  );
}

function PerformanceTab() {
  const [activePerformanceTab, setActivePerformanceTab] = useState('selectMetrics');
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Performance</h2>
        
        <div className="flex border rounded-md overflow-hidden mb-6">
          {['selectMetrics', 'monthly', '2025', 'both'].map((tab, index) => {
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
                key={index}
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
        
        <Card className="h-80 flex items-center justify-center mb-6">
          <p className="text-muted-foreground">No data available</p>
        </Card>
      </div>
      
      <div>
        <h2 className="text-xl font-bold mb-4">History</h2>
        
        <Card>
          <div className="mb-4">
            <p className="font-medium">Last Updated</p>
            <p className="text-muted-foreground">27 Mar 2025</p>
          </div>
          
          <DataTable
            columns={[
              { key: 'monthYear', header: 'Month - Year', render: (_, row) => `${row.month} - ${row.year}` },
              { key: 'createdOn', header: 'Created On' },
              { key: 'updatedOn', header: 'Updated On' },
              { 
                key: 'status', 
                header: 'Status',
                render: (value) => (
                  <span className="text-destructive">
                    <X size={18} />
                  </span>
                ) 
              },
              { 
                key: 'view', 
                header: 'View',
                render: () => (
                  <button className="text-primary hover:text-primary/80">
                    <Eye size={18} />
                  </button>
                ) 
              },
            ]}
            data={performanceHistory}
            emptyState="No history data available"
          />
        </Card>
      </div>
    </div>
  );
}

function CustomMetricsTab() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Core Metrics</h2>
          <Button variant="primary" size="sm" iconLeft={<Plus size={16} />}>Add Custom Metric</Button>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-primary mb-4">1. Financial Transactions & KPIs</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricInfoCard 
              title="Revenue" 
              description="Revenue is the income generated from normal business operations" 
              unit="Currency" 
            />
            <MetricInfoCard 
              title="MRR - Monthly Recurring Revenue" 
              description="Average Revenue per Account (Monthly) * Total # of Customers" 
              unit="Currency" 
            />
            <MetricInfoCard 
              title="Revenue Growth" 
              description="[(Revenue this month - Revenue Last Month)/Revenue Last Month] * 100" 
              unit="Percentage" 
            />
            <MetricInfoCard 
              title="Cost of Sales" 
              description="All costs used to create a product or service, which has been sold" 
              unit="Currency" 
            />
            <MetricInfoCard 
              title="Gross Margin" 
              description="[(Total Revenue - Cost of Goods Sold)/Total Revenue] * 100" 
              unit="Percentage" 
            />
            <MetricInfoCard 
              title="EBIT" 
              description="Revenue - COGS - Operating Expenses" 
              unit="Currency" 
            />
            <MetricInfoCard 
              title="Net Profit" 
              description="Revenue - COGS - Operating Expenses - Interest - Tax" 
              unit="Currency" 
            />
            <MetricInfoCard 
              title="Burn Rate" 
              description="Cash payments - cash collections" 
              unit="Currency" 
            />
          </div>
          
          <h3 className="text-lg font-semibold text-primary mb-4">2. Sales Traction & KPIs</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricInfoCard 
              title="Runway" 
              description="Cash Balance / Monthly Burn Rate" 
              unit="Numbers" 
            />
            <MetricInfoCard 
              title="Cash on Hand" 
              description="Refer to actual cash in a company" 
              unit="Currency" 
            />
            <MetricInfoCard 
              title="No of Paying Customers" 
              description="A customer who buys something" 
              unit="Numbers" 
            />
            <MetricInfoCard 
              title="Customer Cost Acquisition (CAC)" 
              description="Total Sales and Marketing Expenses/New Customer Acquired" 
              unit="Currency" 
            />
          </div>
          
          <h3 className="text-lg font-semibold text-primary mb-4">3. Marketing Traction & KPIs</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricInfoCard 
              title="Retention Rate" 
              description="[Ending Customers - New Customers] * Beginning Customers-1 - Churn Rate (%)" 
              unit="Percentage" 
            />
            <MetricInfoCard 
              title="Churn Rate" 
              description="Total Customers churned in this time period/Total customers at the start of this time period * 100" 
              unit="Percentage" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricInfoCardProps {
  title: string;
  description: string;
  unit: string;
}

function MetricInfoCard({ title, description, unit }: MetricInfoCardProps) {
  return (
    <Card>
      <h4 className="font-medium mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <p className="text-xs text-primary">{unit}</p>
    </Card>
  );
}
