
/**
 * Returns the title of a questionnaire step based on its number
 */
export function getStepTitle(stepNumber: number): string | null {
  const stepTitles = [
    'Team', 'Product', 'Market', 'Business Model', 'Competition', 'Financials', 'Future'
  ];
  return stepTitles[stepNumber - 1] || null;
}

/**
 * Checks if all required questions in a questionnaire have been answered
 */
export function areAllQuestionsAnswered(questions: any[]): boolean {
  return questions.every(q => q.response && q.response.trim() !== '');
}

/**
 * Creates the steps array for StepProgress component
 */
export function createStepsArray(totalSteps: number, currentStep: number): Array<{number: number, label: string, isActive: boolean}> {
  return Array.from({ length: totalSteps }, (_, i) => {
    const stepNumber = i + 1;
    return { 
      number: stepNumber, 
      label: getStepTitle(stepNumber) || `Step ${stepNumber}`,
      isActive: stepNumber === currentStep
    };
  });
}
