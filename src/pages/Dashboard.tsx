
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { PencilLine } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-2">Main Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to Diamond AI's dashboard</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Diamond AI</h3>
            <div className="text-sm text-primary mb-4">Industrial & Commercial Services • 2025-03-27</div>
            <a href="#" className="text-primary hover:underline text-sm">DiamondAI</a>
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <div className="mb-2">
              <span className="text-muted-foreground text-sm">Total Investment</span>
              <div className="font-semibold">$0</div>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">Share Price</span>
              <div className="font-semibold">$0.00</div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="mb-2">
            <span className="text-muted-foreground text-sm">Total Investment</span>
            <div className="font-semibold text-2xl mb-2">$0</div>
          </div>
          <div className="mb-4">
            <span className="text-muted-foreground text-sm">Valuation</span>
            <div className="font-semibold text-2xl">$0</div>
          </div>
          <a href="/valuation" className="text-primary hover:underline text-sm">View Valuation</a>
        </Card>
        
        <Card>
          <div className="mb-2">
            <span className="text-muted-foreground text-sm">Stage</span>
            <div className="font-semibold text-xl">Series A</div>
          </div>
        </Card>
        
        <Card className="md:col-span-2">
          <h3 className="text-lg font-medium text-primary mb-4">Profile Optimized</h3>
          <ProgressBar value={20} max={100} />
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
            value="$0.00" 
            target="0% vs Target" 
            change="0% vs Last Month" 
            isUp={true} 
          />
          <FinancialCard 
            title="Gross Margin" 
            value="0%" 
            target="0% vs Target" 
            change="0% vs Last Month" 
            isUp={true} 
          />
          <FinancialCard 
            title="Cash on Hand" 
            value="$0.00" 
            target="0% vs Target" 
            change="0% vs Last Month" 
            isUp={true} 
          />
          <FinancialCard 
            title="No. of Paying Customers" 
            value="0" 
            target="0% vs Target" 
            change="0% vs Last Month" 
            isUp={true} 
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
