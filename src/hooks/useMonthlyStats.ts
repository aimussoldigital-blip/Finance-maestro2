import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export const useMonthlyStats = () => {
    const { user } = useAuth();

    const { data: goalStats, isLoading: goalLoading } = useQuery({
        queryKey: ['monthly-goal-stats', user?.id],
        queryFn: async () => {
            if (!user) return { total: 0 };

            const start = startOfMonth(new Date());
            const end = endOfMonth(new Date());

            const { data, error } = await supabase
                .from('goal_contributions')
                .select('amount')
                .eq('user_id', user.id)
                .gte('created_at', format(start, 'yyyy-MM-dd'))
                .lte('created_at', format(end, 'yyyy-MM-dd') + 'T23:59:59');

            if (error) throw error;

            const total = data.reduce((sum, c) => sum + Number(c.amount), 0);
            return { total };
        },
        enabled: !!user,
    });

    const { data: investmentStats, isLoading: investmentLoading } = useQuery({
        queryKey: ['monthly-investment-stats', user?.id],
        queryFn: async () => {
            if (!user) return { total: 0 };

            const start = startOfMonth(new Date());
            const end = endOfMonth(new Date());

            const { data, error } = await supabase
                .from('investment_contributions')
                .select('amount')
                .eq('user_id', user.id)
                .gte('contribution_date', format(start, 'yyyy-MM-dd'))
                .lte('contribution_date', format(end, 'yyyy-MM-dd'));

            if (error) throw error;

            const total = data.reduce((sum, c) => sum + Number(c.amount), 0);
            return { total };
        },
        enabled: !!user,
    });

    return {
        savedThisMonth: goalStats?.total || 0,
        investedThisMonth: investmentStats?.total || 0,
        isLoading: goalLoading || investmentLoading,
    };
};
