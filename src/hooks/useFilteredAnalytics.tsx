import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { format, eachDayOfInterval, eachMonthOfInterval, startOfMonth, endOfMonth, isSameDay, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';

export interface FilterOptions {
    startDate: Date;
    endDate: Date;
    categoryIds?: string[];
    type?: 'income' | 'expense' | 'all';
    groupBy: 'day' | 'month';
}

export interface FilteredDataPoint {
    date: string;
    amount: number;
    label: string;
}

export const useFilteredAnalytics = ({ startDate, endDate, categoryIds, type, groupBy }: FilterOptions) => {
    const { user } = useAuth();

    const { data: movements = [], isLoading } = useQuery({
        queryKey: ['filtered-movements', user?.id, startDate.toISOString(), endDate.toISOString(), categoryIds, type],
        queryFn: async () => {
            if (!user) return [];

            let query = supabase
                .from('movements')
                .select(`*, categories (id, name, icon, color)`)
                .eq('user_id', user.id)
                .gte('date', format(startDate, 'yyyy-MM-dd'))
                .lte('date', format(endDate, 'yyyy-MM-dd'));

            if (type && type !== 'all') {
                query = query.eq('type', type);
            }

            if (categoryIds && categoryIds.length > 0) {
                query = query.in('category_id', categoryIds);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data;
        },
        enabled: !!user,
    });

    const totalAmount = movements.reduce((sum, m) => sum + Number(m.amount), 0);

    const chartData: FilteredDataPoint[] = (() => {
        if (movements.length === 0) return [];

        let intervals: Date[];
        if (groupBy === 'day') {
            intervals = eachDayOfInterval({ start: startDate, end: endDate });
        } else {
            intervals = eachMonthOfInterval({ start: startOfMonth(startDate), end: endOfMonth(endDate) });
        }

        return intervals.map(date => {
            const filtered = movements.filter(m => {
                const mDate = new Date(m.date);
                if (groupBy === 'day') {
                    return isSameDay(mDate, date);
                } else {
                    return isSameMonth(mDate, date);
                }
            });

            return {
                date: date.toISOString(),
                amount: filtered.reduce((sum, m) => sum + Number(m.amount), 0),
                label: format(date, groupBy === 'day' ? 'd MMM' : 'MMM yyyy', { locale: es }),
            };
        });
    })();

    return {
        movements,
        totalAmount,
        chartData,
        isLoading,
    };
};
