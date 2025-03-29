
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/Button';
import { Plus } from 'lucide-react';
import { MetricInfoCard } from './MetricInfoCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface CustomMetric {
  id: string;
  title: string;
  description: string;
  unit: string;
  category: string;
}

export function CustomMetricsTab() {
  const { toast } = useToast();
  const [isAddMetricOpen, setIsAddMetricOpen] = useState(false);
  const [newMetric, setNewMetric] = useState<Partial<CustomMetric>>({
    title: '',
    description: '',
    unit: '',
    category: 'Financial'
  });
  
  // Default categories
  const categories = [
    'Financial Transactions & KPIs',
    'Sales Traction & KPIs',
    'Marketing Traction & KPIs'
  ];
  
  // State for custom metrics
  const [customMetrics, setCustomMetrics] = useState<CustomMetric[]>([]);
  
  const handleAddCustomMetric = () => {
    setIsAddMetricOpen(true);
  };
  
  const submitNewMetric = () => {
    if (newMetric.title && newMetric.description && newMetric.unit && newMetric.category) {
      const newMetricObj = {
        id: Date.now().toString(),
        title: newMetric.title,
        description: newMetric.description,
        unit: newMetric.unit,
        category: newMetric.category
      };
      
      setCustomMetrics([...customMetrics, newMetricObj]);
      
      // Reset form
      setNewMetric({
        title: '',
        description: '',
        unit: '',
        category: 'Financial'
      });
      
      setIsAddMetricOpen(false);
      
      toast({
        title: "Custom Metric Added",
        description: `"${newMetric.title}" has been added to your custom metrics.`
      });
    } else {
      toast({
        title: "Error",
        description: "Please fill in all fields to add a custom metric.",
        variant: "destructive"
      });
    }
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
            {customMetrics
              .filter(metric => metric.category === 'Financial Transactions & KPIs')
              .map(metric => (
                <MetricInfoCard 
                  key={metric.id}
                  title={metric.title} 
                  description={metric.description} 
                  unit={metric.unit}
                />
              ))
            }
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
            {customMetrics
              .filter(metric => metric.category === 'Sales Traction & KPIs')
              .map(metric => (
                <MetricInfoCard 
                  key={metric.id}
                  title={metric.title} 
                  description={metric.description} 
                  unit={metric.unit}
                />
              ))
            }
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
            {customMetrics
              .filter(metric => metric.category === 'Marketing Traction & KPIs')
              .map(metric => (
                <MetricInfoCard 
                  key={metric.id}
                  title={metric.title} 
                  description={metric.description} 
                  unit={metric.unit}
                />
              ))
            }
          </div>
        </div>
      </div>
      
      {/* Add Custom Metric Dialog */}
      <Dialog open={isAddMetricOpen} onOpenChange={setIsAddMetricOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Custom Metric</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="metric-title" className="col-span-1">Title</Label>
              <Input 
                id="metric-title" 
                value={newMetric.title} 
                onChange={(e) => setNewMetric({...newMetric, title: e.target.value})}
                className="col-span-3" 
                placeholder="e.g., Customer Lifetime Value"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="metric-description" className="col-span-1">Description</Label>
              <Textarea 
                id="metric-description" 
                value={newMetric.description} 
                onChange={(e) => setNewMetric({...newMetric, description: e.target.value})}
                className="col-span-3" 
                placeholder="How this metric is calculated or what it represents"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="metric-unit" className="col-span-1">Unit</Label>
              <Input 
                id="metric-unit" 
                value={newMetric.unit} 
                onChange={(e) => setNewMetric({...newMetric, unit: e.target.value})}
                className="col-span-3" 
                placeholder="e.g., Currency, Percentage, Numbers"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="metric-category" className="col-span-1">Category</Label>
              <select
                id="metric-category"
                value={newMetric.category}
                onChange={(e) => setNewMetric({...newMetric, category: e.target.value})}
                className="col-span-3 w-full rounded-md border border-input p-2"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMetricOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={submitNewMetric}>Add Metric</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
