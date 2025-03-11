import create from 'zustand';
import { CartItem, Product } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

interface CartState {
  items: (CartItem & { product: Product })[];
  isLoading: boolean;
  error: string | null;
  subtotal: number;
  shipping: number;
  total: number;
  
  // Methods
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  subtotal: 0,
  shipping: 0,
  total: 0,
  
  // Calculate totals based on cart items
  calculateTotals: () => {
    const { items } = get();
    const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const shipping = items.length > 0 ? 5.99 : 0;
    const total = subtotal + shipping;
    
    set({ subtotal, shipping, total });
  },
  
  // Fetch cart data from API
  fetchCart: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/cart', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      
      const data = await response.json();
      set({ items: data.items });
      get().calculateTotals();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Add item to cart
  addToCart: async (productId: number, quantity: number) => {
    set({ isLoading: true, error: null });
    
    try {
      await apiRequest('POST', '/api/cart/items', {
        productId,
        quantity,
      });
      
      // Invalidate and refetch cart data
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      await get().fetchCart();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add item to cart' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Update item quantity
  updateQuantity: async (itemId: number, quantity: number) => {
    set({ isLoading: true, error: null });
    
    try {
      await apiRequest('PUT', `/api/cart/items/${itemId}`, {
        quantity,
      });
      
      // Invalidate and refetch cart data
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      await get().fetchCart();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update cart' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Remove item from cart
  removeItem: async (itemId: number) => {
    set({ isLoading: true, error: null });
    
    try {
      await apiRequest('DELETE', `/api/cart/items/${itemId}`);
      
      // Invalidate and refetch cart data
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      await get().fetchCart();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to remove item from cart' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Clear cart (remove all items)
  clearCart: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Implementation depends on API - might need to remove items one by one
      // For now, just simulate API call success and clear local state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set({ items: [] });
      get().calculateTotals();
      
      // Invalidate cart query
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to clear cart' });
    } finally {
      set({ isLoading: false });
    }
  },
}));
