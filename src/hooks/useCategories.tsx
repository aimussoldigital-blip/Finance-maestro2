import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export type CategoryType = 'expense' | 'income' | 'saving';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  is_default: boolean;
  created_at: string;
}

const defaultCategories: Omit<Category, 'id' | 'user_id' | 'created_at'>[] = [
  // Expenses - Matching mockup order
  { name: 'Alquiler', type: 'expense', icon: 'home', color: '#FFFFFF', is_default: true },
  { name: 'Gasolina', type: 'expense', icon: 'fuel', color: '#FFFFFF', is_default: true },
  { name: 'Comida', type: 'expense', icon: 'utensils', color: '#FFFFFF', is_default: true },
  { name: 'Ocio', type: 'expense', icon: 'gamepad-2', color: '#FFFFFF', is_default: true },
  { name: 'Salud', type: 'expense', icon: 'heart', color: '#FFFFFF', is_default: true },
  { name: 'Tarjeta de crédito', type: 'expense', icon: 'credit-card', color: '#FFFFFF', is_default: true },
  { name: 'Transporte', type: 'expense', icon: 'car', color: '#FFFFFF', is_default: true },
  { name: 'Compras', type: 'expense', icon: 'shopping-bag', color: '#FFFFFF', is_default: true },
  { name: 'Facturas', type: 'expense', icon: 'receipt', color: '#FFFFFF', is_default: true },
  // Income - Matching mockup
  { name: 'Sueldo fijo', type: 'income', icon: 'building', color: '#FFFFFF', is_default: true },
  { name: 'Ingreso variable', type: 'income', icon: 'trending-up', color: '#FFFFFF', is_default: true },
  { name: 'Bonus', type: 'income', icon: 'gift', color: '#FFFFFF', is_default: true },
  { name: 'Freelance', type: 'income', icon: 'laptop', color: '#FFFFFF', is_default: true },
  // Saving - Matching mockup
  { name: 'Ahorro', type: 'saving', icon: 'piggy-bank', color: '#FFFFFF', is_default: true },
  { name: 'Fondo de emergencia', type: 'saving', icon: 'shield', color: '#FFFFFF', is_default: true },
  { name: 'Retiro', type: 'saving', icon: 'download', color: '#FFFFFF', is_default: true },
];

export const useCategories = (type?: CategoryType) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading, refetch } = useQuery({
    queryKey: ['categories', user?.id, type],
    queryFn: async (): Promise<Category[]> => {
      if (!user) return [];
      
      let query = supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('name');
      
      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // If no categories exist, create defaults
      if (data.length === 0) {
        const defaultsToInsert = defaultCategories.map(cat => ({
          ...cat,
          user_id: user.id,
        }));
        
        const { data: inserted, error: insertError } = await supabase
          .from('categories')
          .insert(defaultsToInsert)
          .select();
        
        if (insertError) throw insertError;
        
        return (type ? inserted?.filter(c => c.type === type) : inserted) as Category[];
      }
      
      return data as Category[];
    },
    enabled: !!user,
  });

  const createCategory = useMutation({
    mutationFn: async (category: { name: string; type: CategoryType; icon: string; color: string }) => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('categories')
        .insert({
          ...category,
          user_id: user.id,
          is_default: false,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'Categoría creada', description: 'La categoría se ha creado correctamente' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (categoryId: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'Categoría eliminada' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return {
    categories,
    isLoading,
    refetch,
    createCategory,
    deleteCategory,
  };
};
