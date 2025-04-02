
// This extends the Supabase Database type definitions
import { Database as SupabaseDatabase } from './types';

export interface IndustryBenchmark {
  id: string;
  industry: string;
  metric: string;
  value: number;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StartupScore {
  id: string;
  company_id?: string;
  total_score: number;
  growth_score: number;
  team_score: number;
  finance_score: number;
  market_score: number;
  product_score: number;
  calculation_date: string;
  created_at: string;
  updated_at: string;
}

// Extend the Database interface to include our custom tables
export interface Database extends SupabaseDatabase {
  public: {
    Tables: SupabaseDatabase['public']['Tables'] & {
      industry_benchmarks: {
        Row: IndustryBenchmark;
      };
      startup_scores: {
        Row: StartupScore;
      };
    }
  }
}

// Re-export the extended supabase client
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://zketdtgucabdbfdtlxzq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprZXRkdGd1Y2FiZGJmZHRseHpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMjQ5NDYsImV4cCI6MjA1ODcwMDk0Nn0.7UR1Epax73cRK8tQh_K7aLrL6lxKPIZzBnAPVqkqnkI";

export const extendedSupabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
