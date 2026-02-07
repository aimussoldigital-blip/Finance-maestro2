import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Euro } from 'lucide-react';
import { useGoals } from '@/hooks/useGoals';
import CategoryIcon from '@/components/ui/CategoryIcon';

const goalIcons = [
  'target', 'piggy-bank', 'plane', 'car', 'home', 'gift', 
  'laptop', 'graduation-cap', 'heart', 'umbrella', 'shield', 'star'
];

interface CreateGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateGoalDialog = ({ open, onOpenChange }: CreateGoalDialogProps) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('target');
  
  const { createGoal } = useGoals();

  const handleSubmit = async () => {
    if (!name || !targetAmount || parseFloat(targetAmount) <= 0) return;

    await createGoal.mutateAsync({
      name,
      target_amount: parseFloat(targetAmount),
      icon: selectedIcon,
    });

    setName('');
    setTargetAmount('');
    setSelectedIcon('target');
    onOpenChange(false);
  };

  const isValid = name && targetAmount && parseFloat(targetAmount) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva Meta de Ahorro</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="goal-name">Nombre de la meta</Label>
            <Input
              id="goal-name"
              placeholder="Ej: Vacaciones, Coche nuevo..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-amount">Objetivo</Label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="target-amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Icono</Label>
            <div className="grid grid-cols-6 gap-2">
              {goalIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedIcon === icon
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <CategoryIcon icon={icon} size="sm" color={selectedIcon === icon ? '#10B981' : undefined} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isValid || createGoal.isPending}
            className="flex-1 gradient-primary"
          >
            {createGoal.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Crear Meta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGoalDialog;
