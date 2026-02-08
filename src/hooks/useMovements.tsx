import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { CategoryType } from './useCategories';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export interface Movement {
  id: string;
  user_id: string;
  category_id: string | null;
  account_id: string | null;
  type: CategoryType;
  amount: number;
  concept: string | null;
  date: string;
  origin: 'manual' | 'voice' | 'import';
  created_at: string;
  categories?: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}

export interface MovementInput {
  type: CategoryType;
  category_id: string;
  amount: number;
  concept?: string;
  date: string;
  origin?: 'manual' | 'voice' | 'import';
  account_id?: string;
}

export const useMovements = (month?: Date) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current month movements
  const { data: movements = [], isLoading } = useQuery({
    queryKey: ['movements', user?.id, month?.toISOString()],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('movements')
        .select(`
          *,
          categories (id, name, icon, color)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (month) {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        query = query
          .gte('date', format(monthStart, 'yyyy-MM-dd'))
          .lte('date', format(monthEnd, 'yyyy-MM-dd'));
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Movement[];
    },
    enabled: !!user,
  });

  // Fetch goal contributions for current month
  const { data: goalContributions = [] } = useQuery({
    queryKey: ['goal-contributions-month', user?.id, month?.toISOString()],
    queryFn: async () => {
      if (!user || !month) return [];

      const start = startOfMonth(month);
      const end = endOfMonth(month);

      const { data, error } = await supabase
        .from('goal_contributions')
        .select('amount, created_at')
        .eq('user_id', user.id)
        .gte('created_at', format(start, 'yyyy-MM-dd'))
        .lte('created_at', format(end, 'yyyy-MM-dd') + 'T23:59:59');

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!month,
  });

  // Fetch previous month movements for comparison
  const previousMonth = month ? subMonths(month, 1) : undefined;
  const { data: prevMovements = [] } = useQuery({
    queryKey: ['movements-prev', user?.id, previousMonth?.toISOString()],
    queryFn: async () => {
      if (!user || !previousMonth) return [];

      const start = startOfMonth(previousMonth);
      const end = endOfMonth(previousMonth);

      const { data, error } = await supabase
        .from('movements')
        .select('type, amount')
        .eq('user_id', user.id)
        .gte('date', format(start, 'yyyy-MM-dd'))
        .lte('date', format(end, 'yyyy-MM-dd'));

      if (error) throw error;
      return data as { type: string; amount: number }[];
    },
    enabled: !!user && !!previousMonth,
  });

  // Fetch previous month goal contributions for comparison
  const { data: prevGoalContributions = [] } = useQuery({
    queryKey: ['goal-contributions-prev-month', user?.id, previousMonth?.toISOString()],
    queryFn: async () => {
      if (!user || !previousMonth) return [];

      const start = startOfMonth(previousMonth);
      const end = endOfMonth(previousMonth);

      const { data, error } = await supabase
        .from('goal_contributions')
        .select('amount, created_at')
        .eq('user_id', user.id)
        .gte('created_at', format(start, 'yyyy-MM-dd'))
        .lte('created_at', format(end, 'yyyy-MM-dd') + 'T23:59:59');

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!previousMonth,
  });

  const createMovement = useMutation({
    mutationFn: async (movement: MovementInput) => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('movements')
        .insert({
          ...movement,
          user_id: user.id,
          origin: movement.origin || 'manual',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      toast({ title: '¡Registro guardado!', description: 'El movimiento se ha guardado correctamente' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateMovement = useMutation({
    mutationFn: async ({ id, ...movement }: MovementInput & { id: string }) => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('movements')
        .update({
          ...movement,
          origin: movement.origin || 'manual',
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      toast({ title: '¡Registro actualizado!', description: 'El movimiento se ha actualizado correctamente' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMovement = useMutation({
    mutationFn: async (movementId: string) => {
      const { error } = await supabase
        .from('movements')
        .delete()
        .eq('id', movementId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      toast({ title: 'Movimiento eliminado' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Calculate goal contributions total (only positive amounts are savings)
  const goalSavingsThisMonth = goalContributions
    .filter(c => Number(c.amount) > 0)
    .reduce((sum, c) => sum + Number(c.amount), 0);

  const prevGoalSavings = prevGoalContributions
    .filter(c => Number(c.amount) > 0)
    .reduce((sum, c) => sum + Number(c.amount), 0);

  // Calculate summary for current month (including goal contributions as savings)
  const summary = {
    income: movements.filter(m => m.type === 'income').reduce((sum, m) => sum + Number(m.amount), 0),
    expense: movements.filter(m => m.type === 'expense').reduce((sum, m) => sum + Number(m.amount), 0),
    saving: movements.filter(m => m.type === 'saving').reduce((sum, m) => sum + Number(m.amount), 0) + goalSavingsThisMonth,
  };

  // Calculate summary for previous month
  const prevSummary = {
    income: prevMovements.filter(m => m.type === 'income').reduce((sum, m) => sum + Number(m.amount), 0),
    expense: prevMovements.filter(m => m.type === 'expense').reduce((sum, m) => sum + Number(m.amount), 0),
    saving: prevMovements.filter(m => m.type === 'saving').reduce((sum, m) => sum + Number(m.amount), 0) + prevGoalSavings,
  };

  // Calculate percentage change
  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const changes = {
    income: calculateChange(summary.income, prevSummary.income),
    expense: calculateChange(summary.expense, prevSummary.expense),
    saving: calculateChange(summary.saving, prevSummary.saving),
  };

  const available = summary.income - summary.expense - summary.saving;
  const prevAvailable = prevSummary.income - prevSummary.expense - prevSummary.saving;
  const availableChange = calculateChange(available, prevAvailable);

  // Group by category
  const byCategory = movements.reduce((acc, m) => {
    const catId = m.category_id || 'uncategorized';
    if (!acc[catId]) {
      acc[catId] = {
        category: m.categories || { id: catId, name: 'Sin categoría', icon: 'circle', color: '#6B7280' },
        total: 0,
        count: 0,
        type: m.type,
      };
    }
    acc[catId].total += Number(m.amount);
    acc[catId].count += 1;
    return acc;
  }, {} as Record<string, { category: { id: string; name: string; icon: string; color: string }; total: number; count: number; type: string }>);

  return {
    movements,
    isLoading,
    createMovement,
    updateMovement,
    deleteMovement,
    summary,
    prevSummary,
    changes,
    available,
    availableChange,
    byCategory: Object.values(byCategory),
  };
};
