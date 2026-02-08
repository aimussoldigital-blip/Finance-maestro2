import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useMovements, Movement } from '@/hooks/useMovements';
import { useCategories } from '@/hooks/useCategories';
import CategoryGrid from './CategoryGrid';

interface EditMovementDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    movement: Movement | null;
}

const EditMovementDialog = ({ open, onOpenChange, movement }: EditMovementDialogProps) => {
    const [amount, setAmount] = useState('');
    const [concept, setConcept] = useState('');
    const [date, setDate] = useState<Date>(new Date());
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

    const { updateMovement, deleteMovement } = useMovements();
    const { categories } = useCategories(movement?.type || 'expense');

    useEffect(() => {
        if (movement && open) {
            setAmount(movement.amount.toString());
            setConcept(movement.concept || '');
            setDate(new Date(movement.date));
            setSelectedCategoryId(movement.category_id);
        }
    }, [movement, open]);

    const handleSave = async () => {
        if (!movement || !selectedCategoryId || !amount || parseFloat(amount) <= 0) return;

        await updateMovement.mutateAsync({
            id: movement.id,
            type: movement.type,
            category_id: selectedCategoryId,
            amount: parseFloat(amount),
            concept: concept || undefined,
            date: format(date, 'yyyy-MM-dd'),
            origin: movement.origin,
            account_id: movement.account_id || undefined,
        });

        onOpenChange(false);
    };

    const handleDelete = async () => {
        if (!movement) return;
        if (confirm('¿Estás seguro de que quieres eliminar este movimiento?')) {
            await deleteMovement.mutateAsync(movement.id);
            onOpenChange(false);
        }
    };

    const isValid = selectedCategoryId && amount && parseFloat(amount) > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Editar Movimiento</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Monto */}
                    <div className="space-y-2">
                        <Label>Monto</Label>
                        <div className="relative">
                            <Input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="pl-8 text-lg font-semibold"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                        </div>
                    </div>

                    {/* Concepto */}
                    <div className="space-y-2">
                        <Label>Concepto</Label>
                        <Input
                            value={concept}
                            onChange={(e) => setConcept(e.target.value)}
                            placeholder="Descripción..."
                        />
                    </div>

                    {/* Fecha */}
                    <div className="space-y-2">
                        <Label>Fecha</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !date && 'text-muted-foreground'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, 'PPP', { locale: es }) : <span>Seleccionar fecha</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(d) => d && setDate(d)}
                                    initialFocus
                                    locale={es}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Categoría */}
                    <div className="space-y-2">
                        <Label>Categoría</Label>
                        <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
                            <CategoryGrid
                                categories={categories}
                                selectedId={selectedCategoryId}
                                onSelect={(cat) => setSelectedCategoryId(cat.id)}
                                onCreateNew={() => { }} // No create new from edit for simplicity
                                isLoading={false}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleteMovement.isPending}
                        className="w-full sm:w-auto"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                    </Button>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 sm:flex-none"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!isValid || updateMovement.isPending}
                            className="flex-1 sm:flex-none"
                        >
                            {updateMovement.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Guardar
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditMovementDialog;
