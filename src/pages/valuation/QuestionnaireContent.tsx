
import { useState } from 'react';
import { Button } from '@/components/Button';
import { StepProgress } from '@/components/StepProgress';
import { Loader2, ChevronRight, PlusCircle } from 'lucide-react';
import { AddQuestionDialog } from '@/components/dialogs/AddQuestionDialog';
import { createStepsArray, getStepTitle } from '@/utils/questionnaire-utils';
import { useQuestionnaireData } from '@/hooks/useQuestionnaireData';
import { QuestionsList } from '@/components/valuation/QuestionsList';
import { useQueryClient } from '@tanstack/react-query';

interface QuestionnaireContentProps {
  setActiveTab: (tab: string) => void;
}

export function QuestionnaireContent({ setActiveTab }: QuestionnaireContentProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const queryClient = useQueryClient();
  
  const { 
    questionnaireData, 
    loadingQuestionnaire, 
    isSaving,
    handleResponseChange,
    handleSaveAndNext,
    getLastQuestionNumber
  } = useQuestionnaireData(currentStep);
  
  const steps = createStepsArray(7, currentStep);
  
  const handleQuestionAdded = () => {
    queryClient.invalidateQueries({ queryKey: ['questionnaire', currentStep] });
  };
  
  if (loadingQuestionnaire) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading questionnaire...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Questionnaire Progress</h1>
        <p className="text-muted-foreground mb-6">Attract investors with an optimized Valuation! Let's continue →</p>
        
        <StepProgress steps={steps} currentStep={currentStep} className="mb-8" />
        
        <div className="flex justify-between items-center mb-6 border-b border-border pb-3">
          <h2 className="text-xl font-semibold">
            Step {currentStep}: {getStepTitle(currentStep)}
          </h2>
          
          {questionnaireData?.questionnaire && (
            <AddQuestionDialog
              trigger={
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <PlusCircle size={16} />
                  <span>Add Question</span>
                </Button>
              }
              questionnaireId={questionnaireData.questionnaire.id}
              lastQuestionNumber={getLastQuestionNumber()}
              onQuestionAdded={handleQuestionAdded}
            />
          )}
        </div>
      </div>
      
      {questionnaireData?.questionnaire && (
        <QuestionsList
          questions={questionnaireData.questions}
          questionnaireId={questionnaireData.questionnaire.id}
          currentStep={currentStep}
          lastQuestionNumber={getLastQuestionNumber()}
          onQuestionAdded={handleQuestionAdded}
          onResponseChange={handleResponseChange}
        />
      )}
      
      <div className="flex justify-between pt-6">
        <Button 
          variant="outline"
          disabled={currentStep === 1 || isSaving}
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
        >
          Back
        </Button>
        <Button 
          onClick={() => {
            handleSaveAndNext();
            
            if (currentStep < 7) {
              setCurrentStep(currentStep + 1);
            } else {
              setActiveTab('valuation');
            }
          }}
          isLoading={isSaving}
          iconRight={<ChevronRight size={16} />}
        >
          {currentStep === 7 ? "Complete & Calculate" : "Save and Next"}
        </Button>
      </div>
    </div>
  );
}
