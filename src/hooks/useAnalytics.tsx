import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { startOfMonth, endOfMonth, subMonths, format, startOfYear, endOfYear } from 'date-fns';

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  saving: number;
  investment: number;
}

export interface CategoryBreakdown {
  id: string;
  name: string;
  icon: string;
  color: string;
  total: number;
  percentage: number;
  count: number;
}

export interface InvestmentData {
  month: string;
  total: number;
  cumulative: number;
}

export interface Insight {
  type: 'info' | 'success' | 'warning';
  message: string;
}

export const useAnalytics = (selectedDate: Date, viewMode: 'month' | 'year') => {
  const { user } = useAuth();

  // Fetch movements for the selected period
  const { data: currentPeriodData, isLoading: isLoadingCurrent } = useQuery({
    queryKey: ['analytics-current', user?.id, selectedDate.toISOString(), viewMode],
    queryFn: async () => {
      if (!user) return null;
      
      const start = viewMode === 'month' 
        ? startOfMonth(selectedDate) 
        : startOfYear(selectedDate);
      const end = viewMode === 'month' 
        ? endOfMonth(selectedDate) 
        : endOfYear(selectedDate);

      const { data, error } = await supabase
        .from('movements')
        .select(`*, categories (id, name, icon, color)`)
        .eq('user_id', user.id)
        .gte('date', format(start, 'yyyy-MM-dd'))
        .lte('date', format(end, 'yyyy-MM-dd'));

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch previous period for comparison
  const { data: previousPeriodData, isLoading: isLoadingPrevious } = useQuery({
    queryKey: ['analytics-previous', user?.id, selectedDate.toISOString(), viewMode],
    queryFn: async () => {
      if (!user) return null;
      
      const previousDate = viewMode === 'month' 
        ? subMonths(selectedDate, 1) 
        : subMonths(selectedDate, 12);
      const start = viewMode === 'month' 
        ? startOfMonth(previousDate) 
        : startOfYear(previousDate);
      const end = viewMode === 'month' 
        ? endOfMonth(previousDate) 
        : endOfYear(previousDate);

      const { data, error } = await supabase
        .from('movements')
        .select(`*, categories (id, name, icon, color)`)
        .eq('user_id', user.id)
        .gte('date', format(start, 'yyyy-MM-dd'))
        .lte('date', format(end, 'yyyy-MM-dd'));

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch yearly data for charts
  const { data: yearlyData, isLoading: isLoadingYearly } = useQuery({
    queryKey: ['analytics-yearly', user?.id, selectedDate.getFullYear()],
    queryFn: async () => {
      if (!user) return [];
      
      const yearStart = startOfYear(selectedDate);
      const yearEnd = endOfYear(selectedDate);

      const { data, error } = await supabase
        .from('movements')
        .select(`*, categories (id, name, icon, color)`)
        .eq('user_id', user.id)
        .gte('date', format(yearStart, 'yyyy-MM-dd'))
        .lte('date', format(yearEnd, 'yyyy-MM-dd'));

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch investment contributions for the year
  const { data: investmentContributions, isLoading: isLoadingInvestments } = useQuery({
    queryKey: ['analytics-investments', user?.id, selectedDate.getFullYear()],
    queryFn: async () => {
      if (!user) return [];
      
      const yearStart = startOfYear(selectedDate);
      const yearEnd = endOfYear(selectedDate);

      const { data, error } = await supabase
        .from('investment_contributions')
        .select('*')
        .eq('user_id', user.id)
        .gte('contribution_date', format(yearStart, 'yyyy-MM-dd'))
        .lte('contribution_date', format(yearEnd, 'yyyy-MM-dd'))
        .order('contribution_date', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch goal contributions for the year (for yearly chart savings)
  const { data: yearlyGoalContributions } = useQuery({
    queryKey: ['analytics-goal-contributions-yearly', user?.id, selectedDate.getFullYear()],
    queryFn: async () => {
      if (!user) return [];
      
      const yearStart = startOfYear(selectedDate);
      const yearEnd = endOfYear(selectedDate);

      const { data, error } = await supabase
        .from('goal_contributions')
        .select('amount, created_at')
        .eq('user_id', user.id)
        .gte('created_at', format(yearStart, 'yyyy-MM-dd'))
        .lte('created_at', format(yearEnd, 'yyyy-MM-dd') + 'T23:59:59');

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch goal contributions for current period (for savings)
  const { data: goalContributionsCurrent } = useQuery({
    queryKey: ['analytics-goal-contributions-current', user?.id, selectedDate.toISOString(), viewMode],
    queryFn: async () => {
      if (!user) return [];
      
      const start = viewMode === 'month' 
        ? startOfMonth(selectedDate) 
        : startOfYear(selectedDate);
      const end = viewMode === 'month' 
        ? endOfMonth(selectedDate) 
        : endOfYear(selectedDate);

      const { data, error } = await supabase
        .from('goal_contributions')
        .select('amount, created_at')
        .eq('user_id', user.id)
        .gte('created_at', format(start, 'yyyy-MM-dd'))
        .lte('created_at', format(end, 'yyyy-MM-dd') + 'T23:59:59');

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch goal contributions for previous period (for savings comparison)
  const { data: goalContributionsPrevious } = useQuery({
    queryKey: ['analytics-goal-contributions-previous', user?.id, selectedDate.toISOString(), viewMode],
    queryFn: async () => {
      if (!user) return [];
      
      const previousDate = viewMode === 'month' 
        ? subMonths(selectedDate, 1) 
        : subMonths(selectedDate, 12);
      const start = viewMode === 'month' 
        ? startOfMonth(previousDate) 
        : startOfYear(previousDate);
      const end = viewMode === 'month' 
        ? endOfMonth(previousDate) 
        : endOfYear(previousDate);

      const { data, error } = await supabase
        .from('goal_contributions')
        .select('amount, created_at')
        .eq('user_id', user.id)
        .gte('created_at', format(start, 'yyyy-MM-dd'))
        .lte('created_at', format(end, 'yyyy-MM-dd') + 'T23:59:59');

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch investment contributions for current period
  const { data: currentInvestments } = useQuery({
    queryKey: ['analytics-investments-current', user?.id, selectedDate.toISOString(), viewMode],
    queryFn: async () => {
      if (!user) return [];
      
      const start = viewMode === 'month' 
        ? startOfMonth(selectedDate) 
        : startOfYear(selectedDate);
      const end = viewMode === 'month' 
        ? endOfMonth(selectedDate) 
        : endOfYear(selectedDate);

      const { data, error } = await supabase
        .from('investment_contributions')
        .select('*')
        .eq('user_id', user.id)
        .gte('contribution_date', format(start, 'yyyy-MM-dd'))
        .lte('contribution_date', format(end, 'yyyy-MM-dd'));

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch investment contributions for previous period
  const { data: previousInvestments } = useQuery({
    queryKey: ['analytics-investments-previous', user?.id, selectedDate.toISOString(), viewMode],
    queryFn: async () => {
      if (!user) return [];
      
      const previousDate = viewMode === 'month' 
        ? subMonths(selectedDate, 1) 
        : subMonths(selectedDate, 12);
      const start = viewMode === 'month' 
        ? startOfMonth(previousDate) 
        : startOfYear(previousDate);
      const end = viewMode === 'month' 
        ? endOfMonth(previousDate) 
        : endOfYear(previousDate);

      const { data, error } = await supabase
        .from('investment_contributions')
        .select('*')
        .eq('user_id', user.id)
        .gte('contribution_date', format(start, 'yyyy-MM-dd'))
        .lte('contribution_date', format(end, 'yyyy-MM-dd'));

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Calculate current period investment total
  const currentInvestmentTotal = currentInvestments?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;
  const previousInvestmentTotal = previousInvestments?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;

  // Calculate goal contributions (savings) for current and previous periods
  const currentGoalSavings = goalContributionsCurrent
    ?.filter(c => Number(c.amount) > 0)
    .reduce((sum, c) => sum + Number(c.amount), 0) || 0;
  
  const previousGoalSavings = goalContributionsPrevious
    ?.filter(c => Number(c.amount) > 0)
    .reduce((sum, c) => sum + Number(c.amount), 0) || 0;

  // Calculate summary for current period (including goal contributions as savings)
  const movementsSavings = currentPeriodData?.filter(m => m.type === 'saving').reduce((sum, m) => sum + Number(m.amount), 0) || 0;
  const prevMovementsSavings = previousPeriodData?.filter(m => m.type === 'saving').reduce((sum, m) => sum + Number(m.amount), 0) || 0;

  const currentSummary = {
    income: currentPeriodData?.filter(m => m.type === 'income').reduce((sum, m) => sum + Number(m.amount), 0) || 0,
    expense: currentPeriodData?.filter(m => m.type === 'expense').reduce((sum, m) => sum + Number(m.amount), 0) || 0,
    saving: movementsSavings + currentGoalSavings,
    investment: currentInvestmentTotal,
  };

  // Calculate summary for previous period
  const previousSummary = {
    income: previousPeriodData?.filter(m => m.type === 'income').reduce((sum, m) => sum + Number(m.amount), 0) || 0,
    expense: previousPeriodData?.filter(m => m.type === 'expense').reduce((sum, m) => sum + Number(m.amount), 0) || 0,
    saving: prevMovementsSavings + previousGoalSavings,
    investment: previousInvestmentTotal,
  };

  // Calculate expense breakdown by category
  const expenseBreakdown: CategoryBreakdown[] = (() => {
    if (!currentPeriodData) return [];
    
    const expenses = currentPeriodData.filter(m => m.type === 'expense');
    const totalExpense = expenses.reduce((sum, m) => sum + Number(m.amount), 0);
    
    const grouped = expenses.reduce((acc, m) => {
      const catId = m.category_id || 'uncategorized';
      if (!acc[catId]) {
        acc[catId] = {
          id: catId,
          name: m.categories?.name || 'Sin categoría',
          icon: m.categories?.icon || 'circle',
          color: m.categories?.color || '#6B7280',
          total: 0,
          count: 0,
        };
      }
      acc[catId].total += Number(m.amount);
      acc[catId].count += 1;
      return acc;
    }, {} as Record<string, Omit<CategoryBreakdown, 'percentage'>>);

    return Object.values(grouped)
      .map(cat => ({
        ...cat,
        percentage: totalExpense > 0 ? (cat.total / totalExpense) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  })();

  // Calculate monthly data for bar charts (including investments and goal contributions)
  const monthlyChartData: MonthlyData[] = (() => {
    if (!yearlyData) return [];
    
    const months: MonthlyData[] = [];
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(selectedDate.getFullYear(), i, 1);
      const monthStr = format(monthDate, 'MMM');
      
      const monthMovements = yearlyData.filter(m => {
        const mDate = new Date(m.date);
        return mDate.getMonth() === i;
      });

      // Get investment contributions for this month
      const monthInvestments = investmentContributions?.filter(c => {
        const cDate = new Date(c.contribution_date);
        return cDate.getMonth() === i;
      }) || [];
      const monthInvestmentTotal = monthInvestments.reduce((sum, c) => sum + Number(c.amount), 0);

      // Get goal contributions (savings) for this month
      const monthGoalContributions = yearlyGoalContributions?.filter(c => {
        const cDate = new Date(c.created_at);
        return cDate.getMonth() === i && Number(c.amount) > 0;
      }) || [];
      const monthGoalSavings = monthGoalContributions.reduce((sum, c) => sum + Number(c.amount), 0);

      // Calculate savings from movements + goal contributions
      const movementsSaving = monthMovements.filter(m => m.type === 'saving').reduce((sum, m) => sum + Number(m.amount), 0);

      months.push({
        month: monthStr,
        income: monthMovements.filter(m => m.type === 'income').reduce((sum, m) => sum + Number(m.amount), 0),
        expense: monthMovements.filter(m => m.type === 'expense').reduce((sum, m) => sum + Number(m.amount), 0),
        saving: movementsSaving + monthGoalSavings,
        investment: monthInvestmentTotal,
      });
    }
    return months;
  })();

  // Calculate investment data
  const investmentChartData: InvestmentData[] = (() => {
    if (!investmentContributions) return [];
    
    let cumulative = 0;
    const months: InvestmentData[] = [];
    
    for (let i = 0; i < 12; i++) {
      const monthContributions = investmentContributions.filter(c => {
        const cDate = new Date(c.contribution_date);
        return cDate.getMonth() === i;
      });
      
      const monthTotal = monthContributions.reduce((sum, c) => sum + Number(c.amount), 0);
      cumulative += monthTotal;
      
      months.push({
        month: format(new Date(selectedDate.getFullYear(), i, 1), 'MMM'),
        total: monthTotal,
        cumulative,
      });
    }
    return months;
  })();

  // Generate insights
  const insights: Insight[] = (() => {
    const result: Insight[] = [];
    
    if (currentSummary.expense > 0) {
      result.push({
        type: 'info',
        message: `Este ${viewMode === 'month' ? 'mes' : 'año'} has gastado ${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(currentSummary.expense)}`,
      });
    }

    // Compare with previous period
    if (previousSummary.expense > 0) {
      const diff = currentSummary.expense - previousSummary.expense;
      const percentage = ((diff / previousSummary.expense) * 100).toFixed(0);
      
      if (diff > 0) {
        result.push({
          type: 'warning',
          message: `Gastas ${percentage}% más que el ${viewMode === 'month' ? 'mes' : 'año'} pasado`,
        });
      } else if (diff < 0) {
        result.push({
          type: 'success',
          message: `¡Bien! Gastas ${Math.abs(Number(percentage))}% menos que el ${viewMode === 'month' ? 'mes' : 'año'} pasado`,
        });
      }
    }

    // Top expense category
    if (expenseBreakdown.length > 0) {
      const top = expenseBreakdown[0];
      result.push({
        type: 'info',
        message: `Tu mayor gasto es en "${top.name}" (${top.percentage.toFixed(0)}%)`,
      });
    }

    // Saving rate
    if (currentSummary.income > 0 && currentSummary.saving > 0) {
      const savingRate = (currentSummary.saving / currentSummary.income) * 100;
      if (savingRate >= 20) {
        result.push({
          type: 'success',
          message: `¡Excelente! Ahorras el ${savingRate.toFixed(0)}% de tus ingresos`,
        });
      } else if (savingRate >= 10) {
        result.push({
          type: 'info',
          message: `Ahorras el ${savingRate.toFixed(0)}% de tus ingresos`,
        });
      }
    }

    // Balance check
    const balance = currentSummary.income - currentSummary.expense - currentSummary.saving;
    if (balance < 0) {
      result.push({
        type: 'warning',
        message: `Cuidado: gastas más de lo que ingresas este ${viewMode === 'month' ? 'mes' : 'año'}`,
      });
    }

    return result;
  })();

  const isLoading = isLoadingCurrent || isLoadingPrevious || isLoadingYearly || isLoadingInvestments;

  return {
    currentSummary,
    previousSummary,
    expenseBreakdown,
    monthlyChartData,
    investmentChartData,
    insights,
    isLoading,
    totalInvestments: investmentChartData[investmentChartData.length - 1]?.cumulative || 0,
  };
};
