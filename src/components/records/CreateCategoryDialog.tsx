import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useCategories, CategoryType } from '@/hooks/useCategories';
import CategoryIcon, { iconMap } from '@/components/ui/CategoryIcon';
import { cn } from '@/lib/utils';

interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: CategoryType;
}

const availableIcons = [
  'home', 'utensils', 'car', 'fuel', 'gamepad-2', 'heart-pulse', 'tv', 'credit-card',
  'briefcase', 'trending-up', 'laptop', 'shield', 'landmark', 'line-chart', 'piggy-bank',
  'wallet', 'bitcoin', 'bar-chart-3', 'dollar-sign', 'plane', 'shopping-bag', 'smartphone',
  'gift', 'graduation-cap', 'baby', 'dog', 'dumbbell', 'music', 'camera', 'book', 'coffee'
];

const availableColors = [
  '#EF4444', '#F97316', '#EAB308', '#84CC16', '#22C55E', '#14B8A6',
  '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#EC4899'
];

const CreateCategoryDialog = ({ open, onOpenChange, type }: CreateCategoryDialogProps) => {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('circle');
  const [selectedColor, setSelectedColor] = useState('#10B981');
  
  const { createCategory } = useCategories();

  const handleCreate = async () => {
    if (!name.trim()) return;

    await createCategory.mutateAsync({
      name: name.trim(),
      type,
      icon: selectedIcon,
      color: selectedColor,
    });

    // Reset form
    setName('');
    setSelectedIcon('circle');
    setSelectedColor('#10B981');
    onOpenChange(false);
  };

  const typeLabels = {
    expense: 'gasto',
    income: 'ingreso',
    saving: 'ahorro',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Nueva categoría de {typeLabels[type]}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="category-name">Nombre</Label>
            <Input
              id="category-name"
              placeholder="Nombre de la categoría"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Icono</Label>
            <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto">
              {availableIcons.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setSelectedIcon(icon)}
                  className={cn(
                    'p-2 rounded-lg transition-all',
                    selectedIcon === icon
                      ? 'bg-primary/20 ring-2 ring-primary'
                      : 'bg-secondary hover:bg-secondary/80'
                  )}
                >
                  <CategoryIcon icon={icon} color={selectedColor} size="sm" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {availableColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-all',
                    selectedColor === color && 'ring-2 ring-foreground ring-offset-2 ring-offset-background'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${selectedColor}20` }}
            >
              <CategoryIcon icon={selectedIcon} color={selectedColor} />
            </div>
            <span className="font-medium">{name || 'Nombre de categoría'}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || createCategory.isPending}
            className="gradient-primary"
          >
            {createCategory.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Crear
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCategoryDialog;
