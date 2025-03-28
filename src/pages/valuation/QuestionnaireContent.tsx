
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/Button';
import { StepProgress } from '@/components/StepProgress';
import { Input } from '@/components/ui/input';
import { ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { createStepsArray, getStepTitle, areAllQuestionsAnswered } from '@/utils/questionnaire-utils';

interface QuestionnaireContentProps {
  setActiveTab: (tab: string) => void;
}

export function QuestionnaireContent({ setActiveTab }: QuestionnaireContentProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  
  const { data: questionnaireData, isLoading: loadingQuestionnaire } = useQuery({
    queryKey: ['questionnaire'],
    queryFn: async () => {
      const { data: questionnaires, error: questionnaireError } = await supabase
        .from('questionnaires')
        .select('*')
        .limit(1)
        .single();
      
      if (questionnaireError) {
        toast({
          title: "Error loading questionnaire",
          description: questionnaireError.message,
          variant: "destructive"
        });
        return null;
      }
      
      const { data: questions, error: questionsError } = await supabase
        .from('questionnaire_questions')
        .select('*')
        .eq('questionnaire_id', questionnaires.id)
        .order('question_number');
      
      if (questionsError) {
        toast({
          title: "Error loading questions",
          description: questionsError.message,
          variant: "destructive"
        });
        return null;
      }
      
      return {
        questionnaire: questionnaires,
        questions: questions
      };
    }
  });
  
  const saveResponsesMutation = useMutation({
    mutationFn: async ({ questionId, response }: { questionId: string, response: string | number | boolean }) => {
      const { data, error } = await supabase
        .from('questionnaire_questions')
        .update({ response: response.toString() })
        .eq('id', questionId)
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaire'] });
    },
    onError: (error) => {
      toast({
        title: "Error saving response",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const saveAndNextMutation = useMutation({
    mutationFn: async () => {
      if (!questionnaireData) return null;
      
      const allQuestionsAnswered = areAllQuestionsAnswered(questionnaireData.questions);
      
      const { data, error } = await supabase
        .from('questionnaires')
        .update({ 
          status: allQuestionsAnswered ? 'complete' : 'incomplete' 
        })
        .eq('id', questionnaireData.questionnaire.id)
        .select();
        
      if (error) throw error;
      
      const nextStepNumber = currentStep + 1;
      const nextStepTitle = getStepTitle(nextStepNumber);
      
      if (nextStepTitle) {
        const { data: existingStep, error: checkError } = await supabase
          .from('questionnaires')
          .select('*')
          .eq('step_number', nextStepNumber)
          .limit(1);
          
        if (checkError) throw checkError;
        
        if (!existingStep || existingStep.length === 0) {
          const { error: createError } = await supabase
            .from('questionnaires')
            .insert({
              valuation_id: questionnaireData.questionnaire.valuation_id,
              step: nextStepTitle.toLowerCase().replace(/\s+/g, '_'),
              step_number: nextStepNumber,
              title: nextStepTitle,
              status: 'incomplete'
            });
            
          if (createError) throw createError;
        }
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaire'] });
      toast({
        title: "Progress saved",
        description: "Your answers have been saved successfully."
      });
      if (currentStep < 7) {
        setCurrentStep(currentStep + 1);
      } else {
        setActiveTab('valuation');
      }
      setIsSaving(false);
    },
    onError: (error) => {
      toast({
        title: "Error saving progress",
        description: error.message,
        variant: "destructive"
      });
      setIsSaving(false);
    }
  });
  
  const handleResponseChange = (questionId: string, value: string | number | boolean) => {
    saveResponsesMutation.mutate({ questionId, response: value });
  };
  
  const handleSaveAndNext = () => {
    setIsSaving(true);
    saveAndNextMutation.mutate();
  };
  
  const steps = createStepsArray(7, currentStep);
  
  useEffect(() => {
    if (questionnaireData?.questionnaire) {
      setCurrentStep(questionnaireData.questionnaire.step_number);
    }
  }, [questionnaireData]);
  
  if (loadingQuestionnaire) {
    return <div className="p-4 text-center">Loading questionnaire...</div>;
  }
  
  if (!questionnaireData) {
    return <div className="p-4 text-center">No questionnaire data available.</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Questionnaire Progress</h1>
        <p className="text-muted-foreground mb-6">Attract investors with an optimized Valuation! Let's continue →</p>
        
        <StepProgress steps={steps} currentStep={currentStep} className="mb-8" />
        
        <h2 className="text-xl font-semibold mb-6 border-b border-border pb-3">
          Step {currentStep}: {getStepTitle(currentStep)}
        </h2>
      </div>
      
      <div className="space-y-6">
        {questionnaireData.questions.map((question) => (
          <QuestionItem 
            key={question.id}
            questionId={question.id}
            number={question.question_number} 
            question={question.question}
            responseType={question.response_type}
            currentResponse={question.response || ''}
            onResponseChange={handleResponseChange}
          />
        ))}
      </div>
      
      <div className="flex justify-between pt-6">
        <Button 
          variant="outline"
          disabled={currentStep === 1 || isSaving}
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
        >
          Back
        </Button>
        <Button 
          onClick={handleSaveAndNext}
          isLoading={isSaving}
          iconRight={<ChevronRight size={16} />}
        >
          Save and Next
        </Button>
      </div>
    </div>
  );
}

interface QuestionItemProps {
  questionId: string;
  number: string;
  question: string;
  responseType: string;
  currentResponse: string;
  onResponseChange: (questionId: string, value: string | number | boolean) => void;
}

function QuestionItem({ questionId, number, question, responseType, currentResponse, onResponseChange }: QuestionItemProps) {
  const renderInput = () => {
    switch (responseType) {
      case 'number':
        return (
          <Input 
            type="number" 
            value={currentResponse || '0'} 
            onChange={(e) => onResponseChange(questionId, e.target.value)} 
            className="w-full border border-border rounded-md p-2"
          />
        );
      case 'boolean':
        return (
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input 
                type="radio" 
                name={`q-${questionId}`} 
                className="h-4 w-4 text-primary border-border" 
                checked={currentResponse === 'true'} 
                onChange={() => onResponseChange(questionId, true)} 
              />
              <span className="ml-2">Yes</span>
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                name={`q-${questionId}`} 
                className="h-4 w-4 text-primary border-border" 
                checked={currentResponse === 'false'} 
                onChange={() => onResponseChange(questionId, false)} 
              />
              <span className="ml-2">No</span>
            </label>
          </div>
        );
      default:
        return (
          <Input 
            type="text" 
            value={currentResponse || ''} 
            onChange={(e) => onResponseChange(questionId, e.target.value)} 
            className="w-full border border-border rounded-md p-2" 
          />
        );
    }
  };

  return (
    <div className="flex gap-6">
      <div className="w-14 h-14 flex-shrink-0 rounded-full bg-secondary text-primary flex items-center justify-center font-medium">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="font-medium mb-2">{question}</h3>
        {renderInput()}
      </div>
    </div>
  );
}
