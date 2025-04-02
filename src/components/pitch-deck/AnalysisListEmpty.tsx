
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/Button';
import { useNavigate } from 'react-router-dom';

export function AnalysisListEmpty() {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-1">No analyses found</h3>
      <p className="text-muted-foreground mb-6">
        Upload a pitch deck to start analyzing
      </p>
      <Button 
        variant="outline" 
        onClick={() => navigate('/pitch-deck-analysis/upload')}
      >
        Upload Pitch Deck
      </Button>
    </div>
  );
}
