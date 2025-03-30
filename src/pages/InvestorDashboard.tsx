
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';

export default function InvestorDashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-2">Investor Dashboard</h1>
        <p className="text-muted-foreground">Track your investments and deal flow</p>
      </div>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Coming Soon</h2>
        <p className="text-muted-foreground">
          The investor dashboard feature is currently in development and will be available soon.
        </p>
      </Card>
    </div>
  );
}
