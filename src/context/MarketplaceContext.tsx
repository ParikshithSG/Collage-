import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  CartItem,
  FlashDeal,
  Locality,
  LocalityId,
  ProductCategory,
  ProductItem,
  Shop,
  SubscriptionTier,
} from '../types';
import { INITIAL_FLASH_DEALS, INITIAL_PRODUCTS, INITIAL_SHOPS, LOCALITIES } from '../data/seedData';

interface MarketplaceContextType {
  // Navigation & Session
  role: 'customer' | 'shopkeeper';
  setRole: (role: 'customer' | 'shopkeeper') => void;
  localityId: LocalityId;
  setLocalityId: (id: LocalityId) => void;
  localities: Locality[];
  activeShopId: string;
  setActiveShopId: (id: string) => void;
  activeShop: Shop | undefined;

  // Data
  shops: Shop[];
  products: ProductItem[];
  flashDeals: FlashDeal[];
  cart: CartItem[];

  // Actions
  updateProduct: (
    productId: string,
    updates: Partial<Pick<ProductItem, 'price' | 'availableStock' | 'isAvailable' | 'name' | 'qualityGrade'>>
  ) => void;
  quickHourlyRefresh: (productId: string) => void;
  addProduct: (product: Omit<ProductItem, 'id' | 'lastUpdated'>) => ProductItem;
  removeProduct: (productId: string) => void;
  createFlashDeal: (deal: Omit<FlashDeal, 'id' | 'createdAt'>) => FlashDeal;
  removeFlashDeal: (dealId: string) => void;
  registerShop: (shopData: {
    ownerName: string;
    shopName: string;
    phone: string;
    address: string;
    localityId: LocalityId;
    password?: string;
  }) => Shop;
  upgradeSubscription: (shopId: string, tier: SubscriptionTier) => void;

  // Cart
  addToCart: (product: ProductItem, shop: Shop, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;

  // Live Scanner & Comparison Modal state
  isScannerOpen: boolean;
  setIsScannerOpen: (open: boolean) => void;
  selectedCompareProductName: string | null;
  setSelectedCompareProductName: (name: string | null) => void;

  // Utilities
  resetToDefaultData: () => void;
}

const STORAGE_KEY_SHOPS = 'freshnearby_shops_v1';
const STORAGE_KEY_PRODUCTS = 'freshnearby_products_v1';
const STORAGE_KEY_DEALS = 'freshnearby_deals_v1';
const STORAGE_KEY_LOCALITY = 'freshnearby_locality_v1';
const STORAGE_KEY_SHOP_ID = 'freshnearby_active_shop_v1';
const STORAGE_KEY_ROLE = 'freshnearby_role_v1';

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<'customer' | 'shopkeeper'>(() => {
    return (localStorage.getItem(STORAGE_KEY_ROLE) as 'customer' | 'shopkeeper') || 'customer';
  });

  const [localityId, setLocalityIdState] = useState<LocalityId>(() => {
    return (localStorage.getItem(STORAGE_KEY_LOCALITY) as LocalityId) || 'area-x';
  });

  const [activeShopId, setActiveShopIdState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_SHOP_ID) || 'shop-fresh-basket';
  });

  const [shops, setShops] = useState<Shop[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SHOPS);
      return saved ? JSON.parse(saved) : INITIAL_SHOPS;
    } catch {
      return INITIAL_SHOPS;
    }
  });

  const [products, setProducts] = useState<ProductItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [flashDeals, setFlashDeals] = useState<FlashDeal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DEALS);
      return saved ? JSON.parse(saved) : INITIAL_FLASH_DEALS;
    } catch {
      return INITIAL_FLASH_DEALS;
    }
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedCompareProductName, setSelectedCompareProductName] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ROLE, role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOCALITY, localityId);
  }, [localityId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SHOP_ID, activeShopId);
  }, [activeShopId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SHOPS, JSON.stringify(shops));
  }, [shops]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DEALS, JSON.stringify(flashDeals));
  }, [flashDeals]);

  const activeShop = shops.find((s) => s.id === activeShopId);

  const setRole = (newRole: 'customer' | 'shopkeeper') => {
    setRoleState(newRole);
  };

  const setLocalityId = (id: LocalityId) => {
    setLocalityIdState(id);
    // If shopkeeper switched locality, default active shop to one in that locality
    if (role === 'shopkeeper') {
      const match = shops.find((s) => s.localityId === id);
      if (match) setActiveShopIdState(match.id);
    }
  };

  const setActiveShopId = (id: string) => {
    setActiveShopIdState(id);
    const shop = shops.find((s) => s.id === id);
    if (shop) {
      setLocalityIdState(shop.localityId);
    }
  };

  // Immediate product updates (hourly price & stock update system)
  const updateProduct = (
    productId: string,
    updates: Partial<Pick<ProductItem, 'price' | 'availableStock' | 'isAvailable' | 'name' | 'qualityGrade'>>
  ) => {
    const nowIso = new Date().toISOString();
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          return {
            ...item,
            ...updates,
            lastUpdated: nowIso,
          };
        }
        return item;
      })
    );
  };

  // Quick hourly refresh timestamp
  const quickHourlyRefresh = (productId: string) => {
    const nowIso = new Date().toISOString();
    setProducts((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, lastUpdated: nowIso } : item))
    );
  };

  const addProduct = (productData: Omit<ProductItem, 'id' | 'lastUpdated'>): ProductItem => {
    const newProduct: ProductItem = {
      ...productData,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      lastUpdated: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const removeProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setFlashDeals((prev) => prev.filter((d) => d.productId !== productId));
  };

  const createFlashDeal = (dealData: Omit<FlashDeal, 'id' | 'createdAt'>): FlashDeal => {
    const newDeal: FlashDeal = {
      ...dealData,
      id: `deal-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setFlashDeals((prev) => [newDeal, ...prev]);
    return newDeal;
  };

  const removeFlashDeal = (dealId: string) => {
    setFlashDeals((prev) => prev.filter((d) => d.id !== dealId));
  };

  const registerShop = (shopData: {
    ownerName: string;
    shopName: string;
    phone: string;
    address: string;
    localityId: LocalityId;
  }): Shop => {
    const locality = LOCALITIES.find((l) => l.id === shopData.localityId);
    const newShopId = `shop-${Date.now().toString().slice(-6)}`;
    const newShop: Shop = {
      id: newShopId,
      name: shopData.shopName,
      ownerName: shopData.ownerName,
      phone: shopData.phone,
      address: shopData.address,
      localityId: shopData.localityId,
      localityName: locality?.name || 'Local Area',
      rating: 5.0,
      reviewCount: 1,
      distanceKm: 0.6,
      isOpen: true,
      openingHours: '7:00 AM – 9:00 PM',
      subscriptionTier: 'trial',
      trialDaysLeft: 30,
      subscriptionRenewDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      bannerImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
      avatarImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      joinedDate: new Date().toISOString().split('T')[0],
      verified: true,
    };

    setShops((prev) => [newShop, ...prev]);

    // Pre-populate some starter inventory for this newly registered shop
    const starterItems: ProductItem[] = [
      {
        id: `prod-${newShopId}-tomatoes`,
        shopId: newShopId,
        name: 'Tomatoes',
        category: 'vegetable' as ProductCategory,
        unit: 'kg',
        price: 30,
        availableStock: 25,
        isAvailable: true,
        lastUpdated: new Date().toISOString(),
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
        qualityGrade: 'Farm Fresh',
      },
      {
        id: `prod-${newShopId}-onions`,
        shopId: newShopId,
        name: 'Onions',
        category: 'vegetable' as ProductCategory,
        unit: 'kg',
        price: 36,
        availableStock: 30,
        isAvailable: true,
        lastUpdated: new Date().toISOString(),
        image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80',
        qualityGrade: 'Farm Fresh',
      },
      {
        id: `prod-${newShopId}-potatoes`,
        shopId: newShopId,
        name: 'Potatoes',
        category: 'vegetable' as ProductCategory,
        unit: 'kg',
        price: 26,
        availableStock: 40,
        isAvailable: true,
        lastUpdated: new Date().toISOString(),
        image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
        qualityGrade: 'Farm Fresh',
      },
    ];
    setProducts((prev) => [...starterItems, ...prev]);

    // Automatically select this shop and switch to shopkeeper view
    setActiveShopIdState(newShopId);
    setLocalityIdState(shopData.localityId);
    setRoleState('shopkeeper');

    return newShop;
  };

  const upgradeSubscription = (shopId: string, tier: SubscriptionTier) => {
    setShops((prev) =>
      prev.map((s) => {
        if (s.id === shopId) {
          return {
            ...s,
            subscriptionTier: tier,
            trialDaysLeft: 0,
            subscriptionRenewDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          };
        }
        return s;
      })
    );
  };

  const addToCart = (product: ProductItem, shop: Shop, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, shop, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const resetToDefaultData = () => {
    localStorage.removeItem(STORAGE_KEY_SHOPS);
    localStorage.removeItem(STORAGE_KEY_PRODUCTS);
    localStorage.removeItem(STORAGE_KEY_DEALS);
    localStorage.removeItem(STORAGE_KEY_LOCALITY);
    localStorage.removeItem(STORAGE_KEY_SHOP_ID);
    localStorage.removeItem(STORAGE_KEY_ROLE);
    setShops(INITIAL_SHOPS);
    setProducts(INITIAL_PRODUCTS);
    setFlashDeals(INITIAL_FLASH_DEALS);
    setLocalityIdState('area-x');
    setActiveShopIdState('shop-fresh-basket');
    setRoleState('customer');
    setCart([]);
    setSelectedCompareProductName(null);
  };

  return (
    <MarketplaceContext.Provider
      value={{
        role,
        setRole,
        localityId,
        setLocalityId,
        localities: LOCALITIES,
        activeShopId,
        setActiveShopId,
        activeShop,
        shops,
        products,
        flashDeals,
        cart,
        updateProduct,
        quickHourlyRefresh,
        addProduct,
        removeProduct,
        createFlashDeal,
        removeFlashDeal,
        registerShop,
        upgradeSubscription,
        addToCart,
        removeFromCart,
        clearCart,
        getCartTotal,
        isScannerOpen,
        setIsScannerOpen,
        selectedCompareProductName,
        setSelectedCompareProductName,
        resetToDefaultData,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
