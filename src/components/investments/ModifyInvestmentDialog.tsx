import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Euro } from 'lucide-react';
import { useInvestments, Investment } from '@/hooks/useInvestments';

interface ModifyInvestmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investment: Investment;
}

const ModifyInvestmentDialog = ({ open, onOpenChange, investment }: ModifyInvestmentDialogProps) => {
  const [activeTab, setActiveTab] = useState<'contribute' | 'value'>('contribute');
  const [amount, setAmount] = useState('');
  const [newValue, setNewValue] = useState(investment.current_value?.toString() || '');
  const [note, setNote] = useState('');
  
  const { addContribution, updateValue } = useInvestments();

  const handleContribute = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    await addContribution.mutateAsync({
      investmentId: investment.id,
      amount: parseFloat(amount),
      note: note || undefined,
    });

    setAmount('');
    setNote('');
    onOpenChange(false);
  };

  const handleUpdateValue = async () => {
    if (!newValue || parseFloat(newValue) < 0) return;

    await updateValue.mutateAsync({
      investmentId: investment.id,
      value: parseFloat(newValue),
    });

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
          <DialogTitle>{investment.name}</DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <p className="text-center text-2xl font-bold text-chart-investment">
            {formatCurrency(investment.current_value || 0)}
          </p>
          <p className="text-center text-sm text-muted-foreground">Valor actual</p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'contribute' | 'value')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contribute" className="data-[state=active]:bg-chart-investment data-[state=active]:text-white">Nuevo Aporte</TabsTrigger>
            <TabsTrigger value="value" className="data-[state=active]:bg-chart-investment data-[state=active]:text-white">Actualizar Valor</TabsTrigger>
          </TabsList>

          <TabsContent value="contribute" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="contrib-amount">Monto aportado</Label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contrib-amount"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contrib-note">Nota (opcional)</Label>
              <Textarea
                id="contrib-note"
                placeholder="Añade una nota..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
              />
            </div>

            <Button 
              onClick={handleContribute} 
              disabled={!amount || parseFloat(amount) <= 0 || addContribution.isPending}
              className="w-full bg-chart-investment hover:bg-chart-investment/90"
            >
              {addContribution.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Registrar Aporte
            </Button>
          </TabsContent>

          <TabsContent value="value" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="new-value">Nuevo valor de mercado</Label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="new-value"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Actualiza el valor actual de tu inversión según el mercado
              </p>
            </div>

            <Button 
              onClick={handleUpdateValue} 
              disabled={!newValue || updateValue.isPending}
              className="w-full bg-chart-investment hover:bg-chart-investment/90"
            >
              {updateValue.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Actualizar Valor
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ModifyInvestmentDialog;
