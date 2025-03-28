
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/Button';
import { Plus } from 'lucide-react';
import { MetricInfoCard } from './MetricInfoCard';

export function CustomMetricsTab() {
  const { toast } = useToast();
  
  const handleAddCustomMetric = () => {
    toast({
      title: "Add Custom Metric",
      description: "This functionality will allow you to create a new custom metric"
    });
  };
  
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Core Metrics</h2>
          <Button 
            variant="primary" 
            size="sm" 
            iconLeft={<Plus size={16} />}
            onClick={handleAddCustomMetric}
          >
            Add Custom Metric
          </Button>
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
