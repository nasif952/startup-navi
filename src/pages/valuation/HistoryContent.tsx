
import { useQuery } from '@tanstack/react-query';

export function HistoryContent() {
  const { data: valuationHistory, isLoading } = useQuery({
    queryKey: ['valuation-history'],
    queryFn: async () => {
      return [];
    }
  });
  
  if (isLoading) {
    return <div className="p-4 text-center">Loading history...</div>;
  }
  
  return (
    <div className="p-6 text-center animate-fade-in">
      <h2 className="text-xl font-medium mb-2">Valuation History</h2>
      <p className="text-muted-foreground">No history data available yet.</p>
    </div>
  );
}
