import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  icon: string | null;
  image_url: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface GoalContribution {
  id: string;
  goal_id: string;
  user_id: string;
  amount: number;
  note: string | null;
  created_at: string;
}

export const useGoals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async (): Promise<Goal[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Goal[];
    },
    enabled: !!user,
  });

  const createGoal = useMutation({
    mutationFn: async (goal: { name: string; target_amount: number; icon?: string; image_url?: string }) => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('goals')
        .insert({
          ...goal,
          user_id: user.id,
          current_amount: 0,
          is_archived: false,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({ title: 'Meta creada', description: 'Tu nueva meta de ahorro ha sido creada' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const addContribution = useMutation({
    mutationFn: async ({ goalId, amount, note }: { goalId: string; amount: number; note?: string }) => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('goal_contributions')
        .insert({
          goal_id: goalId,
          user_id: user.id,
          amount,
          note,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goal-contributions'] });
      toast({ title: 'Aporte registrado', description: 'El aporte se ha añadido a tu meta' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const withdrawContribution = useMutation({
    mutationFn: async ({ goalId, amount, note }: { goalId: string; amount: number; note?: string }) => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('goal_contributions')
        .insert({
          goal_id: goalId,
          user_id: user.id,
          amount: -amount, // Negative amount for withdrawal
          note: note || 'Retiro',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goal-contributions'] });
      toast({ title: 'Retiro registrado', description: 'El retiro se ha registrado correctamente' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const archiveGoal = useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await supabase
        .from('goals')
        .update({ is_archived: true })
        .eq('id', goalId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({ title: 'Meta archivada' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteGoal = useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({ title: 'Meta eliminada' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const totalSaved = goals.filter(g => !g.is_archived).reduce((acc, g) => acc + (g.current_amount || 0), 0);
  const totalTarget = goals.filter(g => !g.is_archived).reduce((acc, g) => acc + g.target_amount, 0);
  const globalProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return {
    goals,
    isLoading,
    createGoal,
    addContribution,
    withdrawContribution,
    archiveGoal,
    deleteGoal,
    totalSaved,
    totalTarget,
    globalProgress,
  };
};

export const useGoalContributions = (goalId: string) => {
  const { user } = useAuth();

  const { data: contributions = [], isLoading } = useQuery({
    queryKey: ['goal-contributions', goalId],
    queryFn: async (): Promise<GoalContribution[]> => {
      if (!user || !goalId) return [];
      
      const { data, error } = await supabase
        .from('goal_contributions')
        .select('*')
        .eq('goal_id', goalId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as GoalContribution[];
    },
    enabled: !!user && !!goalId,
  });

  return { contributions, isLoading };
};
