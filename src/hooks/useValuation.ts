import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { calculateValuation, updateValuationWithResults, ValuationResults } from '@/lib/valuationCalculator';

interface CompanyData {
  id: string;
  name: string;
  founded_year: number | null;
  total_employees: number | null;
  industry: string | null;
  business_activity: string | null;
  last_revenue: number | null;
  stage: string | null;
}

interface ValuationData {
  id: string;
  selected_valuation: number | null;
  initial_estimate: number | null;
  pre_money_valuation: number | null;
  investment: number | null;
  post_money_valuation: number | null;
  valuation_min: number;
  valuation_max: number;
  funds_raised: number | null;
  last_year_ebitda: number | null;
  industry_multiple: number | null;
  annual_roi: number | null;
  calculation_date: string | null;
  companies: CompanyData | null;
}

// Define the valuation methods structure separately
interface ValuationMethods {
  scorecard: number;
  checklist: number;
  ventureCap: number;
  dcfGrowth: number;
  dcfMultiple: number;
  weights: {
    [key: string]: {
      weight: number;
      enabled: boolean;
    }
  }
}

export function useValuation() {
  const [calculationStatus, setCalculationStatus] = useState<'idle' | 'calculating' | 'done'>('idle');
  // Store valuation methods in local state
  const [valuationMethods, setValuationMethods] = useState<ValuationMethods | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Query to fetch valuation data
  const { data, isLoading, error } = useQuery({
    queryKey: ['valuation'],
    queryFn: async () => {
      try {
        console.log("Fetching valuation data...");
        const { data: valuations, error: valuationError } = await supabase
          .from('valuations')
          .select('*, companies(*)')
          .limit(1)
          .single();
          
        if (valuationError) {
          console.error("Error fetching valuation data:", valuationError);
          toast({
            title: "Error loading valuation",
            description: valuationError.message,
            variant: "destructive"
          });
          return null;
        }
        
        console.log("Valuation data fetched:", valuations);
        return valuations as ValuationData | null;
      } catch (err) {
        console.error("Unexpected error in valuation query:", err);
        toast({
          title: "Unexpected error",
          description: err instanceof Error ? err.message : "An unknown error occurred",
          variant: "destructive"
        });
        return null;
      }
    }
  });
  
  // Mutation to update valuation manually
  const updateValuationMutation = useMutation({
    mutationFn: async ({ id, value }: { id: string, value: number }) => {
      // Calculate investment as 15% of the valuation (or another percent based on business logic)
      const investmentPercentage = 0.15; // 15%
      const investment = value * 1000 * investmentPercentage;
      const postMoney = value * 1000 + investment;
      
      const { data, error } = await supabase
        .from('valuations')
        .update({ 
          selected_valuation: value * 1000,
          pre_money_valuation: value * 1000,
          investment: investment,
          post_money_valuation: postMoney
        })
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
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  });
  
  // Mutation for recalculating valuation based on questionnaire data
  const recalculateValuationMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!data?.companies?.id) {
        console.error("Company data missing for valuation calculation");
        throw new Error("Company data is required for valuation calculation");
      }
      
      setCalculationStatus('calculating');
      console.log("Starting valuation calculation for company:", data.companies.id);
      
      try {
        // Calculate valuation based on questionnaire data
        const results = await calculateValuation(id, data.companies.id);
        console.log("Calculation results:", results);
        
        // Store valuation methods in local state
        setValuationMethods({
          scorecard: results.scorecard,
          checklist: results.checklistMethod,
          ventureCap: results.ventureCap,
          dcfGrowth: results.dcfGrowth,
          dcfMultiple: results.dcfMultiple,
          weights: results.methodologyWeights
        });
        
        // Update the valuation in the database (only the numeric values)
        await updateValuationWithResults(id, results);
        console.log("Updated valuation with results");
        
        setCalculationStatus('done');
        return results;
      } catch (err) {
        console.error("Error in valuation calculation:", err);
        throw err;
      }
    },
    onSuccess: (results) => {
      console.log("Recalculation successful, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ['valuation'] });
      toast({
        title: "Valuation recalculated",
        description: "Your startup's valuation has been updated based on questionnaire data."
      });
      
      // Reset status after a delay
      setTimeout(() => setCalculationStatus('idle'), 2000);
    },
    onError: (error) => {
      console.error("Recalculation error:", error);
      toast({
        title: "Error calculating valuation",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      setCalculationStatus('idle');
    }
  });
  
  // Function to check if the questionnaire has been completed
  const isQuestionnaireComplete = !!valuationMethods;
  
  // Function to check if financial data is available
  const hasFinancialsData = !!(data?.last_year_ebitda || valuationMethods);
  
  // Function to recalculate the valuation
  const recalculateValuation = () => {
    if (data) {
      console.log("Recalculating valuation for id:", data.id);
      recalculateValuationMutation.mutate(data.id);
    } else {
      console.error("Cannot recalculate: no valuation data available");
      toast({
        title: "Cannot recalculate",
        description: "No valuation data available to recalculate",
        variant: "destructive"
      });
    }
  };
  
  // Function to update the selected valuation
  const updateSelectedValuation = (value: number) => {
    if (data) {
      updateValuationMutation.mutate({ id: data.id, value });
    } else {
      console.error("Cannot update: no valuation data available");
      toast({
        title: "Cannot update",
        description: "No valuation data available to update",
        variant: "destructive"
      });
    }
  };
  
  // Combine the database data with our local state
  const completeData = data ? {
    ...data,
    valuation_methods: valuationMethods
  } : null;
  
  return {
    valuation: completeData,
    isLoading,
    error,
    isQuestionnaireComplete,
    hasFinancialsData,
    calculationStatus,
    updateSelectedValuation,
    recalculateValuation,
    updateValuationMutation,
    recalculateValuationMutation
  };
} 