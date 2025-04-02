
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { extendedSupabase } from '@/integrations/supabase/client-extension';
import { calculateStartupScore, ScoreData, saveStartupScore } from '@/lib/calculateScore';
import { StartupScore } from '@/integrations/supabase/client-extension';

export function useStartupScore() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch company data
  const { data: companyData } = useQuery({
    queryKey: ['company-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .limit(1)
        .single();
        
      if (error) throw error;
      return data;
    },
  });
  
  // Fetch valuation data
  const { data: valuationData } = useQuery({
    queryKey: ['valuation-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('valuations')
        .select('*, companies(*)')
        .limit(1)
        .single();
        
      if (error) throw error;
      return data;
    },
  });
  
  // Fetch performance metrics data (latest month)
  const { data: performanceData } = useQuery({
    queryKey: ['performance-metrics-latest'],
    queryFn: async () => {
      const { data: metrics, error } = await supabase
        .from('performance_values')
        .select('*, performance_metrics(*)')
        .order('year', { ascending: false })
        .order('month', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      
      // Convert performance values to the required format
      const result = {
        revenue: null,
        gross_margin: null,
        cash_on_hand: null,
        customers: null,
      };
      
      if (metrics) {
        for (const metric of metrics) {
          const name = metric.performance_metrics?.name?.toLowerCase();
          if (name === 'revenue') {
            result.revenue = metric.actual;
          } else if (name === 'gross margin') {
            result.gross_margin = metric.actual;
          } else if (name === 'cash on hand') {
            result.cash_on_hand = metric.actual;
          } else if (name === 'no. of paying customers') {
            result.customers = metric.actual;
          }
        }
      }
      
      return result;
    },
  });
  
  // Fetch the latest calculated score
  const { data: latestScore, refetch: refetchScore } = useQuery({
    queryKey: ['startup-score'],
    queryFn: async () => {
      if (!companyData) return null;
      
      const { data, error } = await extendedSupabase
        .from('startup_scores')
        .select('*')
        .eq('company_id', companyData.id)
        .order('calculation_date', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (error) throw error;
      return data as StartupScore | null;
    },
    enabled: !!companyData,
  });
  
  // Calculate the score
  const calculateScore = async (): Promise<ScoreData | null> => {
    setLoading(true);
    setError(null);
    
    try {
      if (!companyData || !valuationData || !performanceData) {
        throw new Error('Missing required data to calculate score');
      }
      
      const score = await calculateStartupScore(
        companyData,
        performanceData,
        valuationData
      );
      
      // Save the score
      await saveStartupScore(companyData.id, score);
      
      // Refetch the latest score
      await refetchScore();
      
      return score;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred calculating score';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    companyData,
    valuationData,
    performanceData,
    latestScore,
    loading,
    error,
    calculateScore,
  };
}
