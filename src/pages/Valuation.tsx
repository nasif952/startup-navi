
import { useToast } from '@/hooks/use-toast';
import { TrialExpirationBanner } from '@/components/valuation/TrialExpirationBanner';
import { ValuationTabs } from '@/components/valuation/ValuationTabs';
import { useValuationTrial } from '@/hooks/useValuationTrial';

export default function Valuation() {
  const { toast } = useToast();
  const trialInfo = useValuationTrial();
  
  return (
    <div className="space-y-6 animate-fade-in">
      <TrialExpirationBanner 
        daysRemaining={trialInfo.daysRemaining}
        hoursRemaining={trialInfo.hoursRemaining}
        minutesRemaining={trialInfo.minutesRemaining}
        secondsRemaining={trialInfo.secondsRemaining}
        progressPercentage={trialInfo.progressPercentage}
      />

      <ValuationTabs />
    </div>
  );
}
