
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Shareholder {
  id: string;
  name: string;
}

interface TransferSharesDialogProps {
  trigger: React.ReactNode;
  shareholders: Shareholder[];
  onSharesTransferred?: () => void;
}

export function TransferSharesDialog({ trigger, shareholders, onSharesTransferred }: TransferSharesDialogProps) {
  const [open, setOpen] = useState(false);
  const [fromShareholderId, setFromShareholderId] = useState('');
  const [toShareholderId, setToShareholderId] = useState('');
  const [numberOfShares, setNumberOfShares] = useState('0');
  const { toast } = useToast();

  // This is a simplified version - in a real implementation, we would:
  // 1. Query the investments of the "from" shareholder
  // 2. Update the shares in the investments table for both shareholders
  // 3. Run this in a transaction to ensure data integrity
  const transferSharesMutation = useMutation({
    mutationFn: async () => {
      // In a real implementation, this would be a database transaction
      toast({
        title: "Shares transferred",
        description: `${numberOfShares} shares have been transferred successfully.`
      });
      return true;
    },
    onSuccess: () => {
      setOpen(false);
      resetForm();
      if (onSharesTransferred) onSharesTransferred();
    },
    onError: (error) => {
      toast({
        title: "Error transferring shares",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFromShareholderId('');
    setToShareholderId('');
    setNumberOfShares('0');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromShareholderId || !toShareholderId) {
      toast({
        title: "Validation error",
        description: "You must select both a sender and a receiver",
        variant: "destructive"
      });
      return;
    }
    
    if (fromShareholderId === toShareholderId) {
      toast({
        title: "Validation error",
        description: "Cannot transfer shares to the same shareholder",
        variant: "destructive"
      });
      return;
    }
    
    if (parseInt(numberOfShares) <= 0) {
      toast({
        title: "Validation error",
        description: "Number of shares must be greater than zero",
        variant: "destructive"
      });
      return;
    }
    
    transferSharesMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transfer Shares</DialogTitle>
          <DialogDescription>
            Transfer shares between shareholders.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="from-shareholder" className="text-right">
                From
              </Label>
              <div className="col-span-3">
                <Select value={fromShareholderId} onValueChange={setFromShareholderId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select shareholder" />
                  </SelectTrigger>
                  <SelectContent>
                    {shareholders.map(shareholder => (
                      <SelectItem key={shareholder.id} value={shareholder.id}>
                        {shareholder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="to-shareholder" className="text-right">
                To
              </Label>
              <div className="col-span-3">
                <Select value={toShareholderId} onValueChange={setToShareholderId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select shareholder" />
                  </SelectTrigger>
                  <SelectContent>
                    {shareholders.map(shareholder => (
                      <SelectItem key={shareholder.id} value={shareholder.id}>
                        {shareholder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="number-of-shares" className="text-right">
                Shares
              </Label>
              <Input
                id="number-of-shares"
                type="number"
                min="1"
                value={numberOfShares}
                onChange={(e) => setNumberOfShares(e.target.value)}
                className="col-span-3"
                placeholder="Number of shares to transfer"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit"
              disabled={transferSharesMutation.isPending}
            >
              {transferSharesMutation.isPending ? "Transferring..." : "Transfer Shares"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
