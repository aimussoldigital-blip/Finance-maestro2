import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, TrendingDown, Euro } from 'lucide-react';
import { Goal, useGoals } from '@/hooks/useGoals';

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal;
}

const WithdrawDialog = ({ open, onOpenChange, goal }: WithdrawDialogProps) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const { withdrawContribution } = useGoals();

  const maxWithdraw = goal.current_amount || 0;

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || numAmount > maxWithdraw) return;

    await withdrawContribution.mutateAsync({
      goalId: goal.id,
      amount: numAmount,
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
          <DialogTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-chart-expense" />
            Retirar de {goal.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">Disponible para retirar</p>
            <p className="text-xl font-bold text-primary">{formatCurrency(maxWithdraw)}</p>
          </div>

          <div className="space-y-2">
            <Label>Cantidad a retirar</Label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10 h-12 text-lg bg-muted rounded-xl"
                step="0.01"
                min="0"
                max={maxWithdraw}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nota (opcional)</Label>
            <Textarea
              placeholder="Motivo del retiro..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-muted rounded-xl resize-none"
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > maxWithdraw || withdrawContribution.isPending}
              className="flex-1 bg-chart-expense hover:bg-chart-expense/90"
            >
              {withdrawContribution.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Retirar'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawDialog;
