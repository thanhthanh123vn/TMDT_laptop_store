import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import type { Laptop } from '../types';
import { cartApi } from '../api/cartApi';
import { wishlistApi } from '../api/wishlistApi';

interface StoreContextType {
  cart: CartItem[];
  wishlist: string[];
  compare: string[];
  recentlyViewed: string[];
  cartLoading: boolean;
  loginPromptOpen: boolean;
  setLoginPromptOpen: (open: boolean) => void;
  addToCart: (laptop: Laptop, quantity?: number) => void;
  removeFromCart: (laptopId: string) => void;
  updateCartQuantity: (laptopId: string, quantity: number) => void;
  toggleWishlist: (laptopId: string) => void;
  toggleCompare: (laptopId: string) => void;
  addToRecentlyViewed: (laptopId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  syncCartFromServer: () => Promise<void>;
  syncWishlistFromServer: () => Promise<void>;
}

export interface CartItem {
  laptop: Laptop;
  quantity: number;
}

// Map server CartItem → frontend CartItem
function mapServerItem(item: any): CartItem {
  const p = item.product;
  return {
    quantity: item.quantity,
    laptop: {
      id: String(p.id),
      name: p.name,
      brand: p.brand ?? '',
      price: Number(p.price),
      originalPrice: p.oldPrice ? Number(p.oldPrice) : undefined,
      image: p.imageUrl ?? '',
      images: p.imageUrl ? [p.imageUrl] : [],
      cpu: p.cpu ?? '',
      gpu: p.gpu ?? '',
      ram: p.ram ?? '',
      storage: p.storage ?? '',
      storageType: p.storageType ?? 'SSD',
      screenSize: p.screenSize ?? '',
      weight: p.weight ?? '',
      batteryCondition: p.batteryCondition ?? '',
      condition: p.condition ?? 'Good',
      rating: p.rating ?? 5,
      reviewCount: p.reviews ?? 0,
      category: p.categoryId ? [String(p.categoryId)] : [],
      description: p.description ?? '',
      seller: { name: '', rating: 5, soldCount: 0 },
      isBestSeller: p.isBestSeller,
      isHot: p.isHot,
      isSale: p.isSale,
    },
  };
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  const isLoggedIn = () => !!localStorage.getItem('token');

  // Sync cart from server (called on mount if logged in)
  const syncCartFromServer = useCallback(async () => {
    if (!isLoggedIn()) return;
    try {
      setCartLoading(true);
      const res = await cartApi.getCart();
      setCart((res.data as any[]).map(mapServerItem));
    } catch {
      // fallback: keep local cart
    } finally {
      setCartLoading(false);
    }
  }, []);

  // Sync wishlist from server
  const syncWishlistFromServer = useCallback(async () => {
    if (!isLoggedIn()) return;
    try {
      const res = await wishlistApi.getMyWishlist();
      const ids = (res.data as any[]).map((p: any) => String(p.id));
      setWishlist(ids);
    } catch {
      // fallback: keep local wishlist
    }
  }, []);

  // Load non-cart state from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    const savedCompare = localStorage.getItem('compare');
    const savedRecentlyViewed = localStorage.getItem('recentlyViewed');
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    if (savedCompare) setCompare(JSON.parse(savedCompare));
    if (savedRecentlyViewed) setRecentlyViewed(JSON.parse(savedRecentlyViewed));

    // Load cart: from server if logged in, else from localStorage
    if (isLoggedIn()) {
      syncCartFromServer();
      syncWishlistFromServer();
    } else {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) setCart(JSON.parse(savedCart));
    }
  }, []);

  // Persist non-cart state
  useEffect(() => { localStorage.setItem('wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('compare', JSON.stringify(compare)); }, [compare]);
  useEffect(() => { localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed)); }, [recentlyViewed]);

  // Persist cart to localStorage only when NOT logged in
  useEffect(() => {
    if (!isLoggedIn()) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (laptop: Laptop, quantity: number = 1) => {
    if (!isLoggedIn()) {
      setLoginPromptOpen(true);
      return;
    }

    // Optimistic update
    setCart((prev) => {
      const existing = prev.find((item) => item.laptop.id === laptop.id);
      if (existing) {
        return prev.map((item) =>
          item.laptop.id === laptop.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { laptop, quantity }];
    });

    // Sync to server
    cartApi.addToCart(laptop.id, quantity).catch(() => {
      // Revert on error
      syncCartFromServer();
    });
  };

  const removeFromCart = (laptopId: string) => {
    setCart((prev) => prev.filter((item) => item.laptop.id !== laptopId));

    if (isLoggedIn()) {
      cartApi.removeFromCart(laptopId).catch(() => syncCartFromServer());
    }
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

    if (isLoggedIn()) {
      cartApi.updateQuantity(laptopId, quantity).catch(() => syncCartFromServer());
    }
  };

  const clearCart = () => {
    setCart([]);
    if (isLoggedIn()) {
      cartApi.clearCart().catch(() => {});
    } else {
      localStorage.removeItem('cart');
    }
  };

  const toggleWishlist = (laptopId: string) => {
    if (!isLoggedIn()) {
      setLoginPromptOpen(true);
      return;
    }
    // Optimistic update
    setWishlist((prev) =>
      prev.includes(laptopId) ? prev.filter((id) => id !== laptopId) : [...prev, laptopId]
    );
    // Sync to server
    wishlistApi.toggleWishlist(Number(laptopId)).catch(() => {
      // Revert on error
      syncWishlistFromServer();
    });
  };

  const toggleCompare = (laptopId: string) => {
    setCompare((prev) => {
      if (prev.includes(laptopId)) return prev.filter((id) => id !== laptopId);
      if (prev.length >= 3) { alert('Chỉ có thể so sánh tối đa 3 sản phẩm'); return prev; }
      return [...prev, laptopId];
    });
  };

  const addToRecentlyViewed = (laptopId: string) => {
    setRecentlyViewed((prev) => [laptopId, ...prev.filter((id) => id !== laptopId)].slice(0, 10));
  };

  const getCartTotal = () =>
    cart.reduce((total, item) => total + item.laptop.price * item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        compare,
        recentlyViewed,
        cartLoading,
        loginPromptOpen,
        setLoginPromptOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        toggleWishlist,
        toggleCompare,
        addToRecentlyViewed,
        clearCart,
        getCartTotal,
        syncCartFromServer,
        syncWishlistFromServer,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
