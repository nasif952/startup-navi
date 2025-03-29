
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { DataTable } from '@/components/DataTable';
import { Plus, Upload, Download, UserPlus, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AddShareholderDialog } from '@/components/dialogs/AddShareholderDialog';
import { AddRoundDialog } from '@/components/dialogs/AddRoundDialog';
import { AddInvestmentDialog } from '@/components/dialogs/AddInvestmentDialog';
import { AddShareClassDialog } from '@/components/dialogs/AddShareClassDialog';
import { TransferSharesDialog } from '@/components/dialogs/TransferSharesDialog';
import { AddESOPDialog } from '@/components/dialogs/AddESOPDialog';
import { AddLoanDialog } from '@/components/dialogs/AddLoanDialog';
import { formatCurrency, formatPercentage, formatNumber } from '@/lib/formatters';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table";

export default function CapTable() {
  // State for all our data
  const [shareholders, setShareholders] = useState([]);
  const [foundationRounds, setFoundationRounds] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [selectedFoundationRound, setSelectedFoundationRound] = useState(null);
  const [selectedRound, setSelectedRound] = useState(null);
  const [shareholderCount, setShareholderCount] = useState(0);
  const [esops, setEsops] = useState([]);
  const [loans, setLoans] = useState([]);
  const [shareClasses, setShareClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initial data loading
  useEffect(() => {
    async function fetchInitialData() {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchShareholders(),
          fetchRounds(),
          fetchESOPs(),
          fetchLoans(),
          fetchShareClasses()
        ]);
        toast({
          title: "Data loaded",
          description: "Cap table data has been loaded successfully"
        });
      } catch (error) {
        console.error('Error fetching cap table data:', error);
        toast({
          title: "Error loading data",
          description: "There was a problem loading the cap table data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchInitialData();
  }, []);

  // Data fetching functions
  async function fetchShareholders() {
    const { data, error } = await supabase
      .from('shareholder_investments')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    setShareholders(data || []);
    setShareholderCount(data?.length || 0);
  }

  async function fetchRounds() {
    // Fetch foundation rounds
    const { data: foundationData, error: foundationError } = await supabase
      .from('funding_rounds')
      .select('*, round_summaries(*)')
      .eq('is_foundation', true);
    
    if (foundationError) {
      throw foundationError;
    }
    
    setFoundationRounds(foundationData || []);
    if (foundationData?.length > 0 && !selectedFoundationRound) {
      setSelectedFoundationRound(foundationData[0]);
      fetchRoundInvestments(foundationData[0].id).then(investments => {
        setSelectedFoundationRound({...foundationData[0], investments});
      });
    }
    
    // Fetch regular rounds
    const { data: roundsData, error: roundsError } = await supabase
      .from('funding_rounds')
      .select('*, round_summaries(*)')
      .eq('is_foundation', false);
    
    if (roundsError) {
      throw roundsError;
    }
    
    setRounds(roundsData || []);
    if (roundsData?.length > 0 && !selectedRound) {
      setSelectedRound(roundsData[0]);
      fetchRoundInvestments(roundsData[0].id).then(investments => {
        setSelectedRound({...roundsData[0], investments});
      });
    }
  }

  async function fetchESOPs() {
    const { data, error } = await supabase
      .from('esops')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    setEsops(data || []);
  }

  async function fetchLoans() {
    const { data, error } = await supabase
      .from('loans')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    setLoans(data || []);
  }
  
  async function fetchShareClasses() {
    const { data, error } = await supabase
      .from('share_classes')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    setShareClasses(data || []);
  }

  async function fetchRoundInvestments(roundId) {
    const { data, error } = await supabase
      .from('investments')
      .select(`
        id, 
        number_of_shares, 
        share_price, 
        capital_invested,
        shareholders:shareholder_id (id, name),
        share_classes:share_class_id (id, name)
      `)
      .eq('round_id', roundId);
    
    if (error) {
      throw error;
    }
    
    return data || [];
  }

  // Handle round selection changes
  const handleFoundationRoundChange = async (e) => {
    const roundId = e.target.value;
    if (roundId === "select") {
      setSelectedFoundationRound(null);
      return;
    }
    
    try {
      const foundRound = foundationRounds.find(r => r.id === roundId);
      if (!foundRound) return;
      
      const investments = await fetchRoundInvestments(roundId);
      setSelectedFoundationRound({...foundRound, investments});
    } catch (error) {
      console.error('Error fetching foundation round details:', error);
      toast({
        title: "Error",
        description: "Could not load foundation round details",
        variant: "destructive"
      });
    }
  };

  const handleRoundChange = async (e) => {
    const roundId = e.target.value;
    if (roundId === "select") {
      setSelectedRound(null);
      return;
    }
    
    try {
      const foundRound = rounds.find(r => r.id === roundId);
      if (!foundRound) return;
      
      const investments = await fetchRoundInvestments(roundId);
      setSelectedRound({...foundRound, investments});
    } catch (error) {
      console.error('Error fetching round details:', error);
      toast({
        title: "Error",
        description: "Could not load round details",
        variant: "destructive"
      });
    }
  };

  // Refresh data after changes
  const handleDataChange = async () => {
    try {
      await Promise.all([
        fetchShareholders(),
        fetchRounds(),
        fetchESOPs(),
        fetchLoans(),
        fetchShareClasses()
      ]);
      
      // If rounds were selected, refresh their investments
      if (selectedFoundationRound) {
        const investments = await fetchRoundInvestments(selectedFoundationRound.id);
        setSelectedFoundationRound({...selectedFoundationRound, investments});
      }
      
      if (selectedRound) {
        const investments = await fetchRoundInvestments(selectedRound.id);
        setSelectedRound({...selectedRound, investments});
      }
      
      toast({
        title: "Updated",
        description: "Cap table data has been refreshed"
      });
    } catch (error) {
      console.error('Error refreshing cap table data:', error);
      toast({
        title: "Error",
        description: "Could not refresh cap table data",
        variant: "destructive"
      });
    }
  };

  // Export to Excel function (simplified mock)
  const handleExportToExcel = () => {
    toast({
      title: "Export started",
      description: "Your data is being exported to Excel"
    });
    
    // In a real implementation, this would generate an Excel file
    setTimeout(() => {
      toast({
        title: "Export complete",
        description: "Your Excel file has been downloaded"
      });
    }, 1500);
  };

  // Calculate percentages and totals for shareholders
  const calculateShareholderPercentage = (shareholder) => {
    if (!shareholder.total_shares) return "0%";
    
    const allSharesSum = shareholders.reduce(
      (sum, s) => sum + (Number(s.total_shares) || 0), 
      0
    );
    
    if (allSharesSum === 0) return "0%";
    
    return `${((shareholder.total_shares / allSharesSum) * 100).toFixed(2)}%`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-2">Cap Table</h1>
        <p className="text-muted-foreground">Manage your company's shareholders and funding rounds</p>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Shareholders</h2>
          <AddShareholderDialog 
            trigger={
              <Button variant="primary" size="sm" iconLeft={<UserPlus size={16} />}>
                Add Shareholder
              </Button>
            } 
            onShareholderAdded={handleDataChange}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-3">
            <DataTable
              columns={[
                { key: 'name', header: 'Name' },
                { 
                  key: 'total_shares', 
                  header: 'Shares',
                  render: (value) => formatNumber(value) 
                },
                { 
                  key: 'percentage', 
                  header: 'Percentage',
                  render: (_, item) => calculateShareholderPercentage(item)
                },
                { 
                  key: 'total_invested', 
                  header: 'Invested',
                  render: (value) => formatCurrency(value)
                },
                { key: 'contact', header: 'Contact' },
              ]}
              data={shareholders}
              emptyState={
                <div className="flex flex-col items-center py-8">
                  <p className="text-muted-foreground mb-4">No shareholders added yet</p>
                  <AddShareholderDialog 
                    trigger={
                      <Button variant="outline" iconLeft={<UserPlus size={16} />}>
                        Add Your First Shareholder
                      </Button>
                    } 
                    onShareholderAdded={handleDataChange}
                  />
                </div>
              }
            />
          </Card>
          
          <Card className="flex flex-col items-center justify-center p-8">
            <div className="text-6xl font-bold text-primary mb-2">{shareholderCount}</div>
            <p className="text-muted-foreground text-sm text-center">No. of Shareholders</p>
          </Card>
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Foundation Round</h2>
          <div className="flex space-x-2">
            <AddRoundDialog 
              trigger={
                <Button variant="primary" size="sm" iconLeft={<Plus size={16} />}>
                  Add Foundation Round
                </Button>
              }
              isFoundation={true}
              onRoundAdded={handleDataChange}
            />
            <AddShareClassDialog 
              trigger={
                <Button variant="outline" size="sm" iconLeft={<Plus size={16} />}>
                  Add Share Class
                </Button>
              }
              onShareClassAdded={handleDataChange}
            />
            <TransferSharesDialog 
              trigger={
                <Button variant="ghost" size="sm" iconLeft={<Upload size={16} />}>
                  Transfer Shares
                </Button>
              }
              shareholders={shareholders}
              onSharesTransferred={handleDataChange}
            />
            <Button 
              variant="ghost" 
              size="sm" 
              iconLeft={<Download size={16} />}
              onClick={handleExportToExcel}
            >
              Export to Excel
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-3">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-medium">Foundation Round</h3>
              <div className="flex items-center space-x-4">
                <select 
                  className="rounded-md border border-border p-2 text-sm"
                  onChange={handleFoundationRoundChange}
                  value={selectedFoundationRound?.id || "select"}
                >
                  <option value="select">Select a round</option>
                  {foundationRounds.map(round => (
                    <option key={round.id} value={round.id}>
                      {round.name}
                    </option>
                  ))}
                </select>
                
                {selectedFoundationRound && (
                  <AddInvestmentDialog
                    trigger={
                      <Button variant="outline" size="sm" iconLeft={<DollarSign size={16} />}>
                        Add Investment
                      </Button>
                    }
                    roundId={selectedFoundationRound.id}
                    isFoundation={true}
                    onInvestmentAdded={handleDataChange}
                  />
                )}
              </div>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shareholder</TableHead>
                  <TableHead>Number of Shares</TableHead>
                  <TableHead>Share Price</TableHead>
                  <TableHead>Share Class</TableHead>
                  <TableHead>Capital Invested</TableHead>
                  <TableHead>Share Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedFoundationRound?.investments?.length > 0 ? (
                  selectedFoundationRound.investments.map(investment => (
                    <TableRow key={investment.id}>
                      <TableCell>{investment.shareholders?.name || 'Unknown'}</TableCell>
                      <TableCell>{formatNumber(investment.number_of_shares)}</TableCell>
                      <TableCell>{formatCurrency(investment.share_price)}</TableCell>
                      <TableCell>{investment.share_classes?.name || 'Common'}</TableCell>
                      <TableCell>{formatCurrency(investment.capital_invested)}</TableCell>
                      <TableCell>
                        {selectedFoundationRound.round_summaries?.[0]?.total_shares
                          ? formatPercentage((investment.number_of_shares / selectedFoundationRound.round_summaries[0].total_shares) * 100)
                          : '0%'
                        }
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-32">
                      {selectedFoundationRound ? (
                        <div className="flex flex-col items-center py-8">
                          <p className="text-muted-foreground mb-4">No investments in this round yet</p>
                          <AddInvestmentDialog
                            trigger={
                              <Button variant="outline" iconLeft={<DollarSign size={16} />}>
                                Add First Investment
                              </Button>
                            }
                            roundId={selectedFoundationRound.id}
                            isFoundation={true}
                            onInvestmentAdded={handleDataChange}
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center py-8">
                          <p className="text-muted-foreground mb-4">Please select or create a foundation round</p>
                          <AddRoundDialog 
                            trigger={
                              <Button variant="outline" iconLeft={<Plus size={16} />}>
                                Create Foundation Round
                              </Button>
                            }
                            isFoundation={true}
                            onRoundAdded={handleDataChange}
                          />
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
                {selectedFoundationRound?.investments?.length > 0 && (
                  <TableRow className="bg-muted/40 font-medium">
                    <TableCell>Total</TableCell>
                    <TableCell>
                      {formatNumber(selectedFoundationRound?.round_summaries?.[0]?.total_shares || 0)}
                    </TableCell>
                    <TableCell>
                      {selectedFoundationRound?.round_summaries?.[0]?.total_shares > 0
                        ? formatCurrency(
                            selectedFoundationRound.round_summaries[0].total_capital / 
                            selectedFoundationRound.round_summaries[0].total_shares
                          )
                        : '$0.00'
                      }
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell>
                      {formatCurrency(selectedFoundationRound?.round_summaries?.[0]?.total_capital || 0)}
                    </TableCell>
                    <TableCell>100%</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
          
          <Card className="flex flex-col items-center justify-center p-8">
            <div className="text-6xl font-bold text-primary mb-2">
              {formatCurrency(selectedFoundationRound?.valuation || 0, 0)}
            </div>
            <p className="text-muted-foreground text-sm text-center">Foundation</p>
          </Card>
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Rounds</h2>
          <div className="flex space-x-2">
            <AddRoundDialog 
              trigger={
                <Button variant="primary" size="sm" iconLeft={<Plus size={16} />}>
                  Add Round
                </Button>
              }
              isFoundation={false}
              onRoundAdded={handleDataChange}
            />
            <AddShareClassDialog 
              trigger={
                <Button variant="outline" size="sm" iconLeft={<Plus size={16} />}>
                  Add Share Class
                </Button>
              }
              onShareClassAdded={handleDataChange}
            />
            <Button 
              variant="ghost" 
              size="sm" 
              iconLeft={<Download size={16} />}
              onClick={handleExportToExcel}
            >
              Export to Excel
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-3">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-medium">{selectedRound?.name || 'Funding Round'}</h3>
              <div className="flex items-center space-x-4">
                <select 
                  className="rounded-md border border-border p-2 text-sm"
                  onChange={handleRoundChange}
                  value={selectedRound?.id || "select"}
                >
                  <option value="select">Select a round</option>
                  {rounds.map(round => (
                    <option key={round.id} value={round.id}>
                      {round.name}
                    </option>
                  ))}
                </select>
                
                {selectedRound && (
                  <AddInvestmentDialog
                    trigger={
                      <Button variant="outline" size="sm" iconLeft={<DollarSign size={16} />}>
                        Add Investment
                      </Button>
                    }
                    roundId={selectedRound.id}
                    onInvestmentAdded={handleDataChange}
                  />
                )}
              </div>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shareholder</TableHead>
                  <TableHead>Number of Shares</TableHead>
                  <TableHead>Share Price</TableHead>
                  <TableHead>Share Class</TableHead>
                  <TableHead>Capital Invested</TableHead>
                  <TableHead>Share Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedRound?.investments?.length > 0 ? (
                  selectedRound.investments.map(investment => (
                    <TableRow key={investment.id}>
                      <TableCell>{investment.shareholders?.name || 'Unknown'}</TableCell>
                      <TableCell>{formatNumber(investment.number_of_shares)}</TableCell>
                      <TableCell>{formatCurrency(investment.share_price)}</TableCell>
                      <TableCell>{investment.share_classes?.name || 'Common'}</TableCell>
                      <TableCell>{formatCurrency(investment.capital_invested)}</TableCell>
                      <TableCell>
                        {formatCurrency(investment.number_of_shares * investment.share_price)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-32">
                      {selectedRound ? (
                        <div className="flex flex-col items-center py-8">
                          <p className="text-muted-foreground mb-4">No investments in this round yet</p>
                          <AddInvestmentDialog
                            trigger={
                              <Button variant="outline" iconLeft={<DollarSign size={16} />}>
                                Add First Investment
                              </Button>
                            }
                            roundId={selectedRound.id}
                            onInvestmentAdded={handleDataChange}
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center py-8">
                          <p className="text-muted-foreground mb-4">Please select or create a funding round</p>
                          <AddRoundDialog 
                            trigger={
                              <Button variant="outline" iconLeft={<Plus size={16} />}>
                                Create Funding Round
                              </Button>
                            }
                            onRoundAdded={handleDataChange}
                          />
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
                {selectedRound?.investments?.length > 0 && (
                  <TableRow className="bg-muted/40 font-medium">
                    <TableCell>Total</TableCell>
                    <TableCell>
                      {formatNumber(selectedRound?.round_summaries?.[0]?.total_shares || 0)}
                    </TableCell>
                    <TableCell>
                      {selectedRound?.round_summaries?.[0]?.total_shares > 0
                        ? formatCurrency(
                            selectedRound.round_summaries[0].total_capital / 
                            selectedRound.round_summaries[0].total_shares
                          )
                        : '$0.00'
                      }
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell>
                      {formatCurrency(selectedRound?.round_summaries?.[0]?.total_capital || 0)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(selectedRound?.valuation || 0, 0)}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
          
          <Card className="flex flex-col items-center justify-center p-8">
            <div className="text-6xl font-bold text-primary mb-2">
              {formatCurrency(selectedRound?.valuation || 0, 0)}
            </div>
            <p className="text-muted-foreground text-sm text-center">
              {selectedRound?.name || 'Valuation'}
            </p>
          </Card>
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">ESOPs</h2>
          <AddESOPDialog 
            trigger={
              <Button variant="primary" size="sm" iconLeft={<Plus size={16} />}>
                Add ESOP
              </Button>
            } 
            onESOPAdded={handleDataChange}
          />
        </div>
        
        <Card>
          {esops.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Total Shares</TableHead>
                  <TableHead>Vesting Period</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {esops.map(esop => (
                  <TableRow key={esop.id}>
                    <TableCell>{esop.name}</TableCell>
                    <TableCell>{formatNumber(esop.total_shares)}</TableCell>
                    <TableCell>{esop.vesting_period}</TableCell>
                    <TableCell>
                      {new Date(esop.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="h-40 flex items-center justify-center">
              <p className="text-muted-foreground">No ESOP data available</p>
            </div>
          )}
        </Card>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Loans</h2>
          <AddLoanDialog 
            trigger={
              <Button variant="primary" size="sm" iconLeft={<Plus size={16} />}>
                Add Loan
              </Button>
            } 
            onLoanAdded={handleDataChange}
          />
        </div>
        
        <Card>
          {loans.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Interest Rate</TableHead>
                  <TableHead>Term (months)</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map(loan => (
                  <TableRow key={loan.id}>
                    <TableCell>{loan.name}</TableCell>
                    <TableCell>{formatCurrency(loan.amount)}</TableCell>
                    <TableCell>{loan.interest_rate}%</TableCell>
                    <TableCell>{loan.term_months}</TableCell>
                    <TableCell>
                      {new Date(loan.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="h-40 flex items-center justify-center">
              <p className="text-muted-foreground">No loan data available</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
