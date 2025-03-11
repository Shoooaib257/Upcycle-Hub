import create from 'zustand';
import { User } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Auth methods
  login: (username: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  
  // Check authentication status
  checkAuth: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const user = await response.json();
        set({ user });
      } else {
        set({ user: null });
      }
    } catch (error) {
      set({ 
        user: null, 
        error: error instanceof Error ? error.message : 'Authentication check failed' 
      });
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Login user
  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiRequest('POST', '/api/auth/login', {
        username,
        password,
      });
      
      const user = await response.json();
      set({ user });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Login failed' 
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Register new user
  register: async (userData: any) => {
    set({ isLoading: true, error: null });
    
    try {
      await apiRequest('POST', '/api/auth/register', userData);
      // Don't automatically log in after registration
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Registration failed' 
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Logout user
  logout: async () => {
    set({ isLoading: true, error: null });
    
    try {
      await apiRequest('POST', '/api/auth/logout');
      set({ user: null });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Logout failed' 
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
