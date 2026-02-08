import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Bank {
    id: string;
    name: string;
    icon: string | null;
}

export interface Account {
    id: string;
    name: string;
    balance: number;
    account_type: string | null;
    bank_id: string | null;
    banks?: Bank | null;
}

export const useAccounts = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: accounts = [], isLoading } = useQuery({
        queryKey: ['accounts', user?.id],
        queryFn: async (): Promise<Account[]> => {
            if (!user) return [];

            const { data, error } = await supabase
                .from('accounts')
                .select(`*, banks (id, name, icon)`)
                .eq('user_id', user.id);

            if (error) throw error;
            return data as Account[];
        },
        enabled: !!user,
    });

    const updateBalance = useMutation({
        mutationFn: async ({ accountId, balance }: { accountId: string; balance: number }) => {
            const { error } = await supabase
                .from('accounts')
                .update({ balance })
                .eq('id', accountId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            toast({ title: 'Saldo actualizado' });
        },
        onError: (error) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        },
    });

    const totalBalance = accounts.reduce((acc, account) => acc + (account.balance || 0), 0);

    return {
        accounts,
        isLoading,
        totalBalance,
        updateBalance,
    };
};
