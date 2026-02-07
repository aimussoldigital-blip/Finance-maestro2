import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Euro, AlertCircle } from 'lucide-react';
import { useInvestments, Investment } from '@/hooks/useInvestments';

interface WithdrawInvestmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investment: Investment;
}

const WithdrawInvestmentDialog = ({ open, onOpenChange, investment }: WithdrawInvestmentDialogProps) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  
  const { withdrawContribution } = useInvestments();

  const currentValue = investment.current_value || 0;
  const withdrawAmount = parseFloat(amount) || 0;
  const isValidAmount = withdrawAmount > 0 && withdrawAmount <= currentValue;

  const handleWithdraw = async () => {
    if (!isValidAmount) return;

    await withdrawContribution.mutateAsync({
      investmentId: investment.id,
      amount: withdrawAmount,
      note: note || undefined,
    });

    setAmount('');
    setNote('');
    onOpenChange(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Retirar de {investment.name}</DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <p className="text-center text-2xl font-bold text-chart-investment">
            {formatCurrency(currentValue)}
          </p>
          <p className="text-center text-sm text-muted-foreground">Valor actual disponible</p>
        </div>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="withdraw-amount">Monto a retirar</Label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="withdraw-amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                max={currentValue}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10"
              />
            </div>
            {withdrawAmount > currentValue && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                El monto excede el valor disponible
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdraw-note">Nota (opcional)</Label>
            <Textarea
              id="withdraw-note"
              placeholder="Añade una nota..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>

          <Button 
            onClick={handleWithdraw} 
            disabled={!isValidAmount || withdrawContribution.isPending}
            className="w-full bg-destructive hover:bg-destructive/90"
          >
            {withdrawContribution.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Retirar {withdrawAmount > 0 ? formatCurrency(withdrawAmount) : ''}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawInvestmentDialog;
