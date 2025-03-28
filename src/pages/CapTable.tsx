
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { DataTable } from '@/components/DataTable';
import { Plus, Upload, Download } from 'lucide-react';

export default function CapTable() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-2">Cap Table</h1>
        <p className="text-muted-foreground">Manage your company's shareholders and funding rounds</p>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Shareholders</h2>
          <Button variant="primary" size="sm" iconLeft={<Plus size={16} />}>Add Shareholder</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-3">
            <DataTable
              columns={[
                { key: 'name', header: 'Name' },
                { key: 'shares', header: 'Shares' },
                { key: 'percentage', header: 'Percentage' },
                { key: 'invested', header: 'Invested' },
                { key: 'contact', header: 'Contact' },
              ]}
              data={[]}
              emptyState="No shareholders data available"
            />
          </Card>
          
          <Card className="flex flex-col items-center justify-center p-8">
            <div className="text-6xl font-bold text-primary mb-2">0</div>
            <p className="text-muted-foreground text-sm text-center">No. of Shareholders</p>
          </Card>
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Foundation Round</h2>
          <div className="flex space-x-2">
            <Button variant="primary" size="sm" iconLeft={<Plus size={16} />}>Add Foundation Round</Button>
            <Button variant="outline" size="sm" iconLeft={<Plus size={16} />}>Add Share Class</Button>
            <Button variant="ghost" size="sm" iconLeft={<Upload size={16} />}>Transfer Shares</Button>
            <Button variant="ghost" size="sm" iconLeft={<Download size={16} />}>Export to Excel</Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Foundation Round</h3>
              <select className="rounded-md border border-border p-2 text-sm">
                <option>Select a round</option>
              </select>
            </div>
            
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left py-3 px-4">Shareholder</th>
                  <th className="text-left py-3 px-4">Number of Shares</th>
                  <th className="text-left py-3 px-4">Share Price</th>
                  <th className="text-left py-3 px-4">Share Class</th>
                  <th className="text-left py-3 px-4">Capital Invested</th>
                  <th className="text-left py-3 px-4">Share Percentage</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border font-medium">
                  <td className="py-3 px-4">Total</td>
                  <td className="py-3 px-4">0</td>
                  <td className="py-3 px-4">$0.00</td>
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-4">$0.00</td>
                  <td className="py-3 px-4">100%</td>
                </tr>
              </tbody>
            </table>
          </Card>
          
          <Card className="flex flex-col items-center justify-center p-8">
            <div className="text-6xl font-bold text-primary mb-2">0</div>
            <p className="text-muted-foreground text-sm text-center">Foundation</p>
          </Card>
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Rounds</h2>
          <div className="flex space-x-2">
            <Button variant="primary" size="sm" iconLeft={<Plus size={16} />}>Add Round</Button>
            <Button variant="outline" size="sm" iconLeft={<Plus size={16} />}>Add Share Class</Button>
            <Button variant="ghost" size="sm" iconLeft={<Download size={16} />}>Export to Excel</Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">-</h3>
              <select className="rounded-md border border-border p-2 text-sm">
                <option>Select a round</option>
              </select>
            </div>
            
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left py-3 px-4">Shareholder</th>
                  <th className="text-left py-3 px-4">Number of Shares</th>
                  <th className="text-left py-3 px-4">Share Price</th>
                  <th className="text-left py-3 px-4">Share Class</th>
                  <th className="text-left py-3 px-4">Capital Invested</th>
                  <th className="text-left py-3 px-4">Share Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border font-medium">
                  <td className="py-3 px-4">Total</td>
                  <td className="py-3 px-4">0</td>
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-4">$0.00</td>
                  <td className="py-3 px-4">$0.00</td>
                </tr>
              </tbody>
            </table>
          </Card>
          
          <Card className="flex flex-col items-center justify-center p-8">
            <div className="text-6xl font-bold text-primary mb-2">0</div>
            <p className="text-muted-foreground text-sm text-center"></p>
          </Card>
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">ESOPs</h2>
          <Button variant="primary" size="sm" iconLeft={<Plus size={16} />}>Add ESOP</Button>
        </div>
        
        <Card>
          <div className="h-40 flex items-center justify-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        </Card>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Loans</h2>
          <Button variant="primary" size="sm" iconLeft={<Plus size={16} />}>Add Loan</Button>
        </div>
        
        <Card>
          <div className="h-40 flex items-center justify-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
