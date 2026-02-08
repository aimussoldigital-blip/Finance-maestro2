import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3, TrendingUp, TrendingDown, PiggyBank, Wallet } from 'lucide-react';
import { MonthlyData } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface BalanceChartProps {
  data: MonthlyData[];
  isLoading?: boolean;
  viewMode?: 'month' | 'year';
  currentSummary?: {
    income: number;
    expense: number;
    saving: number;
    investment: number;
  };
  previousSummary?: {
    income: number;
    expense: number;
    saving: number;
    investment: number;
  };
}

const BalanceChart = ({ data, isLoading, viewMode = 'year', currentSummary, previousSummary }: BalanceChartProps) => {
  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Balance General</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Cargando...</div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value.toString();
  };

  const formatFullCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const getComparison = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : null;
    return ((current - previous) / previous) * 100;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2 text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-foreground">
              <span style={{ color: entry.color }}>●</span> {entry.name}: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Monthly view - Horizontal bar chart like the reference image
  if (viewMode === 'month' && currentSummary) {
    const horizontalData = [
      { name: 'Ingresos', value: currentSummary.income, fill: 'hsl(var(--chart-income))' },
      { name: 'Gastos', value: currentSummary.expense, fill: 'hsl(var(--chart-expense))' },
      { name: 'Ahorro', value: currentSummary.saving, fill: 'hsl(var(--chart-saving))' },
      { name: 'Inversión', value: currentSummary.investment, fill: 'hsl(var(--chart-investment))' },
    ];

    const summaryCards = [
      { 
        label: 'Ingresos', 
        value: currentSummary.income, 
        comparison: getComparison(currentSummary.income, previousSummary?.income || 0),
        icon: TrendingUp, 
        bgClass: 'bg-chart-income/20',
        textClass: 'text-chart-income',
      },
      { 
        label: 'Gastos', 
        value: currentSummary.expense, 
        comparison: getComparison(currentSummary.expense, previousSummary?.expense || 0),
        icon: TrendingDown, 
        bgClass: 'bg-chart-expense/20',
        textClass: 'text-chart-expense',
        invertComparison: true,
      },
      { 
        label: 'Ahorro', 
        value: currentSummary.saving, 
        comparison: getComparison(currentSummary.saving, previousSummary?.saving || 0),
        icon: PiggyBank, 
        bgClass: 'bg-chart-saving/20',
        textClass: 'text-chart-saving',
      },
      { 
        label: 'Inversión', 
        value: currentSummary.investment, 
        comparison: getComparison(currentSummary.investment, previousSummary?.investment || 0),
        icon: Wallet, 
        bgClass: 'bg-chart-investment/20',
        textClass: 'text-chart-investment',
      },
    ];

    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Balance General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Horizontal Bar Chart */}
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={horizontalData} 
                layout="vertical"
                margin={{ top: 10, right: 30, left: 70, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} horizontal={true} vertical={true} />
                <XAxis 
                  type="number"
                  tickFormatter={formatCurrency}
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} 
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  type="category"
                  dataKey="name"
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} 
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  width={70}
                />
                <Tooltip 
                  formatter={(value: number) => formatFullCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[0, 4, 4, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Cards Below Chart */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {summaryCards.map((card) => {
              const showPositive = card.invertComparison 
                ? (card.comparison !== null && card.comparison < 0)
                : (card.comparison !== null && card.comparison > 0);
              
              return (
                <div 
                  key={card.label} 
                  className={cn('rounded-lg p-3', card.bgClass)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <card.icon className={cn('h-4 w-4', card.textClass)} />
                    <span className={cn('text-xs font-medium', card.textClass)}>{card.label}</span>
                    {card.comparison !== null && (
                      <span className={cn(
                        'text-xs ml-auto',
                        showPositive ? 'text-chart-income' : 'text-chart-expense'
                      )}>
                        ↗ {Math.abs(card.comparison).toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {formatFullCurrency(card.value)}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Yearly view - Vertical grouped bar chart (existing)
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Balance General</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="month" 
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} 
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              tickFormatter={formatCurrency}
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} 
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="circle"
              formatter={(value) => <span className="text-foreground">{value}</span>}
            />
            <Bar 
              dataKey="income" 
              name="Ingresos" 
              fill="hsl(var(--chart-income))" 
              radius={[4, 4, 0, 0]}
              maxBarSize={30}
            />
            <Bar 
              dataKey="expense" 
              name="Gastos" 
              fill="hsl(var(--chart-expense))" 
              radius={[4, 4, 0, 0]}
              maxBarSize={30}
            />
            <Bar 
              dataKey="saving" 
              name="Ahorro" 
              fill="hsl(var(--chart-saving))" 
              radius={[4, 4, 0, 0]}
              maxBarSize={30}
            />
            <Bar 
              dataKey="investment" 
              name="Inversión" 
              fill="hsl(var(--chart-investment))" 
              radius={[4, 4, 0, 0]}
              maxBarSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default BalanceChart;