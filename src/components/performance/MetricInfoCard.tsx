
import { Card } from '@/components/Card';

interface MetricInfoCardProps {
  title: string;
  description: string;
  unit: string;
}

export function MetricInfoCard({ title, description, unit }: MetricInfoCardProps) {
  return (
    <Card>
      <h4 className="font-medium mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <p className="text-xs text-primary">{unit}</p>
    </Card>
  );
}
