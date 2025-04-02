
import { Button } from '@/components/Button';
import { Progress } from '@/components/ui/progress';

interface TrialExpirationBannerProps {
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  secondsRemaining: number;
  progressPercentage: number;
}

export function TrialExpirationBanner({
  daysRemaining,
  hoursRemaining,
  minutesRemaining,
  secondsRemaining,
  progressPercentage
}: TrialExpirationBannerProps) {
  return (
    <div className="bg-destructive text-destructive-foreground px-4 py-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div className="space-y-1">
        <p className="text-sm">Your Valuation Free Trial is Expiring in {daysRemaining}d {hoursRemaining}h {minutesRemaining}m {secondsRemaining}s</p>
        <Progress value={progressPercentage} className="h-2 w-full max-w-xs" />
      </div>
      <Button variant="primary" className="bg-white text-destructive hover:bg-white/90 whitespace-nowrap">Upgrade Now</Button>
    </div>
  );
}
