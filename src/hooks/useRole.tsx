import { useAuth } from './useAuth';

export const useRole = () => {
  const { user } = useAuth();
  
  // Cast user to include role property
  const authUser = user as any;
  
  const isAdmin = authUser?.role === 'admin';
  const isClient = authUser?.role === 'client';
  const isAuthenticated = !!user;
  
  return {
    user,
    isAdmin,
    isClient,
    isAuthenticated,
    role: authUser?.role
  };
};

export default useRole;
