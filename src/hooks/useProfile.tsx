import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type ProfileRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  role: string | null;
};

export const useProfile = () => {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('id,email,display_name,role')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as ProfileRow | null;
    },
  });

  const displayName =
    data?.display_name?.trim() ||
    user?.email?.split('@')[0] ||
    'Usuario';

  const isAdmin = (data?.role ?? '').trim().toLowerCase() === 'admin';

  return {
    profile: data,
    displayName,
    isAdmin,
    isLoading,
    error,
  };
};
