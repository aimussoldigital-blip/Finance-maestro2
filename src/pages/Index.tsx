import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, subMonths, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, PiggyBank, TrendingUp as InvestIcon, ArrowUpRight, ArrowDownRight, Eye, EyeOff, Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useMovements } from '@/hooks/useMovements';
import { useGoals } from '@/hooks/useGoals';
import { useInvestments } from '@/hooks/useInvestments';
import { useProfile } from '@/hooks/useProfile';
import CategoryIcon from '@/components/ui/CategoryIcon';
import { useAccounts } from '@/hooks/useAccounts';
import { useMonthlyStats } from '@/hooks/useMonthlyStats';
import { cn } from '@/lib/utils';
import { Movement } from '@/hooks/useMovements';
import EditMovementDialog from '@/components/records/EditMovementDialog';

const Index = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showBalance, setShowBalance] = useState(true);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { movements, summary, changes, available, availableChange, byCategory, isLoading } = useMovements(currentMonth);
  const { totalSaved } = useGoals();
  const { totalValue: totalInvestments } = useInvestments();
  const { totalBalance } = useAccounts();
  const { displayName } = useProfile();
  const { investedThisMonth } = useMonthlyStats();
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const netWorth = totalBalance + totalSaved + totalInvestments;

  // Calculate investment growth
  const prevMonthInvestedTotal = totalInvestments - investedThisMonth;
  const investedChange = prevMonthInvestedTotal > 0 ? (investedThisMonth / prevMonthInvestedTotal) * 100 : (investedThisMonth > 0 ? 100 : 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const hiddenValue = '••••••';

  const getBalanceMessage = () => {
    if (available >= 0) return 'Vas bien este mes';
    return 'Cuidado con los gastos';
  };

  const renderChangeIndicator = (change: number, invertColor = false) => {
    const isPositive = change >= 0;
    const color = invertColor
      ? (isPositive ? 'text-destructive' : 'text-primary')
      : (isPositive ? 'text-primary' : 'text-destructive');
    const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

    return (
      <div className={cn('flex items-center gap-1 text-xs font-medium', color)}>
        <Icon className="h-3 w-3" />
        <span>{Math.abs(change)}% vs mes anterior</span>
      </div>
    );
  };

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

  const expensesByCategory = byCategory.filter(c => c.type === 'expense').sort((a, b) => b.total - a.total);

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Hola, {displayName} 👋</h1>
        <p className="text-sm text-muted-foreground">Bienvenido a tu dashboard financiero</p>
      </div>

      {/* Net Worth Hero Card */}
      <Card className="bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-white border-0 shadow-xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <TrendingUp className="h-24 w-24" />
        </div>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Patrimonio Neto</p>
              <p className="text-4xl font-black tracking-tight text-white mb-2">
                {showBalance ? formatCurrency(netWorth) : hiddenValue}
              </p>
              <div className="flex items-center gap-4 text-sm font-medium">
                <div className="flex items-center gap-1.5 text-chart-saving">
                  <div className="w-2 h-2 rounded-full bg-chart-saving" />
                  <span>Ahorros: {showBalance ? formatCurrency(totalSaved) : hiddenValue}</span>
                </div>
                <div className="flex items-center gap-1.5 text-chart-investment">
                  <div className="w-2 h-2 rounded-full bg-chart-investment" />
                  <span>Inversiones: {showBalance ? formatCurrency(totalInvestments) : hiddenValue}</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
              onClick={() => setShowBalance(!showBalance)}
            >
              {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
        <div className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-chart-saving via-chart-investment to-primary w-full" />
      </Card>

      {/* Header with month selector */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-lg font-semibold">Resumen del mes</h2>
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

      {/* Balance Hero Card */}
      <Card className="bg-emerald-600 text-white border-0 shadow-lg overflow-hidden">
        <CardContent className="p-5 md:p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm opacity-90">Balance del mes</p>
              <p className="text-3xl md:text-4xl font-bold">
                {showBalance ? formatCurrency(available) : hiddenValue}
              </p>
              <p className="text-sm opacity-80">{getBalanceMessage()}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-1 text-xs">
                {availableChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                <span>{Math.abs(availableChange)}%</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setShowBalance(!showBalance)}
              >
                {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Ingresos */}
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Ingresos</span>
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-xl md:text-2xl font-bold text-primary mb-1">
              {showBalance ? formatCurrency(summary.income) : hiddenValue}
            </p>
            {renderChangeIndicator(changes.income)}
          </CardContent>
        </Card>

        {/* Gastos */}
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Gastos</span>
              <div className="p-2 rounded-lg bg-destructive/10">
                <TrendingDown className="h-4 w-4 text-destructive" />
              </div>
            </div>
            <p className="text-xl md:text-2xl font-bold text-destructive mb-1">
              {showBalance ? formatCurrency(summary.expense) : hiddenValue}
            </p>
            {renderChangeIndicator(changes.expense, true)}
          </CardContent>
        </Card>

        {/* Ahorro Total */}
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Ahorro Total</span>
              <div className="p-2 rounded-lg bg-chart-saving/10">
                <PiggyBank className="h-4 w-4 text-chart-saving" />
              </div>
            </div>
            <p className="text-xl md:text-2xl font-bold text-chart-saving mb-1">
              {showBalance ? formatCurrency(totalSaved) : hiddenValue}
            </p>
            <p className="text-xs text-muted-foreground">
              Este mes: {formatCurrency(summary.saving)}
            </p>
            {renderChangeIndicator(changes.saving)}
          </CardContent>
        </Card>

        {/* Inversiones */}
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Inversiones</span>
              <div className="p-2 rounded-lg bg-chart-investment/10">
                <InvestIcon className="h-4 w-4 text-chart-investment" />
              </div>
            </div>
            <p className="text-xl md:text-2xl font-bold text-chart-investment mb-1">
              {showBalance ? formatCurrency(totalInvestments) : hiddenValue}
            </p>
            <p className="text-xs text-muted-foreground">
              Este mes: {formatCurrency(investedThisMonth)}
            </p>
            {renderChangeIndicator(investedChange)}
          </CardContent>
        </Card>
      </div>

      {/* Últimos movimientos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Últimos movimientos</h3>
          <Button
            variant="link"
            className="text-sm font-medium h-auto p-0 text-primary"
            onClick={() => navigate('/movements')}
          >
            Ver todos
          </Button>
        </div>
        {movements.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center">No hay movimientos este mes</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {movements.slice(0, 5).map((m) => (
              <Card
                key={m.id}
                className="border-border cursor-pointer hover:bg-muted/50 transition-colors active:scale-[0.98]"
                onClick={() => handleEditMovement(m)}
              >
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${m.categories?.color || '#888888'}20` }}
                      >
                        <CategoryIcon
                          icon={m.categories?.icon || 'circle'}
                          color={m.categories?.color || '#888888'}
                          size="sm"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm md:text-base truncate">
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
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={cn(
                        'font-bold text-sm md:text-base whitespace-nowrap',
                        m.type === 'income' ? 'text-primary' : m.type === 'expense' ? 'text-destructive' : 'text-chart-saving'
                      )}>
                        {m.type === 'income' ? '+' : '-'}{formatCurrency(Number(m.amount))}
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 px-2 md:px-3 text-muted-foreground hover:text-foreground z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditMovement(m);
                        }}
                      >
                        <Pencil className="h-3 w-3 md:mr-1.5" />
                        <span className="hidden md:inline text-xs">Editar</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>)}
      </div>

      {/* Gastos por Categoría */}
      {expensesByCategory.length > 0 && (
        <Card className="border-border shadow-sm overflow-hidden mb-8">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-6">
              Gastos por Categoría
            </h3>
            <div className="space-y-5">
              {expensesByCategory.map((item) => {
                const percentage = summary.expense > 0 ? (item.total / summary.expense) * 100 : 0;
                const categoryColor = item.category.color || '#10B981';

                return (
                  <div key={item.category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CategoryIcon
                          icon={item.category.icon || 'circle'}
                          color={categoryColor}
                          size="md"
                        />
                        <span className="text-sm font-medium">{item.category.name}</span>
                      </div>
                      <span className="text-sm font-medium">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: categoryColor,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      <EditMovementDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        movement={editingMovement}
      />
    </div>
  );
};

export default Index;
