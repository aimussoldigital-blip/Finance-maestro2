import { useState } from 'react';
import { format, subMonths, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useMovements, Movement } from '@/hooks/useMovements';
import CategoryIcon from '@/components/ui/CategoryIcon';
import { cn } from '@/lib/utils';
import EditMovementDialog from '@/components/records/EditMovementDialog';

const Movements = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [calendarOpen, setCalendarOpen] = useState(false);
    const { movements, isLoading } = useMovements(currentMonth);
    const [editingMovement, setEditingMovement] = useState<Movement | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (selectedDate) {
            setCurrentMonth(selectedDate);
            setCalendarOpen(false);
        }
    };

    const handleEditMovement = (movement: Movement) => {
        setEditingMovement(movement);
        setIsEditDialogOpen(true);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
        }).format(value);
    };

    return (
        <div className="p-4 md:p-6 space-y-5 animate-fade-in pb-24">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Movimientos</h1>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" className="text-sm font-medium min-w-[100px] text-center capitalize h-8 px-2 hover:bg-secondary">
                                {format(currentMonth, 'MMM yyyy', { locale: es })}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="center">
                            <Calendar
                                mode="single"
                                selected={currentMonth}
                                onSelect={handleDateSelect}
                                defaultMonth={currentMonth}
                                locale={es}
                                className="pointer-events-auto"
                            />
                        </PopoverContent>
                    </Popover>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="h-20" />
                        </Card>
                    ))}
                </div>
            ) : movements.length === 0 ? (
                <Card className="border-border/50">
                    <CardContent className="p-8 text-center text-muted-foreground">
                        No hay movimientos en este mes
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {movements.map((m) => (
                        <Card
                            key={m.id}
                            className="border-border cursor-pointer hover:bg-muted/50 transition-colors active:scale-[0.98]"
                            onClick={() => handleEditMovement(m)}
                        >
                            <CardContent className="p-3 md:p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center"
                                            style={{ backgroundColor: `${m.categories?.color}20` }}
                                        >
                                            <CategoryIcon
                                                icon={m.categories?.icon || 'circle'}
                                                color={m.categories?.color}
                                                size="sm"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm md:text-base">
                                                {m.concept || m.categories?.name || 'Sin categoría'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {(() => {
                                                    const d = new Date(m.date);
                                                    return isNaN(d.getTime()) ? 'Fecha inválida' : format(d, 'd MMM', { locale: es });
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={cn(
                                            'font-bold text-sm md:text-base',
                                            m.type === 'income' ? 'text-primary' : m.type === 'expense' ? 'text-destructive' : 'text-chart-saving'
                                        )}>
                                            {m.type === 'income' ? '+' : '-'}{formatCurrency(Number(m.amount))}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-transparent z-10"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditMovement(m);
                                            }}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <EditMovementDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                movement={editingMovement}
            />
        </div>
    );
};

export default Movements;
