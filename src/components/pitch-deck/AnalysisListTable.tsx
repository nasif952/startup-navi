
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight } from 'lucide-react';

interface Analysis {
  id: string;
  title: string;
  status: string;
  upload_date: string;
  overall_score: number | null;
}

interface AnalysisListTableProps {
  analyses: Analysis[];
}

export function AnalysisListTable({ analyses }: AnalysisListTableProps) {
  const navigate = useNavigate();
  
  const columns = [
    {
      key: 'title',
      header: 'Title',
      className: 'w-1/3',
      render: (value: string) => (
        <div className="flex items-center">
          <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: 'upload_date',
      header: 'Date',
      className: 'w-1/6',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'w-1/6',
      render: (value: string) => (
        <Badge variant={value === 'completed' ? 'default' : value === 'processing' ? 'outline' : 'destructive'}>
          {value === 'completed' ? 'Completed' : 
           value === 'processing' ? 'Processing' : 
           value === 'pending' ? 'Pending' : 'Failed'}
        </Badge>
      ),
    },
    {
      key: 'overall_score',
      header: 'Score',
      className: 'w-1/6',
      render: (value: number | null) => {
        if (value === null) return 'N/A';
        return (
          <span className={value >= 7 ? 'text-green-500' : value >= 5 ? 'text-amber-500' : 'text-red-500'}>
            {value}/10
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-1/6 text-right',
      render: (_: any, item: Analysis) => (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(`/pitch-deck-analysis/${item.id}`)}
          disabled={item.status !== 'completed'}
        >
          View
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <DataTable 
      columns={columns} 
      data={analyses} 
      emptyState="No analyses found"
      exportFilename="pitch-deck-analyses"
    />
  );
}
