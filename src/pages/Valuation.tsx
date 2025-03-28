
import { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { StepProgress } from '@/components/StepProgress';
import { Check, X } from 'lucide-react';

export default function Valuation() {
  const [activeTab, setActiveTab] = useState('questionnaire');

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
  const steps = [
    { number: 1, label: 'Team', isActive: true },
    { number: 2, label: 'Step 2' },
    { number: 3, label: 'Step 3' },
    { number: 4, label: 'Step 4' },
    { number: 5, label: 'Step 5' },
    { number: 6, label: 'Step 6' },
    { number: 7, label: 'Step 7' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Questionnaire Progress</h1>
        <p className="text-muted-foreground mb-6">Attract investors with an optimized Valuation! Let's continue →</p>
        
        <StepProgress steps={steps} currentStep={1} className="mb-8" />
        
        <h2 className="text-xl font-semibold mb-6 border-b border-border pb-3">Step 1: Team</h2>
      </div>
      
      <div className="space-y-6">
        <QuestionItem 
          number="1.1" 
          question="How many founders does the company have?" 
          input={<input type="number" defaultValue={5} className="w-full border border-border rounded-md p-2" />} 
        />
        
        <QuestionItem 
          number="1.2" 
          question="How much did the founders invest in the company in terms of capital collectively so far?" 
          input={
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
              <input type="number" defaultValue={0} className="w-full border border-border rounded-md p-2 pl-8" />
            </div>
          } 
        />
        
        <QuestionItem 
          number="1.3" 
          question="Is the majority of the founders involved in other companies or occupations?" 
          input={
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input type="radio" name="q3" className="h-4 w-4 text-primary border-border" />
                <span className="ml-2">Yes</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="q3" className="h-4 w-4 text-primary border-border" />
                <span className="ml-2">No</span>
              </label>
            </div>
          } 
        />
        
        <QuestionItem 
          number="1.4" 
          question="What is the average age of the founders?" 
          input={<input type="number" defaultValue={0} className="w-full border border-border rounded-md p-2" />} 
        />
        
        <QuestionItem 
          number="1.5" 
          question="Has any of the founders previous entrepreneurial experience?" 
          input={
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input type="radio" name="q5" className="h-4 w-4 text-primary border-border" />
                <span className="ml-2">Yes</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="q5" className="h-4 w-4 text-primary border-border" />
                <span className="ml-2">No</span>
              </label>
            </div>
          } 
        />
        
        <QuestionItem 
          number="1.6" 
          question="How many employees work for the company? (excluding founders, interns and freelancers)" 
          input={<input type="number" defaultValue={20} className="w-full border border-border rounded-md p-2" />} 
        />
        
        <QuestionItem 
          number="1.7" 
          question="How long have the members of the core team worked (or studied) together?" 
          input={<input type="number" defaultValue={0} className="w-full border border-border rounded-md p-2" />} 
        />
        
        <QuestionItem 
          number="1.8" 
          question="How many years of relevant industry experience does the core team have collectively?" 
          input={<input type="number" defaultValue={0} className="w-full border border-border rounded-md p-2" />} 
        />
      </div>
      
      <div className="flex justify-between pt-6">
        <Button variant="outline">Back</Button>
        <Button>Save and Next</Button>
      </div>
    </div>
  );
}

interface QuestionItemProps {
  number: string;
  question: string;
  input: React.ReactNode;
}

function QuestionItem({ number, question, input }: QuestionItemProps) {
  return (
    <div className="flex gap-6">
      <div className="w-14 h-14 flex-shrink-0 rounded-full bg-secondary text-primary flex items-center justify-center font-medium">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="font-medium mb-2">{question}</h3>
        {input}
      </div>
    </div>
  );
}

function ValuationContent() {
  const [rangeValue, setRangeValue] = useState(54);
  
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
              <p>2025</p>
            </div>
            <div>
              <span className="text-primary text-sm font-medium">Employees</span>
              <p>20</p>
            </div>
            <div>
              <span className="text-primary text-sm font-medium">Industry</span>
              <p>Business Support Services</p>
            </div>
            <div>
              <span className="text-primary text-sm font-medium">Business Activity</span>
              <p>Legal Services</p>
            </div>
            <div>
              <span className="text-primary text-sm font-medium">Last Revenue</span>
              <p>$1000</p>
            </div>
            <div>
              <span className="text-primary text-sm font-medium">Stage</span>
              <p>Growth</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <h2 className="text-xl font-bold mb-4">Valuation Status</h2>
          
          <div className="space-y-3">
            <div>
              <p className="font-medium">Initial Estimate</p>
              <p className="text-xl font-bold">$61,000</p>
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
            <p className="text-2xl font-bold">$0</p>
          </Card>
          
          <Card>
            <h3 className="text-sm text-muted-foreground mb-1">Investment</h3>
            <p className="text-2xl font-bold">$0</p>
          </Card>
          
          <Card>
            <h3 className="text-sm text-muted-foreground mb-1">Post-Money Valuation</h3>
            <p className="text-2xl font-bold">$0</p>
          </Card>
        </div>
        
        <Card className="p-6">
          <div className="flex justify-between mb-4">
            <div>
              <span className="text-sm text-muted-foreground">Low</span>
              <p className="font-medium">$44,000.00</p>
            </div>
            <div className="text-right">
              <span className="text-sm text-muted-foreground">High</span>
              <p className="font-medium">$64,000.00</p>
            </div>
          </div>
          
          <input
            type="range"
            min="44000"
            max="64000"
            step="1000"
            value={rangeValue * 1000}
            onChange={(e) => setRangeValue(Number(e.target.value) / 1000)}
            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
          />
          
          <div className="text-center mt-4">
            <span className="text-sm text-muted-foreground">Selected</span>
            <p className="font-bold text-lg">${rangeValue},000.00</p>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1">
          <h2 className="text-xl font-bold mb-4">Info</h2>
          
          <div className="space-y-3">
            <div>
              <span className="text-primary text-sm font-medium">Funds Raised</span>
              <p>$0</p>
            </div>
            <div>
              <span className="text-primary text-sm font-medium">Last Year EBITDA</span>
              <p>$0</p>
            </div>
            <div>
              <span className="text-primary text-sm font-medium">Industry Multiple</span>
              <p>8.067476</p>
            </div>
            <div>
              <span className="text-primary text-sm font-medium">Annual ROI</span>
              <p>3.2%</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function HistoryContent() {
  return (
    <div className="p-6 text-center animate-fade-in">
      <h2 className="text-xl font-medium mb-2">Valuation History</h2>
      <p className="text-muted-foreground">No history data available yet.</p>
    </div>
  );
}
