
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { FileUp, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

interface MetricItem {
  id: string;
  name: string;
  target: string;
  actual: string;
  unit: string;
}

// Mock API function to simulate saving metrics to a server
const saveMetricsToServer = async (data: any) => {
  console.log('Saving metrics to server:', data);
  
  // Actually save the metrics to the database
  const { month, year, metrics } = data;
  
  // For each metric, upsert a row in performance_metrics and performance_values
  for (const metric of metrics) {
    // First, ensure the metric exists in performance_metrics
    const { data: metricData, error: metricError } = await supabase
      .from('performance_metrics')
      .upsert({
        id: metric.id,
        name: metric.name,
        unit: metric.unit,
        is_default: true
      }, { onConflict: 'id' })
      .select('id')
      .single();
      
    if (metricError) {
      console.error('Error saving metric:', metricError);
      throw metricError;
    }
    
    // Then save the actual value
    const { error: valueError } = await supabase
      .from('performance_values')
      .upsert({
        metric_id: metricData.id,
        month: parseInt(month),
        year: parseInt(year),
        target: metric.target ? parseFloat(metric.target) : null,
        actual: metric.actual ? parseFloat(metric.actual) : null
      }, { onConflict: 'metric_id, month, year' });
      
    if (valueError) {
      console.error('Error saving metric value:', valueError);
      throw valueError;
    }
  }
  
  return { success: true };
};

// Mock API function to fetch saved metrics
const fetchSavedMetrics = async (month: string, year: string) => {
  console.log('Fetching metrics for', month, year);
  
  // First, get all default metrics
  const { data: metricsData, error: metricsError } = await supabase
    .from('performance_metrics')
    .select('*')
    .eq('is_default', true);
    
  if (metricsError) {
    console.error('Error fetching metrics:', metricsError);
    throw metricsError;
  }
  
  // Map month name to number
  const monthMap: Record<string, number> = {
    January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
    July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
  };
  
  const monthNum = monthMap[month];
  const yearNum = parseInt(year);
  
  // Then get values for the specific month and year
  const { data: valuesData, error: valuesError } = await supabase
    .from('performance_values')
    .select('*, performance_metrics(*)')
    .eq('month', monthNum)
    .eq('year', yearNum);
    
  if (valuesError) {
    console.error('Error fetching values:', valuesError);
    throw valuesError;
  }
  
  // If we have values, return them, otherwise create default entries based on metricsData
  if (valuesData && valuesData.length > 0) {
    return valuesData.map(value => ({
      id: value.metric_id,
      name: value.performance_metrics.name,
      target: value.target?.toString() || '',
      actual: value.actual?.toString() || '',
      unit: value.performance_metrics.unit
    }));
  } else {
    // Create default entries if no data exists yet
    return metricsData.map(metric => ({
      id: metric.id,
      name: metric.name,
      target: '',
      actual: '',
      unit: metric.unit
    }));
  }
};

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
  const [isAddMetricOpen, setIsAddMetricOpen] = useState(false);
  const [newMetric, setNewMetric] = useState({ name: '', unit: '' });
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [bulkData, setBulkData] = useState('');

  // Add function to ensure default metrics exist
  useEffect(() => {
    const ensureDefaultMetricsExist = async () => {
      // Check if default metrics exist
      const { data: existingMetrics, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .eq('is_default', true);
        
      if (error) {
        console.error('Error checking default metrics:', error);
        return;
      }
      
      // If no default metrics exist, create them
      if (!existingMetrics || existingMetrics.length === 0) {
        const defaultMetrics = [
          { name: 'Revenue', unit: '$', is_default: true },
          { name: 'Gross Margin', unit: '%', is_default: true },
          { name: 'Cash on Hand', unit: '$', is_default: true },
          { name: 'No. of Paying Customers', unit: '#', is_default: true }
        ];
        
        for (const metric of defaultMetrics) {
          await supabase.from('performance_metrics').insert(metric);
        }
        
        console.log('Default metrics created');
      }
    };
    
    ensureDefaultMetricsExist();
  }, []);

  // Query to fetch saved metrics based on selected month and year
  const { data: savedMetrics, isLoading } = useQuery({
    queryKey: ['metrics', selectedMonth, selectedYear],
    queryFn: () => fetchSavedMetrics(selectedMonth, selectedYear),
    enabled: !!selectedMonth && !!selectedYear,
  });

  // Update metrics when savedMetrics changes or month/year selection changes
  useEffect(() => {
    if (savedMetrics && savedMetrics.length > 0) {
      setMetrics(savedMetrics);
    } else {
      // Reset to default metrics with empty values when changing to a month with no saved data
      setMetrics([
        { id: '1', name: 'Revenue', target: '', actual: '', unit: '$' },
        { id: '2', name: 'Gross Margin', target: '', actual: '', unit: '%' },
        { id: '3', name: 'Cash on Hand', target: '', actual: '', unit: '$' },
        { id: '4', name: 'No. of Paying Customers', target: '', actual: '', unit: '#' },
      ]);
    }
  }, [savedMetrics, selectedMonth, selectedYear]);

  const handleInputChange = (metricId: string, field: 'target' | 'actual', value: string) => {
    setMetrics(metrics.map(metric => 
      metric.id === metricId ? { ...metric, [field]: value } : metric
    ));
  };

  const saveMetricsMutation = useMutation({
    mutationFn: async () => {
      const dataToSave = {
        month: selectedMonth,
        year: selectedYear,
        metrics
      };
      
      return await saveMetricsToServer(dataToSave);
    },
    onSuccess: () => {
      toast({
        title: "Performance metrics saved",
        description: `Metrics for ${selectedMonth} ${selectedYear} have been updated.`
      });
      
      // Update the cache with the new metrics
      queryClient.setQueryData(['metrics', selectedMonth, selectedYear], metrics);
      
      // Invalidate any related queries
      queryClient.invalidateQueries({ queryKey: ['performance-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['metrics-history'] });
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
    setIsAddMetricOpen(true);
  };

  const handleBulkUpload = () => {
    setIsBulkUploadOpen(true);
  };

  const submitNewMetric = () => {
    if (newMetric.name && newMetric.unit) {
      const newId = (metrics.length + 1).toString();
      setMetrics([...metrics, { 
        id: newId, 
        name: newMetric.name, 
        target: '', 
        actual: '', 
        unit: newMetric.unit 
      }]);
      
      setNewMetric({ name: '', unit: '' });
      setIsAddMetricOpen(false);
      
      toast({
        title: "Metric Added",
        description: `${newMetric.name} has been added to your metrics.`
      });
    } else {
      toast({
        title: "Error",
        description: "Please provide both a name and unit for the metric.",
        variant: "destructive"
      });
    }
  };

  const processBulkUpload = () => {
    try {
      // Simple CSV parsing for demonstration
      const rows = bulkData.split('\n');
      if (rows.length) {
        const newMetrics = [...metrics];
        
        rows.forEach(row => {
          const [name, target, actual, unit] = row.split(',').map(item => item.trim());
          if (name && unit) {
            // Check if metric already exists
            const existingIndex = newMetrics.findIndex(m => m.name.toLowerCase() === name.toLowerCase());
            
            if (existingIndex >= 0) {
              // Update existing metric
              newMetrics[existingIndex] = {
                ...newMetrics[existingIndex],
                target: target || newMetrics[existingIndex].target,
                actual: actual || newMetrics[existingIndex].actual,
                unit: unit || newMetrics[existingIndex].unit
              };
            } else {
              // Add new metric
              const newId = (newMetrics.length + 1).toString();
              newMetrics.push({ id: newId, name, target: target || '', actual: actual || '', unit });
            }
          }
        });
        
        setMetrics(newMetrics);
        setBulkData('');
        setIsBulkUploadOpen(false);
        
        toast({
          title: "Bulk Upload Successful",
          description: "Your metrics have been updated from the uploaded data."
        });
      }
    } catch (error) {
      toast({
        title: "Bulk Upload Failed",
        description: "There was an error processing your upload. Please check your format.",
        variant: "destructive"
      });
    }
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
        
        {isLoading ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">Loading metrics...</p>
          </div>
        ) : (
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
        )}
        
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
      
      {/* Add Metric Dialog */}
      <Dialog open={isAddMetricOpen} onOpenChange={setIsAddMetricOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Metric</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="metric-name" className="col-span-1">Name</Label>
              <Input 
                id="metric-name" 
                value={newMetric.name} 
                onChange={(e) => setNewMetric({...newMetric, name: e.target.value})}
                className="col-span-3" 
                placeholder="e.g., Customer Acquisition Cost"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="metric-unit" className="col-span-1">Unit</Label>
              <Input 
                id="metric-unit" 
                value={newMetric.unit} 
                onChange={(e) => setNewMetric({...newMetric, unit: e.target.value})}
                className="col-span-3" 
                placeholder="e.g., $, %, #"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMetricOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={submitNewMetric}>Add Metric</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Bulk Upload Dialog */}
      <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Upload Metrics</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              Enter your data in CSV format: Name,Target,Actual,Unit (one per line)
            </p>
            <textarea
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              rows={5}
              placeholder="Revenue,100000,95000,$&#10;Gross Margin,40,38,%"
              className="w-full border border-border rounded-md p-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkUploadOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={processBulkUpload}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
