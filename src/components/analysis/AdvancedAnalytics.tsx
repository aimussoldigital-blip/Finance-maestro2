import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useCategories } from '@/hooks/useCategories';
import { useFilteredAnalytics } from '@/hooks/useFilteredAnalytics';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import CategoryIcon from '@/components/ui/CategoryIcon';

const AdvancedAnalytics = () => {
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(),
    });
    const [selectedType, setSelectedType] = useState<'income' | 'expense' | 'all'>('expense');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [groupBy, setGroupBy] = useState<'day' | 'month'>('day');

    const { categories } = useCategories();

    const { totalAmount, chartData, movements, isLoading } = useFilteredAnalytics({
        startDate: dateRange.from,
        endDate: dateRange.to,
        type: selectedType,
        categoryIds: selectedCategories,
        groupBy,
    });

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
        }).format(value);
    };

    const toggleCategory = (categoryId: string) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    return (
        <div className="space-y-6">
            {/* Filters Card */}
            <Card className="border-border/50">
                <CardHeader className="pb-3 border-b border-border/50">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filtros Avanzados
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                        {/* Date Range Picker */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Desde</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !dateRange.from && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange.from ? format(dateRange.from, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={dateRange.from}
                                        onSelect={(date) => date && setDateRange(prev => ({ ...prev, from: date }))}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Hasta</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !dateRange.to && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange.to ? format(dateRange.to, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={dateRange.to}
                                        onSelect={(date) => date && setDateRange(prev => ({ ...prev, to: date }))}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Type Selector */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tipo</label>
                            <Select value={selectedType} onValueChange={(v: 'income' | 'expense' | 'all') => setSelectedType(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="income">Ingresos</SelectItem>
                                    <SelectItem value="expense">Gastos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Group By Selector */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Agrupar por</label>
                            <Select value={groupBy} onValueChange={(v: 'day' | 'month') => setGroupBy(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="day">Día</SelectItem>
                                    <SelectItem value="month">Mes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Categorías</label>
                            {selectedCategories.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedCategories([])}
                                    className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-3 w-3 mr-1" />
                                    Limpiar selección
                                </Button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto p-1">
                            {categories
                                .filter(c => selectedType === 'all' || c.type === selectedType)
                                .map(category => {
                                    const isSelected = selectedCategories.includes(category.id);
                                    return (
                                        <Button
                                            key={category.id}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleCategory(category.id)}
                                            className={cn(
                                                "rounded-full flex items-center gap-2 transition-all duration-200 border",
                                                isSelected
                                                    ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground"
                                                    : "hover:bg-secondary/80 bg-background"
                                            )}
                                            style={isSelected ? { backgroundColor: category.color, borderColor: category.color } : {}}
                                        >
                                            <CategoryIcon
                                                icon={category.icon}
                                                className={cn("w-3 h-3", isSelected ? "text-white" : "text-muted-foreground")}
                                            />
                                            <span className={isSelected ? "text-white" : ""}>{category.name}</span>
                                        </Button>
                                    );
                                })}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Column */}
                <Card className="lg:col-span-2 border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle>Tendencia en el tiempo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={selectedType === 'income' ? '#10B981' : '#F43F5E'} stopOpacity={0.2} />
                                            <stop offset="95%" stopColor={selectedType === 'income' ? '#10B981' : '#F43F5E'} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                                    <XAxis
                                        dataKey="label"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            borderColor: 'hsl(var(--border))',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                        formatter={(value: number) => [formatCurrency(value), 'Cantidad']}
                                        labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '0.25rem' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke={selectedType === 'income' ? '#10B981' : '#F43F5E'}
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorAmount)"
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Column */}
                <div className="space-y-6 flex flex-col">
                    {/* Total Card */}
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm relative overflow-hidden">
                        <div className={cn(
                            "absolute inset-0 opacity-5 pointer-events-none",
                            selectedType === 'income' ? "bg-primary" : selectedType === 'expense' ? "bg-destructive" : "bg-foreground"
                        )} />
                        <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[160px]">
                            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Total en periodo</span>
                            <span className={cn(
                                "text-4xl font-black tracking-tight",
                                selectedType === 'income' ? "text-primary" : selectedType === 'expense' ? "text-destructive" : "text-foreground"
                            )}>
                                {formatCurrency(totalAmount)}
                            </span>
                            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
                                <span>{movements.length} transacciones encontradas</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Transactions List */}
                    <Card className="border-border/50 flex-1 flex flex-col shadow-sm">
                        <CardHeader className="pb-2 border-b border-border/50">
                            <CardTitle className="text-base font-medium">Top Transacciones</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden p-0">
                            <div className="overflow-y-auto max-h-[300px] p-4 space-y-3 custom-scrollbar">
                                {movements.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-8 opacity-60">
                                        <Filter className="h-8 w-8 mb-2" />
                                        <p className="text-sm">No hay datos para este filtro</p>
                                    </div>
                                ) : (
                                    movements
                                        .sort((a, b) => b.amount - a.amount)
                                        .slice(0, 10)
                                        .map((movement) => (
                                            <div key={movement.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors group">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div
                                                        className="w-9 h-9 min-w-[36px] rounded-full flex items-center justify-center bg-secondary group-hover:bg-background transition-colors shadow-sm"
                                                        style={{ backgroundColor: `${movement.categories?.color}15` }}
                                                    >
                                                        <CategoryIcon
                                                            icon={movement.categories?.icon || 'circle'}
                                                            color={movement.categories?.color}
                                                            size="sm"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col overflow-hidden">
                                                        <span className="text-sm font-medium truncate">{movement.concept || movement.categories?.name}</span>
                                                        <span className="text-[11px] text-muted-foreground">{format(new Date(movement.date), 'd MMM yyyy', { locale: es })}</span>
                                                    </div>
                                                </div>
                                                <span className={cn(
                                                    "font-bold text-sm tabular-nums whitespace-nowrap pl-2",
                                                    movement.type === 'income' ? "text-primary" : "text-destructive"
                                                )}>
                                                    {movement.type === 'income' ? '+' : '-'}{formatCurrency(Number(movement.amount))}
                                                </span>
                                            </div>
                                        ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdvancedAnalytics;
