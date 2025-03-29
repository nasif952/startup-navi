
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { PencilLine } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatPercentage, formatNumber } from '@/lib/formatters';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { toast } = useToast();
  
  // Query to fetch company data
  const { data: company } = useQuery({
    queryKey: ['company'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .limit(1)
        .single();
        
      if (error) {
        toast({
          title: "Error loading company data",
          description: error.message,
          variant: "destructive"
        });
        return null;
      }
      
      return data;
    },
  });
  
  // Query to fetch valuation data
  const { data: valuation } = useQuery({
    queryKey: ['valuation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('valuations')
        .select('*')
        .limit(1)
        .single();
        
      if (error) {
        console.error("Error fetching valuation:", error);
        return null;
      }
      
      return data;
    },
  });
  
  // Query to fetch investment data
  const { data: investments } = useQuery({
    queryKey: ['investments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investments')
        .select('*');
        
      if (error) {
        console.error("Error fetching investments:", error);
        return [];
      }
      
      return data;
    },
  });
  
  // Query to fetch the latest performance metrics
  const { data: performanceMetrics } = useQuery({
    queryKey: ['performance-metrics-latest'],
    queryFn: async () => {
      // Get the current month and year
      const now = new Date();
      const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
      const currentYear = now.getFullYear();
      
      // Query for metrics from the current month and year
      const { data, error } = await supabase
        .from('performance_values')
        .select('*, performance_metrics(name, unit)')
        .eq('month', currentMonth)
        .eq('year', currentYear);
        
      if (error) {
        console.error("Error fetching performance metrics:", error);
        return [];
      }
      
      return data;
    },
  });
  
  // Calculate total investment
  const totalInvestment = investments?.reduce((sum, investment) => 
    sum + (investment.capital_invested || 0), 0) || 0;
    
  // Calculate share price if we have investments with shares
  const sharePrice = () => {
    if (!investments || investments.length === 0) return 0;
    
    const totalShares = investments.reduce((sum, inv) => sum + (inv.number_of_shares || 0), 0);
    return totalShares > 0 ? totalInvestment / totalShares : 0;
  };
  
  // Find metrics for different categories
  const getMetricValue = (metricName) => {
    if (!performanceMetrics) return null;
    
    const metric = performanceMetrics.find(m => 
      m.performance_metrics?.name?.toLowerCase() === metricName.toLowerCase()
    );
    
    return metric;
  };
  
  const revenueMetric = getMetricValue('revenue');
  const grossMarginMetric = getMetricValue('gross margin');
  const cashMetric = getMetricValue('cash on hand');
  const customersMetric = getMetricValue('no. of paying customers');
  
  // Helper functions to calculate percentage changes
  const calculateChange = (actual, target) => {
    if (!target || target === 0) return 0;
    return ((actual - target) / target) * 100;
  };
  
  // Profile completion percentage (mock for now)
  const profileCompletion = 20;
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-2">Main Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to {company?.name || "Diamond AI"}'s dashboard</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">{company?.name || "Diamond AI"}</h3>
            <div className="text-sm text-primary mb-4">{company?.industry || "Industrial & Commercial Services"} • {company?.founded_year || "2025-03-27"}</div>
            <a href="#" className="text-primary hover:underline text-sm">{company?.business_activity || "DiamondAI"}</a>
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <div className="mb-2">
              <span className="text-muted-foreground text-sm">Total Investment</span>
              <div className="font-semibold">{formatCurrency(totalInvestment)}</div>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">Share Price</span>
              <div className="font-semibold">{formatCurrency(sharePrice())}</div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="mb-2">
            <span className="text-muted-foreground text-sm">Total Investment</span>
            <div className="font-semibold text-2xl mb-2">{formatCurrency(totalInvestment)}</div>
          </div>
          <div className="mb-4">
            <span className="text-muted-foreground text-sm">Valuation</span>
            <div className="font-semibold text-2xl">{formatCurrency(valuation?.selected_valuation || 0)}</div>
          </div>
          <Link to="/valuation" className="text-primary hover:underline text-sm">View Valuation</Link>
        </Card>
        
        <Card>
          <div className="mb-2">
            <span className="text-muted-foreground text-sm">Stage</span>
            <div className="font-semibold text-xl">{company?.stage || "Series A"}</div>
          </div>
        </Card>
        
        <Card className="md:col-span-2">
          <h3 className="text-lg font-medium text-primary mb-4">Profile Optimized</h3>
          <ProgressBar value={profileCompletion} max={100} />
          <div className="mt-4 text-right">
            <a href="#" className="text-primary hover:underline text-sm">Complete Optimization</a>
          </div>
        </Card>
        
        <Card>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium text-primary">Problem</h3>
            <button className="text-muted-foreground hover:text-primary transition-colors">
              <PencilLine size={16} />
            </button>
          </div>
          <Button variant="primary" className="w-full">Add Your Answer</Button>
        </Card>
        
        <Card>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium text-primary">Solution</h3>
            <button className="text-muted-foreground hover:text-primary transition-colors">
              <PencilLine size={16} />
            </button>
          </div>
          <Button variant="primary" className="w-full">Add Your Answer</Button>
        </Card>
        
        <Card>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium text-primary">Why Now?</h3>
            <button className="text-muted-foreground hover:text-primary transition-colors">
              <PencilLine size={16} />
            </button>
          </div>
          <Button variant="primary" className="w-full">Add Your Answer</Button>
        </Card>
        
        <Card>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium text-primary">Business Model</h3>
            <button className="text-muted-foreground hover:text-primary transition-colors">
              <PencilLine size={16} />
            </button>
          </div>
          <Button variant="primary" className="w-full">Add Your Answer</Button>
        </Card>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Financial Overview</h2>
          <Button variant="outline" size="sm">This Month</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <FinancialCard 
            title="Revenue" 
            value={revenueMetric?.actual ? formatCurrency(revenueMetric.actual) : "$0.00"} 
            target={revenueMetric?.target ? `${formatPercentage(calculateChange(revenueMetric.actual, revenueMetric.target))} vs Target` : "0% vs Target"} 
            change="0% vs Last Month" 
            isUp={revenueMetric?.actual > 0}
          />
          <FinancialCard 
            title="Gross Margin" 
            value={grossMarginMetric?.actual ? `${grossMarginMetric.actual}%` : "0%"} 
            target={grossMarginMetric?.target ? `${formatPercentage(calculateChange(grossMarginMetric.actual, grossMarginMetric.target))} vs Target` : "0% vs Target"} 
            change="0% vs Last Month" 
            isUp={grossMarginMetric?.actual > 0}
          />
          <FinancialCard 
            title="Cash on Hand" 
            value={cashMetric?.actual ? formatCurrency(cashMetric.actual) : "$0.00"} 
            target={cashMetric?.target ? `${formatPercentage(calculateChange(cashMetric.actual, cashMetric.target))} vs Target` : "0% vs Target"} 
            change="0% vs Last Month" 
            isUp={cashMetric?.actual > 0}
          />
          <FinancialCard 
            title="No. of Paying Customers" 
            value={customersMetric?.actual ? formatNumber(customersMetric.actual) : "0"} 
            target={customersMetric?.target ? `${formatPercentage(calculateChange(customersMetric.actual, customersMetric.target))} vs Target` : "0% vs Target"} 
            change="0% vs Last Month" 
            isUp={customersMetric?.actual > 0}
          />
        </div>
      </div>
    </div>
  );
}

interface FinancialCardProps {
  title: string;
  value: string;
  target: string;
  change: string;
  isUp: boolean;
}

function FinancialCard({ title, value, target, change, isUp }: FinancialCardProps) {
  return (
    <Card>
      <div className="flex justify-between items-start mb-1">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <button className="text-muted-foreground hover:text-primary transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="2" fill="currentColor" />
            <circle cx="12" cy="5" r="2" fill="currentColor" />
            <circle cx="12" cy="19" r="2" fill="currentColor" />
          </svg>
        </button>
      </div>
      <div className="flex items-end mb-3">
        <div className="text-2xl font-bold">{value}</div>
        {isUp && (
          <svg className="ml-2 text-green-500" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div className="text-xs text-muted-foreground mb-1">{target}</div>
      <div className="text-xs text-muted-foreground">{change}</div>
    </Card>
  );
}
