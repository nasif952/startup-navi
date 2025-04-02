
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/Button';
import { StepProgress } from '@/components/StepProgress';
import { Input } from '@/components/ui/input';
import { ChevronRight, PlusCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { createStepsArray, getStepTitle, areAllQuestionsAnswered } from '@/utils/questionnaire-utils';
import { AddQuestionDialog } from '@/components/dialogs/AddQuestionDialog';

interface QuestionnaireContentProps {
  setActiveTab: (tab: string) => void;
}

export function QuestionnaireContent({ setActiveTab }: QuestionnaireContentProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  
  // Query to fetch/initialize questionnaire
  const { data: questionnaireData, isLoading: loadingQuestionnaire } = useQuery({
    queryKey: ['questionnaire', currentStep],
    queryFn: async () => {
      // First, check if we have a questionnaire for the current step
      const { data: questionnaires, error: questionnaireError } = await supabase
        .from('questionnaires')
        .select('*')
        .eq('step_number', currentStep)
        .limit(1);
      
      if (questionnaireError) {
        toast({
          title: "Error loading questionnaire",
          description: questionnaireError.message,
          variant: "destructive"
        });
        return null;
      }
      
      // If no questionnaire exists for this step, create one
      if (!questionnaires || questionnaires.length === 0) {
        const stepTitle = getStepTitle(currentStep);
        
        if (!stepTitle) {
          toast({
            title: "Invalid step",
            description: "Could not find a title for this step",
            variant: "destructive"
          });
          return null;
        }
        
        // Create default questionnaire for this step
        const { data: newQuestionnaire, error: createError } = await supabase
          .from('questionnaires')
          .insert({
            step: stepTitle.toLowerCase().replace(/\s+/g, '_'),
            step_number: currentStep,
            title: stepTitle,
            status: 'incomplete',
            valuation_id: '00000000-0000-0000-0000-000000000000' // Default valuation ID
          })
          .select()
          .single();
        
        if (createError) {
          toast({
            title: "Error creating questionnaire",
            description: createError.message,
            variant: "destructive"
          });
          return null;
        }
        
        // Create default questions based on the step
        const defaultQuestions = getDefaultQuestions(currentStep, newQuestionnaire.id);
        
        if (defaultQuestions.length > 0) {
          const { error: questionsError } = await supabase
            .from('questionnaire_questions')
            .insert(defaultQuestions);
          
          if (questionsError) {
            toast({
              title: "Error creating default questions",
              description: questionsError.message,
              variant: "destructive"
            });
          }
        }
        
        // Re-fetch the data after creating
        const { data: refreshedQuestionnaires, error: refreshError } = await supabase
          .from('questionnaires')
          .select('*')
          .eq('step_number', currentStep)
          .limit(1)
          .single();
        
        if (refreshError) {
          toast({
            title: "Error refreshing questionnaire",
            description: refreshError.message,
            variant: "destructive"
          });
          return null;
        }
        
        questionnaires[0] = refreshedQuestionnaires;
      }
      
      // Fetch questions for this questionnaire
      const { data: questions, error: questionsError } = await supabase
        .from('questionnaire_questions')
        .select('*')
        .eq('questionnaire_id', questionnaires[0].id)
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
        questionnaire: questionnaires[0],
        questions: questions || []
      };
    },
    refetchOnWindowFocus: false
  });
  
  // Save responses mutation
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
      queryClient.invalidateQueries({ queryKey: ['questionnaire', currentStep] });
    },
    onError: (error) => {
      toast({
        title: "Error saving response",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Save and proceed to next step
  const saveAndNextMutation = useMutation({
    mutationFn: async () => {
      if (!questionnaireData?.questionnaire) return null;
      
      const allQuestionsAnswered = areAllQuestionsAnswered(questionnaireData.questions);
      
      const { data, error } = await supabase
        .from('questionnaires')
        .update({ 
          status: allQuestionsAnswered ? 'complete' : 'incomplete' 
        })
        .eq('id', questionnaireData.questionnaire.id)
        .select();
        
      if (error) throw error;
      
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
  
  const handleQuestionAdded = () => {
    queryClient.invalidateQueries({ queryKey: ['questionnaire', currentStep] });
  };
  
  const steps = createStepsArray(7, currentStep);
  
  const getLastQuestionNumber = () => {
    if (!questionnaireData?.questions || questionnaireData.questions.length === 0) {
      return `${currentStep}.0`;
    }
    
    return questionnaireData.questions[questionnaireData.questions.length - 1].question_number;
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
      
      {questionnaireData?.questions && questionnaireData.questions.length > 0 ? (
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
      ) : (
        <div className="py-8 text-center border border-dashed border-border rounded-lg">
          <p className="text-muted-foreground mb-4">No questions yet for this section.</p>
          {questionnaireData?.questionnaire && (
            <AddQuestionDialog
              trigger={
                <Button variant="outline">
                  <PlusCircle size={16} className="mr-2" />
                  Add your first question
                </Button>
              }
              questionnaireId={questionnaireData.questionnaire.id}
              lastQuestionNumber={`${currentStep}.1`}
              onQuestionAdded={handleQuestionAdded}
            />
          )}
        </div>
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
          onClick={handleSaveAndNext}
          isLoading={isSaving}
          iconRight={<ChevronRight size={16} />}
        >
          {currentStep === 7 ? "Complete & Calculate" : "Save and Next"}
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
            value={currentResponse || ''} 
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

// Helper function to get default questions based on the step
function getDefaultQuestions(step: number, questionnaireId: string) {
  const questions: any[] = [];
  
  switch (step) {
    case 1: // Team
      questions.push(
        {
          questionnaire_id: questionnaireId,
          question_number: '1.1',
          question: 'How many years of experience do the founders have in this industry?',
          response_type: 'number'
        },
        {
          questionnaire_id: questionnaireId,
          question_number: '1.2',
          question: 'Has any member of your team previously founded a successful company?',
          response_type: 'boolean'
        },
        {
          questionnaire_id: questionnaireId,
          question_number: '1.3',
          question: 'How many full-time employees do you currently have?',
          response_type: 'number'
        }
      );
      break;
    case 2: // Product
      questions.push(
        {
          questionnaire_id: questionnaireId,
          question_number: '2.1',
          question: 'What stage is your product currently in?',
          response_type: 'text'
        },
        {
          questionnaire_id: questionnaireId,
          question_number: '2.2',
          question: 'Do you have any patents or proprietary technology?',
          response_type: 'boolean'
        },
        {
          questionnaire_id: questionnaireId,
          question_number: '2.3',
          question: 'What is your product development timeline for the next 12 months?',
          response_type: 'text'
        }
      );
      break;
    case 3: // Market
      questions.push(
        {
          questionnaire_id: questionnaireId,
          question_number: '3.1',
          question: 'What is your total addressable market size in dollars?',
          response_type: 'number'
        },
        {
          questionnaire_id: questionnaireId,
          question_number: '3.2',
          question: 'What is the annual growth rate of your target market?',
          response_type: 'number'
        },
        {
          questionnaire_id: questionnaireId,
          question_number: '3.3',
          question: 'Have you validated market demand through customer research?',
          response_type: 'boolean'
        }
      );
      break;
    case 4: // Business Model
      questions.push(
        {
          questionnaire_id: questionnaireId,
          question_number: '4.1',
          question: 'What is your primary revenue model?',
          response_type: 'text'
        },
        {
          questionnaire_id: questionnaireId,
          question_number: '4.2',
          question: 'What is your average customer acquisition cost (CAC)?',
          response_type: 'number'
        },
        {
          questionnaire_id: questionnaireId,
          question_number: '4.3',
          question: 'What is your estimated customer lifetime value (LTV)?',
          response_type: 'number'
        }
      );
      break;
    case 5: // Competition
      questions.push(
        {
          questionnaire_id: questionnaireId,
          question_number: '5.1',
          question: 'Who are your top 3 competitors?',
          response_type: 'text'
        },
        {
          questionnaire_id: questionnaireId,
          question_number: '5.2',
          question: 'What is your unique competitive advantage?',
          response_type: 'text'
        },
        {
          questionnaire_id: questionnaireId,
          question_number: '5.3',
          question: 'Are there significant barriers to entry in your market?',
          response_type: 'boolean'
        }
      );
      break;
    case 6: // Financials
      questions.push(
        {
          questionnaire_id: questionnaireId,
          question_number: '6.1',
          question: 'What is your current monthly revenue?',
          response_type: 'number'
        },
        {
          questionnaire_id: questionnaireId,
          question_number: '6.2',
          question: 'What is your projected annual revenue for the next fiscal year?',
          response_type: 'number'
        },
        {
          questionnaire_id: questionnaireId,
          question_number: '6.3',
          question: 'What is your current burn rate per month?',
          response_type: 'number'
        }
      );
      break;
    case 7: // Future
      questions.push(
        {
          questionnaire_id: questionnaireId,
          question_number: '7.1',
          question: 'How much funding are you seeking in this round?',
          response_type: 'number'
        },
        {
          questionnaire_id: questionnaireId,
          question_number: '7.2',
          question: 'What milestone will this funding help you achieve?',
          response_type: 'text'
        },
        {
          questionnaire_id: questionnaireId,
          question_number: '7.3',
          question: 'When do you expect to reach profitability?',
          response_type: 'text'
        }
      );
      break;
  }
  
  return questions;
}
