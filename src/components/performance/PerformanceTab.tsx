
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/Card';
import { DataTable } from '@/components/DataTable';
import { Eye, X } from 'lucide-react';

// Performance history data
const performanceHistory = [
  { id: '1', month: '2', year: '2025', createdOn: '27 Mar 2025', updatedOn: '27 Mar 2025', status: false },
  { id: '2', month: '1', year: '2025', createdOn: '27 Mar 2025', updatedOn: '27 Mar 2025', status: false },
  { id: '3', month: '12', year: '2024', createdOn: '27 Mar 2025', updatedOn: '27 Mar 2025', status: false },
  { id: '4', month: '11', year: '2024', createdOn: '27 Mar 2025', updatedOn: '27 Mar 2025', status: false },
  { id: '5', month: '10', year: '2024', createdOn: '27 Mar 2025', updatedOn: '27 Mar 2025', status: false },
  { id: '6', month: '9', year: '2024', createdOn: '27 Mar 2025', updatedOn: '27 Mar 2025', status: false },
];

export function PerformanceTab() {
  const [activePerformanceTab, setActivePerformanceTab] = useState('selectMetrics');
  const { toast } = useToast();
  
  const handleViewDetails = (recordId: string) => {
    toast({
      title: "View Performance Record",
      description: `Viewing details for record ID: ${recordId}`
    });
  };
  
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
            data={performanceHistory}
            emptyState="No history data available"
          />
        </Card>
      </div>
    </div>
  );
}
