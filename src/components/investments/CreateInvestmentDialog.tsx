import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useInvestments, AssetType, getAssetTypeLabel, getAssetTypeIcon } from '@/hooks/useInvestments';
import CategoryIcon from '@/components/ui/CategoryIcon';

const assetTypes: AssetType[] = ['crypto', 'etf', 'stocks', 'bonds', 'real_estate', 'other'];

interface CreateInvestmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateInvestmentDialog = ({ open, onOpenChange }: CreateInvestmentDialogProps) => {
  const [name, setName] = useState('');
  const [assetType, setAssetType] = useState<AssetType>('stocks');
  const [initialAmount, setInitialAmount] = useState('');

  const { createInvestment } = useInvestments();

  const handleSubmit = async () => {
    if (!name) return;

    await createInvestment.mutateAsync({
      name,
      asset_type: assetType,
      icon: getAssetTypeIcon(assetType),
      initial_amount: initialAmount ? parseFloat(initialAmount) : 0,
    });

    setName('');
    setAssetType('stocks');
    setInitialAmount('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva Inversión</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="investment-name">Nombre</Label>
            <Input
              id="investment-name"
              placeholder="Ej: Bitcoin, S&P 500 ETF..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initial-amount">Inversión inicial (opcional)</Label>
            <Input
              id="initial-amount"
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={initialAmount}
              onChange={(e) => setInitialAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de activo</Label>
            <Select value={assetType} onValueChange={(v) => setAssetType(v as AssetType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {assetTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center gap-2">
                      <CategoryIcon icon={getAssetTypeIcon(type)} size="sm" />
                      <span>{getAssetTypeLabel(type)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name || createInvestment.isPending}
            className="flex-1 gradient-primary"
          >
            {createInvestment.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Crear
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInvestmentDialog;
