import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_blocked: boolean;
  role: string;
}

export const useAdmin = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if current user is admin
  const {
    data: isAdmin,
    isLoading: isCheckingAdmin,
    error,
  } = useQuery({
    queryKey: ['is-admin', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return false;

      const { data, error } = await supabase.rpc('is_admin');

      if (error) {
        console.error('is_admin() RPC error:', error);
        return false;
      }

      return data === true;
    },
  });

  // Fetch all users (only if admin)
  const {
    data: users,
    isLoading: isLoadingUsers,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ['admin-users', user?.id],
    enabled: !!isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_all_users');

      if (error) throw error;
      return data as AdminUser[];
    },
  });

  // Toggle block status
  const { mutate: toggleBlock, isPending: isTogglingBlock } = useMutation({
    mutationFn: async ({ userId, shouldBlock }: { userId: string; shouldBlock: boolean }) => {
      const { error } = await supabase.rpc('toggle_user_block', {
        user_id: userId,
        should_block: shouldBlock,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  // Delete user
  const { mutate: deleteUser, isPending: isDeletingUser } = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc('delete_user', { user_id: userId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  return {
    isAdmin: !!isAdmin,
    isCheckingAdmin,
    error,
    users,
    isLoadingUsers,
    refetchUsers,
    toggleBlock,
    isTogglingBlock,
    deleteUser,
    isDeletingUser,
  };
};

