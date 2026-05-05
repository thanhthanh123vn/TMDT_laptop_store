import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Laptop } from '../types';

interface StoreContextType {
  cart: CartItem[];
  wishlist: string[];
  compare: string[];
  recentlyViewed: string[];
  addToCart: (laptop: Laptop, quantity?: number) => void;
  removeFromCart: (laptopId: string) => void;
  updateCartQuantity: (laptopId: string, quantity: number) => void;
  toggleWishlist: (laptopId: string) => void;
  toggleCompare: (laptopId: string) => void;
  addToRecentlyViewed: (laptopId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

export interface CartItem {
  laptop: Laptop;
  quantity: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedWishlist = localStorage.getItem('wishlist');
    const savedCompare = localStorage.getItem('compare');
    const savedRecentlyViewed = localStorage.getItem('recentlyViewed');

    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    if (savedCompare) setCompare(JSON.parse(savedCompare));
    if (savedRecentlyViewed) setRecentlyViewed(JSON.parse(savedRecentlyViewed));
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('compare', JSON.stringify(compare));
  }, [compare]);

  useEffect(() => {
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  const addToCart = (laptop: Laptop, quantity: number = 1) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.laptop.id === laptop.id);
      if (existingItem) {
        return prev.map((item) =>
          item.laptop.id === laptop.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { laptop, quantity }];
    });
  };

  const removeFromCart = (laptopId: string) => {
    setCart((prev) => prev.filter((item) => item.laptop.id !== laptopId));
  };

  const updateCartQuantity = (laptopId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(laptopId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.laptop.id === laptopId ? { ...item, quantity } : item
      )
    );
  };

  const toggleWishlist = (laptopId: string) => {
    setWishlist((prev) =>
      prev.includes(laptopId)
        ? prev.filter((id) => id !== laptopId)
        : [...prev, laptopId]
    );
  };

  const toggleCompare = (laptopId: string) => {
    setCompare((prev) => {
      if (prev.includes(laptopId)) {
        return prev.filter((id) => id !== laptopId);
      }
      if (prev.length >= 3) {
        alert('You can only compare up to 3 products');
        return prev;
      }
      return [...prev, laptopId];
    });
  };

  const addToRecentlyViewed = (laptopId: string) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((id) => id !== laptopId);
      return [laptopId, ...filtered].slice(0, 10); // Keep only last 10
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.laptop.price * item.quantity, 0);
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        compare,
        recentlyViewed,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        toggleWishlist,
        toggleCompare,
        addToRecentlyViewed,
        clearCart,
        getCartTotal,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
};
