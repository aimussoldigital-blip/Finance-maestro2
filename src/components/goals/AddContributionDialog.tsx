import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Euro } from 'lucide-react';
import { useGoals, Goal } from '@/hooks/useGoals';

interface AddContributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal;
}

const AddContributionDialog = ({ open, onOpenChange, goal }: AddContributionDialogProps) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  
  const { addContribution } = useGoals();

  const remaining = goal.target_amount - (goal.current_amount || 0);

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    await addContribution.mutateAsync({
      goalId: goal.id,
      amount: parseFloat(amount),
      note: note || undefined,
    });

    setAmount('');
    setNote('');
    onOpenChange(false);
  };

  const isValid = amount && parseFloat(amount) > 0;

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
          <DialogTitle>Aportar a "{goal.name}"</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progreso actual</span>
              <span className="font-medium">{formatCurrency(goal.current_amount || 0)} / {formatCurrency(goal.target_amount)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Falta por ahorrar</span>
              <span className="font-medium text-primary">{formatCurrency(remaining)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contribution-amount">Monto a aportar</Label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="contribution-amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10 text-xl font-semibold h-14"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contribution-note">Nota (opcional)</Label>
            <Textarea
              id="contribution-note"
              placeholder="Añade una nota..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isValid || addContribution.isPending}
            className="flex-1 gradient-primary"
          >
            {addContribution.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Aportar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddContributionDialog;
