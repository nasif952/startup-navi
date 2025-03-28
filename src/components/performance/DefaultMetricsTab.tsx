
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { FileUp, Plus } from 'lucide-react';

interface MetricItem {
  id: string;
  name: string;
  target: string;
  actual: string;
  unit: string;
}

export function DefaultMetricsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState('March');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [metrics, setMetrics] = useState<MetricItem[]>([
    { id: '1', name: 'Revenue', target: '', actual: '', unit: '$' },
    { id: '2', name: 'Gross Margin', target: '', actual: '', unit: '%' },
    { id: '3', name: 'Cash on Hand', target: '', actual: '', unit: '$' },
    { id: '4', name: 'No. of Paying Customers', target: '', actual: '', unit: '#' },
  ]);

  const handleInputChange = (metricId: string, field: 'target' | 'actual', value: string) => {
    setMetrics(metrics.map(metric => 
      metric.id === metricId ? { ...metric, [field]: value } : metric
    ));
  };

  const saveMetricsMutation = useMutation({
    mutationFn: async () => {
      // For demonstration, we'll log the data that would be saved
      console.log('Saving metrics:', { month: selectedMonth, year: selectedYear, metrics });
      
      // Mock successful API call
      return new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      toast({
        title: "Performance metrics saved",
        description: `Metrics for ${selectedMonth} ${selectedYear} have been updated.`
      });
      
      // Refresh any relevant query data
      queryClient.invalidateQueries({ queryKey: ['performance-metrics'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save metrics",
        description: error.message || "An error occurred while saving the metrics",
        variant: "destructive"
      });
    }
  });

  const handleSaveMetrics = () => {
    saveMetricsMutation.mutate();
  };

  const handleAddMetric = () => {
    toast({
      title: "Add Metric",
      description: "This functionality will allow you to add a custom metric to your default list."
    });
  };

  const handleBulkUpload = () => {
    toast({
      title: "Bulk Upload",
      description: "This functionality will allow you to upload multiple metrics at once."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">My Default Metrics</h2>
        <div className="flex space-x-2">
          <Button variant="primary" size="sm" iconLeft={<Plus size={16} />} onClick={handleAddMetric}>Add Metric</Button>
          <Button variant="outline" size="sm" iconLeft={<FileUp size={16} />} onClick={handleBulkUpload}>Bulk Upload</Button>
        </div>
      </div>
      
      <Card>
        <div className="flex justify-end space-x-4 mb-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Month</label>
            <select
              className="w-36 rounded-md border border-border p-2"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option>March</option>
              <option>February</option>
              <option>January</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Year</label>
            <select
              className="w-36 rounded-md border border-border p-2"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
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
            {metrics.map((metric, index) => (
              <tr key={metric.id} className={index < metrics.length - 1 ? "border-b border-border" : ""}>
                <td className="py-3 px-4">{index + 1}</td>
                <td className="py-3 px-4">{metric.name}</td>
                <td className="py-3 px-4">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">{metric.unit}</span>
                    <input 
                      type="text" 
                      className="w-full border border-border rounded-md p-2 pl-8" 
                      value={metric.target}
                      onChange={(e) => handleInputChange(metric.id, 'target', e.target.value)}
                    />
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">{metric.unit}</span>
                    <input 
                      type="text" 
                      className="w-full border border-border rounded-md p-2 pl-8" 
                      value={metric.actual}
                      onChange={(e) => handleInputChange(metric.id, 'actual', e.target.value)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="flex justify-end mt-6">
          <Button 
            variant="primary" 
            onClick={handleSaveMetrics}
            isLoading={saveMetricsMutation.isPending}
          >
            Save
          </Button>
        </div>
      </Card>
    </div>
  );
}
