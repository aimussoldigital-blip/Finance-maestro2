import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export type AssetType = 'crypto' | 'etf' | 'stocks' | 'bonds' | 'real_estate' | 'other';

export interface Investment {
  id: string;
  user_id: string;
  name: string;
  asset_type: AssetType;
  invested_amount: number;
  current_value: number;
  icon: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface InvestmentContribution {
  id: string;
  investment_id: string;
  user_id: string;
  amount: number;
  note: string | null;
  contribution_date: string;
  created_at: string;
}

const assetTypeLabels: Record<AssetType, string> = {
  crypto: 'Criptomonedas',
  etf: 'ETFs',
  stocks: 'Acciones',
  bonds: 'Bonos',
  real_estate: 'Inmuebles',
  other: 'Otros',
};

const assetTypeIcons: Record<AssetType, string> = {
  crypto: 'bitcoin',
  etf: 'bar-chart-2',
  stocks: 'trending-up',
  bonds: 'landmark',
  real_estate: 'home',
  other: 'briefcase',
};

export const getAssetTypeLabel = (type: AssetType) => assetTypeLabels[type] || type;
export const getAssetTypeIcon = (type: AssetType) => assetTypeIcons[type] || 'briefcase';

export const useInvestments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: investments = [], isLoading } = useQuery({
    queryKey: ['investments', user?.id],
    queryFn: async (): Promise<Investment[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Investment[];
    },
    enabled: !!user,
  });

  const createInvestment = useMutation({
    mutationFn: async (investment: { name: string; asset_type: AssetType; icon?: string; initial_amount?: number }) => {
      if (!user) throw new Error('No user');

      const { data: newInvestment, error: invError } = await supabase
        .from('investments')
        .insert({
          name: investment.name,
          asset_type: investment.asset_type,
          icon: investment.icon,
          user_id: user.id,
          invested_amount: 0, // Set to 0, trigger will update it when contribution is added
          current_value: 0, // Set to 0, trigger will update it when contribution is added
        })
        .select()
        .single();

      if (invError) throw invError;

      // If there's an initial amount, create a contribution record so it shows up in analytics
      if (investment.initial_amount && investment.initial_amount > 0) {
        const { error: contribError } = await supabase
          .from('investment_contributions')
          .insert({
            investment_id: newInvestment.id,
            user_id: user.id,
            amount: investment.initial_amount,
            note: 'Inversión inicial',
            contribution_date: new Date().toISOString().split('T')[0],
          });

        if (contribError) {
          console.error('Error creating initial contribution:', contribError);
          // We don't throw here to not break the investment creation, 
          // but maybe we should to ensure consistency.
        }
      }

      return newInvestment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      toast({ title: 'Inversión creada', description: 'Tu nueva inversión ha sido registrada' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const addContribution = useMutation({
    mutationFn: async ({ investmentId, amount, note, date }: { investmentId: string; amount: number; note?: string; date?: string }) => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('investment_contributions')
        .insert({
          investment_id: investmentId,
          user_id: user.id,
          amount,
          note,
          contribution_date: date || new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['investment-contributions'] });
      toast({ title: 'Aporte registrado', description: 'El aporte a tu inversión ha sido registrado' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const withdrawContribution = useMutation({
    mutationFn: async ({ investmentId, amount, note }: { investmentId: string; amount: number; note?: string }) => {
      if (!user) throw new Error('No user');

      // Insert negative contribution for withdrawal
      const { data, error } = await supabase
        .from('investment_contributions')
        .insert({
          investment_id: investmentId,
          user_id: user.id,
          amount: -amount, // Negative for withdrawal
          note: note || 'Retiro',
          contribution_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['investment-contributions'] });
      toast({ title: 'Retiro registrado', description: 'El retiro de tu inversión ha sido registrado' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateValue = useMutation({
    mutationFn: async ({ investmentId, value }: { investmentId: string; value: number }) => {
      const { error } = await supabase
        .from('investments')
        .update({ current_value: value })
        .eq('id', investmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      toast({ title: 'Valor actualizado' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteInvestment = useMutation({
    mutationFn: async (investmentId: string) => {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', investmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      toast({ title: 'Inversión eliminada' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const archiveInvestment = useMutation({
    mutationFn: async (investmentId: string) => {
      const { error } = await supabase
        .from('investments')
        .update({ is_archived: true })
        .eq('id', investmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      toast({ title: 'Inversión archivada' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const totalValue = investments
    .filter(inv => !inv.is_archived)
    .reduce((acc, inv) => acc + (inv.current_value || 0), 0);

  // Group by asset type (only active ones)
  const byAssetType = investments
    .filter(inv => !inv.is_archived)
    .reduce((acc, inv) => {
      const type = inv.asset_type as AssetType;
      if (!acc[type]) {
        acc[type] = { type, label: getAssetTypeLabel(type), icon: getAssetTypeIcon(type), total: 0, investments: [] };
      }
      acc[type].total += inv.current_value || 0;
      acc[type].investments.push(inv);
      return acc;
    }, {} as Record<AssetType, { type: AssetType; label: string; icon: string; total: number; investments: Investment[] }>);

  return {
    investments,
    isLoading,
    createInvestment,
    addContribution,
    withdrawContribution,
    updateValue,
    deleteInvestment,
    archiveInvestment,
    totalValue,
    byAssetType: Object.values(byAssetType),
  };
};

export const useInvestmentContributions = (investmentId: string) => {
  const { user } = useAuth();

  const { data: contributions = [], isLoading } = useQuery({
    queryKey: ['investment-contributions', investmentId],
    queryFn: async (): Promise<InvestmentContribution[]> => {
      if (!user || !investmentId) return [];

      const { data, error } = await supabase
        .from('investment_contributions')
        .select('*')
        .eq('investment_id', investmentId)
        .order('contribution_date', { ascending: false });

      if (error) throw error;
      return data as InvestmentContribution[];
    },
    enabled: !!user && !!investmentId,
  });

  return { contributions, isLoading };
};
