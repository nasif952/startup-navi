
import { useState, useEffect } from 'react';

interface ValuationTrialInfo {
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  secondsRemaining: number;
  progressPercentage: number;
}

export function useValuationTrial(): ValuationTrialInfo {
  // For a real application, these values would come from an API
  // but for demo purposes, we'll use static values
  const [trialInfo] = useState<ValuationTrialInfo>({
    daysRemaining: 62,
    hoursRemaining: 3,
    minutesRemaining: 46,
    secondsRemaining: 11,
    progressPercentage: 14, // Represents completion of questionnaire (1 of 7 steps)
  });
  
  return trialInfo;
}
