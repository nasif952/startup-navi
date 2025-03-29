
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Save, X, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Define interfaces for type safety
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
  companies: CompanyData | null;
}

export function ValuationContent() {
  const [rangeValue, setRangeValue] = useState(54);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data, isLoading, error } = useQuery({
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
      
      return valuations as ValuationData | null;
    }
  });
  
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
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  });
  
  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value) / 1000;
    setRangeValue(value);
  };
  
  const saveSelectedValuation = () => {
    if (data) {
      updateValuationMutation.mutate({ id: data.id, value: rangeValue });
    }
  };
  
  useEffect(() => {
    if (data && data.selected_valuation) {
      setRangeValue(Math.round(data.selected_valuation / 1000));
    }
  }, [data]);
  
  if (isLoading) {
    return <div className="p-4 text-center">Loading valuation data...</div>;
  }
  
  if (error) {
    return <div className="p-4 text-center text-red-500">Error loading valuation data: {error instanceof Error ? error.message : "Unknown error"}</div>;
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
              <p>{data.companies?.founded_year || 'N/A'}</p>
            </div>
            <div>
              <span className="text-primary text-sm font-medium">Employees</span>
              <p>{data.companies?.total_employees || 'N/A'}</p>
            </div>
            <div>
              <span className="text-primary text-sm font-medium">Industry</span>
              <p>{data.companies?.industry || 'N/A'}</p>
            </div>
            <div>
              <span className="text-primary text-sm font-medium">Business Activity</span>
              <p>{data.companies?.business_activity || 'N/A'}</p>
            </div>
            <div>
              <span className="text-primary text-sm font-medium">Last Revenue</span>
              <p>${data.companies?.last_revenue || 'N/A'}</p>
            </div>
            <div>
              <span className="text-primary text-sm font-medium">Stage</span>
              <p>{data.companies?.stage || 'N/A'}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <h2 className="text-xl font-bold mb-4">Valuation Status</h2>
          
          <div className="space-y-3">
            <div>
              <p className="font-medium">Initial Estimate</p>
              <p className="text-xl font-bold">${data.initial_estimate || '0'}</p>
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
            <p className="text-2xl font-bold">${data.pre_money_valuation || '0'}</p>
          </Card>
          
          <Card>
            <h3 className="text-sm text-muted-foreground mb-1">Investment</h3>
            <p className="text-2xl font-bold">${data.investment || '0'}</p>
          </Card>
          
          <Card>
            <h3 className="text-sm text-muted-foreground mb-1">Post-Money Valuation</h3>
            <p className="text-2xl font-bold">${data.post_money_valuation || '0'}</p>
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
              <p>${data.funds_raised || '0'}</p>
            </div>
            <div>
              <span className="text-primary text-sm font-medium">Last Year EBITDA</span>
              <p>${data.last_year_ebitda || '0'}</p>
            </div>
            <div>
              <span className="text-primary text-sm font-medium">Industry Multiple</span>
              <p>{data.industry_multiple || '0'}</p>
            </div>
            <div>
              <span className="text-primary text-sm font-medium">Annual ROI</span>
              <p>{data.annual_roi || '0'}%</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
