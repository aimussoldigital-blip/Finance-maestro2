import { useState } from 'react';
import { format, subMonths, addMonths, subYears, addYears } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, PiggyBank, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAnalytics } from '@/hooks/useAnalytics';
import BalanceChart from '@/components/analysis/BalanceChart';
import ExpenseCategoryList from '@/components/analysis/ExpenseCategoryList';
import InvestmentChart from '@/components/analysis/InvestmentChart';
import InsightsCard from '@/components/analysis/InsightsCard';
import AdvancedAnalytics from '@/components/analysis/AdvancedAnalytics';
import { cn } from '@/lib/utils';

const Analysis = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');

  const {
    currentSummary,
    previousSummary,
    expenseBreakdown,
    monthlyChartData,
    investmentChartData,
    insights,
    isLoading,
    totalInvestments,
  } = useAnalytics(selectedDate, viewMode);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const handlePrevious = () => {
    if (viewMode === 'month') {
      setSelectedDate(subMonths(selectedDate, 1));
    } else {
      setSelectedDate(subYears(selectedDate, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setSelectedDate(addMonths(selectedDate, 1));
    } else {
      setSelectedDate(addYears(selectedDate, 1));
    }
  };

  const getDateLabel = () => {
    if (viewMode === 'month') {
      return format(selectedDate, 'MMMM yyyy', { locale: es });
    }
    return format(selectedDate, 'yyyy');
  };

  const getComparison = (current: number, previous: number) => {
    if (previous === 0) return null;
    const diff = ((current - previous) / previous) * 100;
    return diff;
  };

  const summaryCards = [
    {
      label: 'Ingresos',
      value: currentSummary.income,
      comparison: getComparison(currentSummary.income, previousSummary.income),
      icon: TrendingUp,
      color: 'text-chart-income',
      bg: 'bg-chart-income/10'
    },
    {
      label: 'Gastos',
      value: currentSummary.expense,
      comparison: getComparison(currentSummary.expense, previousSummary.expense),
      icon: TrendingDown,
      color: 'text-chart-expense',
      bg: 'bg-chart-expense/10',
      invertComparison: true
    },
    {
      label: 'Ahorro',
      value: currentSummary.saving,
      comparison: getComparison(currentSummary.saving, previousSummary.saving),
      icon: PiggyBank,
      color: 'text-chart-saving',
      bg: 'bg-chart-saving/10'
    },
    {
      label: 'Inversiones',
      value: currentSummary.investment,
      comparison: getComparison(currentSummary.investment, previousSummary.investment),
      icon: Wallet,
      color: 'text-chart-investment',
      bg: 'bg-chart-investment/10'
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in pb-24">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Análisis</h1>
      </div>

      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="summary">Resumen</TabsTrigger>
          <TabsTrigger value="explore">Explorar</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6 animate-fade-in">
          {/* Header Controls for Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 mb-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'month' | 'year')} className="w-full sm:w-auto">
                <TabsList className="grid w-full grid-cols-2 sm:w-[200px]">
                  <TabsTrigger value="month">Mensual</TabsTrigger>
                  <TabsTrigger value="year">Anual</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handlePrevious}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <span className="text-sm font-medium min-w-[120px] text-center capitalize">
                  {getDateLabel()}
                </span>
                <Button variant="ghost" size="icon" onClick={handleNext}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {summaryCards.map((card) => {
              const showPositive = card.invertComparison
                ? (card.comparison !== null && card.comparison < 0)
                : (card.comparison !== null && card.comparison > 0);

              return (
                <Card key={card.label} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn('p-2 rounded-lg', card.bg)}>
                        <card.icon className={cn('h-4 w-4', card.color)} />
                      </div>
                      <span className="text-xs text-muted-foreground">{card.label}</span>
                    </div>
                    <p className={cn('text-lg font-bold', card.color)}>
                      {formatCurrency(card.value)}
                    </p>
                    {card.comparison !== null && (
                      <p className={cn(
                        'text-xs mt-1',
                        showPositive ? 'text-primary' : 'text-destructive'
                      )}>
                        {card.comparison > 0 ? '+' : ''}{card.comparison.toFixed(0)}% vs anterior
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Insights */}
          <InsightsCard insights={insights} isLoading={isLoading} />

          {/* Balance Chart */}
          <BalanceChart
            data={monthlyChartData}
            isLoading={isLoading}
            viewMode={viewMode}
            currentSummary={currentSummary}
            previousSummary={previousSummary}
          />

          {/* Expense Category List */}
          <ExpenseCategoryList
            categories={expenseBreakdown}
            isLoading={isLoading}
          />

          {/* Investment Chart */}
          <InvestmentChart data={investmentChartData} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="explore" className="space-y-6 animate-fade-in">
          <AdvancedAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analysis;
