export interface Laptop {
    id: string;
    name: string;
    brand: string;
    price: number;
    sellerId: string;
    sellerName: string;
    sellerLogo?: string;
    sellerRating?: number;
    sellerSoldCount?: number;
    originalPrice?: number;
    discount?: number;
    image: string;
    images: string[];
    cpu: string;
    gpu: string;
    ram: string;
    storage: string;
    storageType: 'SSD' | 'HDD' | 'SSD + HDD';
    screenSize: string;
    weight: string;
    batteryCondition: string;
    condition: 'Like New' | '99%' | 'Good' | 'Refurbished';
    rating: number;
    reviewCount: number;
    category: string[];
    description: string;
    seller: {
      name: string;
      rating: number;
      soldCount: number;
    };
    isBestSeller?: boolean;
    isHot?: boolean;
    isSale?: boolean;
  }
  
  export interface Review {
    id: string;
    laptopId: string;
    userName: string;
    rating: number;
    date: string;
    comment: string;
  }
  
  export interface FilterOptions {
    priceRange: [number, number];
    ram: string[];
    cpu: string[];
    gpu: string[];
    storageType: string[];
    condition: string[];
    category: string;
  }
  
  export type SortOption = 'price-low' | 'price-high' | 'newest' | 'best-selling' | 'top-rated';
  