
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { StepProgress } from '@/components/StepProgress';
import { Check, X, Save, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export default function Valuation() {
  const [activeTab, setActiveTab] = useState('questionnaire');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-destructive text-destructive-foreground px-4 py-3 rounded-lg flex items-center justify-between mb-6">
        <p className="text-sm">Your Valuation Free Trial is Expiring in 62d 3h 46m 11s</p>
        <Button variant="primary" className="bg-white text-destructive hover:bg-white/90">Upgrade Now</Button>
      </div>

      <div className="flex border-b border-border mb-6">
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'questionnaire' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('questionnaire')}
        >
          Questionnaire
        </button>
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'valuation' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('valuation')}
        >
          Valuation
        </button>
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'history' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      {activeTab === 'questionnaire' && <QuestionnaireContent />}
      {activeTab === 'valuation' && <ValuationContent />}
      {activeTab === 'history' && <HistoryContent />}
    </div>
  );
}

function QuestionnaireContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch questionnaire data
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
  
  // Save questionnaire status and progress to next step
  const saveAndNextMutation = useMutation({
    mutationFn: async () => {
      // Check if all questions have responses
      const allQuestionsAnswered = questionnaireData?.questions.every(q => q.response && q.response !== '');
      
      // Update questionnaire status
      const { data, error } = await supabase
        .from('questionnaires')
        .update({ 
          status: allQuestionsAnswered ? 'complete' : 'incomplete' 
        })
        .eq('id', questionnaireData?.questionnaire.id)
        .select();
        
      if (error) throw error;
      
      // Get or create next questionnaire if needed
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
              valuation_id: questionnaireData?.questionnaire.valuation_id,
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
      // Move to next step or to valuation tab if all steps are complete
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
  
  // Handle response changes and save
  const handleResponseChange = (questionId: string, value: string | number | boolean) => {
    saveResponsesMutation.mutate({ questionId, response: value });
  };
  
  // Handle save and next button
  const handleSaveAndNext = () => {
    setIsSaving(true);
    saveAndNextMutation.mutate();
  };
  
  // Helper function to get step title
  const getStepTitle = (stepNumber: number) => {
    const stepTitles = [
      'Team', 'Product', 'Market', 'Business Model', 'Competition', 'Financials', 'Future'
    ];
    return stepTitles[stepNumber - 1] || null;
  };
  
  // Build steps array for the progress component
  const steps = Array.from({ length: 7 }, (_, i) => {
    const stepNumber = i + 1;
    return { 
      number: stepNumber, 
      label: getStepTitle(stepNumber) || `Step ${stepNumber}`,
      isActive: stepNumber === currentStep
    };
  });
  
  useEffect(() => {
    // If questionnaire data is loaded, update the current step
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

function ValuationContent() {
  const [rangeValue, setRangeValue] = useState(54);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch valuation and company data
  const { data, isLoading } = useQuery({
    queryKey: ['valuation'],
    queryFn: async () => {
      const { data: valuations, error: valuationError } = await supabase
        .from('valuations')
        .select('*, companies(*)')
        .limit(1)
        .single();
        
      if (valuationError) {
        toast({
          title: "Error loading valuation",
          description: valuationError.message,
          variant: "destructive"
        });
        return null;
      }
      
      return valuations;
    }
  });
  
  // Update valuation mutation
  const updateValuationMutation = useMutation({
    mutationFn: async ({ id, value }: { id: string, value: number }) => {
      const { data, error } = await supabase
        .from('valuations')
        .update({ selected_valuation: value * 1000 })
        .eq('id', id)
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['valuation'] });
      toast({
        title: "Valuation updated",
        description: "The valuation has been updated successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating valuation",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Handle range value change
  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value) / 1000;
    setRangeValue(value);
  };
  
  // Save selected valuation
  const saveSelectedValuation = () => {
    if (data) {
      updateValuationMutation.mutate({ id: data.id, value: rangeValue });
    }
  };
  
  // Initialize range value from data
  useEffect(() => {
    if (data && data.selected_valuation) {
      setRangeValue(Math.round(data.selected_valuation / 1000));
    }
  }, [data]);
  
  if (isLoading) {
    return <div className="p-4 text-center">Loading valuation data...</div>;
  }
  
  if (!data) {
    return <div className="p-4 text-center">No valuation data available.</div>;
  }
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">Valuation Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <h2 className="text-xl font-bold mb-4">Diamond AI Valuation Summary</h2>
          
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div>
              <span className="text-primary text-sm font-medium">Started in</span>
              <p>{data.companies.founded_year}</p>
            </div>
            <div>
              <span className="text-primary text-sm font-medium">Employees</span>
              <p>{data.companies.total_employees}</p>
            </div>
            <div>
              <span className="text-primary text-sm font-medium">Industry</span>
              <p>{data.companies.industry}</p>
            </div>
            <div>
              <span className="text-primary text-sm font-medium">Business Activity</span>
              <p>{data.companies.business_activity}</p>
            </div>
            <div>
              <span className="text-primary text-sm font-medium">Last Revenue</span>
              <p>${data.companies.last_revenue}</p>
            </div>
            <div>
              <span className="text-primary text-sm font-medium">Stage</span>
              <p>{data.companies.stage}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <h2 className="text-xl font-bold mb-4">Valuation Status</h2>
          
          <div className="space-y-3">
            <div>
              <p className="font-medium">Initial Estimate</p>
              <p className="text-xl font-bold">${data.initial_estimate}</p>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-primary text-sm font-medium">Questionnaires</span>
              <span className="text-destructive"><X size={18} /></span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-primary text-sm font-medium">Financials</span>
              <span className="text-destructive"><X size={18} /></span>
            </div>
          </div>
        </Card>
      </div>
      
      <div>
        <h2 className="text-xl font-bold mb-4">Current Funding Round</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <h3 className="text-sm text-muted-foreground mb-1">Pre-Money Valuation</h3>
            <p className="text-2xl font-bold">${data.pre_money_valuation}</p>
          </Card>
          
          <Card>
            <h3 className="text-sm text-muted-foreground mb-1">Investment</h3>
            <p className="text-2xl font-bold">${data.investment}</p>
          </Card>
          
          <Card>
            <h3 className="text-sm text-muted-foreground mb-1">Post-Money Valuation</h3>
            <p className="text-2xl font-bold">${data.post_money_valuation}</p>
          </Card>
        </div>
        
        <Card className="p-6">
          <div className="flex justify-between mb-4">
            <div>
              <span className="text-sm text-muted-foreground">Low</span>
              <p className="font-medium">${data.valuation_min.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <span className="text-sm text-muted-foreground">High</span>
              <p className="font-medium">${data.valuation_max.toFixed(2)}</p>
            </div>
          </div>
          
          <input
            type="range"
            min={data.valuation_min}
            max={data.valuation_max}
            step="1000"
            value={rangeValue * 1000}
            onChange={handleRangeChange}
            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
          />
          
          <div className="text-center mt-4">
            <span className="text-sm text-muted-foreground">Selected</span>
            <p className="font-bold text-lg">${rangeValue},000.00</p>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button 
              variant="primary" 
              iconRight={<Save size={16} />} 
              onClick={saveSelectedValuation}
              isLoading={updateValuationMutation.isPending}
            >
              Save Valuation
            </Button>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1">
          <h2 className="text-xl font-bold mb-4">Info</h2>
          
          <div className="space-y-3">
            <div>
              <span className="text-primary text-sm font-medium">Funds Raised</span>
              <p>${data.funds_raised}</p>
            </div>
            <div>
              <span className="text-primary text-sm font-medium">Last Year EBITDA</span>
              <p>${data.last_year_ebitda}</p>
            </div>
            <div>
              <span className="text-primary text-sm font-medium">Industry Multiple</span>
              <p>{data.industry_multiple}</p>
            </div>
            <div>
              <span className="text-primary text-sm font-medium">Annual ROI</span>
              <p>{data.annual_roi}%</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function HistoryContent() {
  const { data: valuationHistory, isLoading } = useQuery({
    queryKey: ['valuation-history'],
    queryFn: async () => {
      // This is a placeholder for future implementation of valuation history
      // We would fetch historical valuation data from the database here
      return [];
    }
  });
  
  if (isLoading) {
    return <div className="p-4 text-center">Loading history...</div>;
  }
  
  return (
    <div className="p-6 text-center animate-fade-in">
      <h2 className="text-xl font-medium mb-2">Valuation History</h2>
      <p className="text-muted-foreground">No history data available yet.</p>
    </div>
  );
}
