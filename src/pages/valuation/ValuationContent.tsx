import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Save, X, Check, BarChart4, RefreshCw, Info } from 'lucide-react';
import { useValuation } from '@/hooks/useValuation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define valuation method weight type
interface MethodWeightConfig {
  weight: number;
  enabled: boolean;
}

export function ValuationContent() {
  // Store the actual value in dollars, not thousands
  const [rangeValue, setRangeValue] = useState<number>(54000);
  
  const {
    valuation: data,
    isLoading,
    error,
    isQuestionnaireComplete,
    hasFinancialsData,
    calculationStatus,
    updateSelectedValuation,
    recalculateValuation
  } = useValuation();
  
  // Debug log to check valuation methods data
  useEffect(() => {
    if (data) {
      console.log("Valuation data:", data);
      console.log("Valuation methods:", data.valuation_methods);
    }
  }, [data]);
  
  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Ensure we're working with numbers
    const value = parseInt(e.target.value, 10);
    console.log("Range changed to:", value);
    setRangeValue(value);
  };
  
  const saveSelectedValuation = () => {
    console.log("Saving selected valuation:", rangeValue);
    updateSelectedValuation(rangeValue);
  };
  
  // Only update the slider value from data on initial load
  useEffect(() => {
    if (data && data.selected_valuation && !rangeValue) {
      setRangeValue(data.selected_valuation);
    }
  }, [data, rangeValue]);
  
  // Force calculation if valuation methods are missing
  useEffect(() => {
    if (data && !data.valuation_methods && calculationStatus === 'idle') {
      console.log("No valuation methods found, triggering calculation...");
      // Wait for component to mount properly
      const timer = setTimeout(() => {
        recalculateValuation();
      }, 1500); // Increased timeout to reduce rapid re-calculations
      return () => clearTimeout(timer);
    }
  }, [data, calculationStatus, recalculateValuation]);
  
  // Add a useEffect hook to generate mock data once after calculation errors
  useEffect(() => {
    if (calculationStatus === 'idle' && !data?.valuation_methods && !hasMockDataBeenShown.current) {
      // Use this flag to avoid endless re-renders
      hasMockDataBeenShown.current = true;
      console.log("Showing mock visualization data for better UX");
    }
  }, [calculationStatus, data?.valuation_methods]);
  
  // Create a reference to track if mock data has been shown
  const hasMockDataBeenShown = useRef(false);
  
  if (isLoading) {
    return <div className="p-4 text-center">Loading valuation data...</div>;
  }
  
  if (error) {
    return <div className="p-4 text-center text-red-500">Error loading valuation data: {error instanceof Error ? error.message : "Unknown error"}</div>;
  }
  
  if (!data) {
    return <div className="p-4 text-center">No valuation data available.</div>;
  }
  
  // Create a mock data object for visualization if valuation methods are missing
  const mockValuationData = {
    scorecard: 5000000,
    checklist: 6500000,
    ventureCap: 1000000,
    dcfGrowth: 700000,
    dcfMultiple: 200000,
    weights: {
      scorecard: { weight: 30, enabled: true },
      checklistMethod: { weight: 30, enabled: true },
      ventureCap: { weight: 20, enabled: true },
      dcfGrowth: { weight: 10, enabled: true },
      dcfMultiple: { weight: 10, enabled: true }
    }
  };
  
  // Use either real data or mock data for rendering
  const valuationMethodsData = data.valuation_methods || mockValuationData;
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Valuation Dashboard</h1>
        <Button 
          iconLeft={calculationStatus === 'calculating' ? <RefreshCw className="animate-spin" /> : <RefreshCw />}
          isLoading={calculationStatus === 'calculating'}
          onClick={() => recalculateValuation()}
        >
          Recalculate Valuation
        </Button>
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
              <p>${data.companies?.last_revenue?.toLocaleString() || 'N/A'}</p>
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
              <p className="text-xl font-bold">${data.initial_estimate?.toLocaleString() || '0'}</p>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-primary text-sm font-medium">Questionnaires</span>
              <span className={isQuestionnaireComplete ? "text-green-500" : "text-destructive"}>
                {isQuestionnaireComplete ? <Check size={18} /> : <X size={18} />}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-primary text-sm font-medium">Financials</span>
              <span className={hasFinancialsData ? "text-green-500" : "text-destructive"}>
                {hasFinancialsData ? <Check size={18} /> : <X size={18} />}
              </span>
            </div>
            
            {data.calculation_date && (
              <div className="pt-2 text-xs text-muted-foreground">
                Last updated: {new Date(data.calculation_date).toLocaleDateString()}
              </div>
            )}
          </div>
        </Card>
      </div>
      
      <div>
        <h2 className="text-xl font-bold mb-4">Current Funding Round</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <h3 className="text-sm text-muted-foreground mb-1">Pre-Money Valuation</h3>
            <p className="text-2xl font-bold">${data.pre_money_valuation?.toLocaleString() || '0'}</p>
          </Card>
          
          <Card>
            <h3 className="text-sm text-muted-foreground mb-1">Investment</h3>
            <p className="text-2xl font-bold">${data.investment?.toLocaleString() || '0'}</p>
          </Card>
          
          <Card>
            <h3 className="text-sm text-muted-foreground mb-1">Post-Money Valuation</h3>
            <p className="text-2xl font-bold">${data.post_money_valuation?.toLocaleString() || '0'}</p>
          </Card>
        </div>
        
        <Card>
          <div className="flex justify-between mb-4">
            <div>
              <span className="text-sm text-muted-foreground">Low</span>
              <p className="font-medium">${data.valuation_min.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <span className="text-sm text-muted-foreground">High</span>
              <p className="font-medium">${data.valuation_max.toLocaleString()}</p>
            </div>
          </div>
          
          <input
            type="range"
            min={data.valuation_min}
            max={data.valuation_max}
            step="1000"
            value={rangeValue}
            onChange={handleRangeChange}
            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${((rangeValue - data.valuation_min) / (data.valuation_max - data.valuation_min)) * 100}%, #e5e7eb ${((rangeValue - data.valuation_min) / (data.valuation_max - data.valuation_min)) * 100}%, #e5e7eb 100%)`
            }}
          />
          
          <div className="text-center mt-4">
            <span className="text-sm text-muted-foreground">Selected</span>
            <p className="font-bold text-lg">${rangeValue.toLocaleString()}</p>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button 
              iconLeft={calculationStatus !== 'idle' ? <RefreshCw className="animate-spin" /> : <Save />}
              isLoading={calculationStatus !== 'idle'}
              onClick={saveSelectedValuation}
              variant="primary"
            >
              Save Valuation
            </Button>
          </div>
        </Card>
      </div>
      
      {/* Valuation Methods Section */}
      <Card>
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-bold">5 Valuation Methods</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Combined valuation using weighted averages of different methodologies
          </p>
        </div>
        
        <div className="p-6">
          {calculationStatus === 'calculating' ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">Calculating valuation methods...</p>
              <RefreshCw className="w-8 h-8 mx-auto animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="mb-8">
                <ValuationBarChart 
                  data={{
                    scorecard: valuationMethodsData.scorecard,
                    checklist: valuationMethodsData.checklist,
                    ventureCap: valuationMethodsData.ventureCap,
                    dcfGrowth: valuationMethodsData.dcfGrowth,
                    dcfMultiple: valuationMethodsData.dcfMultiple
                  }} 
                />
              </div>
              
              <h3 className="text-lg font-bold mb-4">Weights of the methods</h3>
              <div className="grid grid-cols-5 gap-4">
                {Object.entries(valuationMethodsData.weights || {}).map(([method, config]) => (
                  <MethodWeightGauge 
                    key={method}
                    name={formatMethodName(method)}
                    weight={(config as MethodWeightConfig).weight}
                    enabled={(config as MethodWeightConfig).enabled}
                  />
                ))}
              </div>
              
              {!data.valuation_methods && (
                <div className="mt-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    This is a sample visualization. Complete the questionnaire and recalculate for accurate results.
                  </p>
                  <Button 
                    iconLeft={<BarChart4 />}
                    onClick={() => recalculateValuation()}
                  >
                    Calculate Now
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
      
      {/* Info Section */}
      <Card>
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-bold">Info</h2>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-2 gap-y-4 border-b border-border pb-4 mb-4">
            <div>
              <span className="text-sm text-muted-foreground">Funds Required</span>
              <p className="font-medium">${data.funds_raised?.toLocaleString() || (data.investment?.toLocaleString() || '0')}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Last Year EBITDA</span>
              <p className="font-medium">${data.last_year_ebitda?.toLocaleString() || '0'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-y-4">
            <div>
              <span className="text-sm text-muted-foreground">Industry Multiple</span>
              <p className="font-medium">{data.industry_multiple?.toFixed(6) || '0'}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Annual Req. ROI</span>
              <p className="font-medium">{data.annual_roi ? `${data.annual_roi}%` : '0%'}</p>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Valuation Mastery Info */}
      <Card>
        <div className="bg-purple-50 rounded-md p-6">
          <h2 className="text-2xl font-bold text-purple-900 mb-2">VALUATION MASTERY: DIAMOND AI's 5 METHODS.</h2>
          <p className="text-purple-900 mb-2">
            Diamond AI's leading approach to startup valuation sets the standard in the industry by combining five
            different perspectives with a weighted average based on the stage of development.
          </p>
          <p className="text-purple-900">
            This comprehensive methodology provides entrepreneurs, investors, and advisors with a holistic view of
            a company's worth, enabling better equity decisions and more productive negotiations.
          </p>
        </div>
      </Card>
    </div>
  );
}

// Helper component to format method names
function formatMethodName(method: string): string {
  switch(method) {
    case 'scorecard':
      return 'Scorecard';
    case 'checklistMethod':
      return 'Check-List';
    case 'ventureCap':
      return 'Venture Capital';
    case 'dcfGrowth':
      return 'DCF Long Term Growth';
    case 'dcfMultiple':
      return 'DCF with Multiples';
    default:
      return method.charAt(0).toUpperCase() + method.slice(1);
  }
}

// Helper function to normalize valuation data for better visualization
function normalizeValuationData(data: Record<string, number>): Record<string, number> {
  const values = Object.values(data);
  const maxValue = Math.max(...values);
  
  // If all values are 0 or very close to 0, return a fixed height
  if (maxValue < 1) {
    return Object.keys(data).reduce((acc, key) => {
      acc[key] = data[key] > 0 ? 0.1 : 0; // Give a small height if > 0
      return acc;
    }, {} as Record<string, number>);
  }
  
  // Apply a more aggressive logarithmic scale for extreme value differences
  const result: Record<string, number> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value > 0) {
      // Use log10 for better scaling with extremely varied values
      result[key] = Math.log10(value + 1) / Math.log10(maxValue + 1);
      
      // Boost the visual difference for clearer comparison
      // This makes the bars more visually distinct
      result[key] = Math.pow(result[key], 0.7); // Power less than 1 boosts smaller values
      
      // Ensure minimum visible height
      result[key] = Math.max(result[key], 0.05);
    } else {
      result[key] = 0;
    }
  }
  
  return result;
}

// Bar chart component to visualize valuation methods
function ValuationBarChart({ data }: { data: Record<string, number> }) {
  return (
    <div className="relative h-[280px]">
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"></div>
      <div className="absolute left-0 right-0 bottom-0 h-px bg-gray-300"></div>
      
      {/* Y-axis labels */}
      <div className="absolute left-2 top-0 text-xs text-gray-500">${formatValue(Math.max(...Object.values(data)))}</div>
      <div className="absolute left-2 bottom-2 text-xs text-gray-500">$0</div>
      
      {/* Bars */}
      <div className="flex justify-between items-end h-full pt-6 pb-8">
        <div className="flex-1 h-full flex flex-col items-center justify-end">
          <div className="h-[40%] w-4/5 bg-purple-700"></div>
          <div className="mt-2 text-xs font-medium text-gray-600">Scorecard</div>
          <div className="text-xs text-gray-500 mt-1">${formatValue(data.scorecard)}</div>
        </div>
        
        <div className="flex-1 h-full flex flex-col items-center justify-end">
          <div className="h-[75%] w-4/5 bg-red-400"></div>
          <div className="mt-2 text-xs font-medium text-gray-600">Checklist</div>
          <div className="text-xs text-gray-500 mt-1">${formatValue(data.checklist)}</div>
        </div>
        
        <div className="flex-1 h-full flex flex-col items-center justify-end">
          <div className="h-[25%] w-4/5 bg-gray-400"></div>
          <div className="mt-2 text-xs font-medium text-gray-600">Venture Capital</div>
          <div className="text-xs text-gray-500 mt-1">${formatValue(data.ventureCap)}</div>
        </div>
        
        <div className="flex-1 h-full flex flex-col items-center justify-end">
          <div className="h-[15%] w-4/5 bg-purple-400"></div>
          <div className="mt-2 text-xs font-medium text-gray-600">DCF Long Term Growth</div>
          <div className="text-xs text-gray-500 mt-1">${formatValue(data.dcfGrowth)}</div>
        </div>
        
        <div className="flex-1 h-full flex flex-col items-center justify-end">
          <div className="h-[20%] w-4/5 bg-green-400"></div>
          <div className="mt-2 text-xs font-medium text-gray-600">DCF with Multiples</div>
          <div className="text-xs text-gray-500 mt-1">${formatValue(data.dcfMultiple)}</div>
        </div>
      </div>
    </div>
  );
}

// Component to display method weights as gauges
function MethodWeightGauge({ name, weight, enabled }: { name: string, weight: number, enabled: boolean }) {
  // Calculate the fill percentage based on the maximum weight in the set (typically 30-40)
  // This makes the gauge fill proportional to the relative importance
  const fillPercentage = Math.min(100, (weight / 40) * 100);
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full h-[60px]">
        <div className="absolute inset-0 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`absolute bottom-0 left-0 right-0 ${enabled ? 'bg-purple-700' : 'bg-gray-400'}`} 
            style={{ height: `${fillPercentage}%` }}
          ></div>
        </div>
      </div>
      <div className="mt-2 text-center">
        <div className="font-bold text-sm">{weight}</div>
        <div className="text-xs truncate w-full">{name}</div>
      </div>
    </div>
  );
}

// Helper function to get bar color based on method
function getBarColor(method: string): string {
  switch(method) {
    case 'scorecard':
      return 'bg-purple-700';
    case 'checklist':
      return 'bg-red-400';
    case 'ventureCap':
      return 'bg-gray-400';
    case 'dcfGrowth':
      return 'bg-purple-400';
    case 'dcfMultiple':
      return 'bg-green-400';
    default:
      return 'bg-blue-400';
  }
}

// Helper function to format large numbers
function formatValue(value: number): string {
  // Handle very small numbers
  if (value < 1 && value > 0) {
    return value.toFixed(2);
  }
  
  // Handle very large numbers with intelligent rounding
  if (value >= 1000000) {
    // For millions, show 1 decimal place
    const millions = value / 1000000;
    if (millions >= 100) {
      // For very large values (100M+), show no decimal
      return `${Math.round(millions)}M`;
    }
    return `${millions.toFixed(1)}M`;
  } else if (value >= 1000) {
    // For thousands, show 1 decimal place for precision
    const thousands = value / 1000;
    if (thousands >= 100) {
      // For large thousands (100K+), show no decimal
      return `${Math.round(thousands)}K`;
    }
    return `${thousands.toFixed(1)}K`;
  } else {
    // For small numbers, show 0 decimals unless very small
    return `${Math.round(value)}`;
  }
}
