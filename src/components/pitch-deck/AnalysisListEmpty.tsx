
import { AlertCircle } from 'lucide-react';

export function AnalysisListEmpty() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8">
      <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-1">No analyses found</h3>
      <p className="text-muted-foreground mb-4">
        Upload a pitch deck to start analyzing
      </p>
    </div>
  );
}
