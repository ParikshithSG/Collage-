export type LocalityId = 'area-x' | 'area-y';

export interface Locality {
  id: LocalityId;
  name: string;
  tagline: string;
  city: string;
  activeShopsCount: number;
}

export type SubscriptionTier = 'trial' | 'basic' | 'premium';

export interface Shop {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  address: string;
  localityId: LocalityId;
  localityName: string;
  rating: number;
  reviewCount: number;
  distanceKm: number;
  isOpen: boolean;
  openingHours: string;
  subscriptionTier: SubscriptionTier;
  trialDaysLeft: number;
  subscriptionRenewDate: string;
  bannerImage: string;
  avatarImage: string;
  joinedDate: string;
  verified: boolean;
}

export type ProductCategory = 'vegetable' | 'fruit';

export interface ProductItem {
  id: string;
  shopId: string;
  name: string;
  category: ProductCategory;
  unit: string; // e.g. 'kg', 'bunch', 'piece', 'dozen'
  price: number; // in INR
  originalPrice?: number; // if on regular discount
  availableStock: number; // in unit
  isAvailable: boolean;
  lastUpdated: string; // ISO string
  image: string;
  qualityGrade: 'Grade A Premium' | 'Farm Fresh' | 'Standard';
  origin?: string; // e.g., 'Nashik', 'Himachal', 'Local Mandi'
  description?: string;
  isFlashDeal?: boolean;
}

export interface FlashDeal {
  id: string;
  shopId: string;
  productId: string;
  productName: string;
  category: ProductCategory;
  originalPrice: number;
  flashPrice: number;
  availableStock: number;
  unit: string;
  expiryTimestamp: string; // ISO string
  reason: string; // e.g. 'Evening surplus clearance to prevent spoilage'
  createdAt: string;
  image: string;
}

export interface ProductComparisonEntry {
  shop: Shop;
  product: ProductItem;
  price: number;
  availableStock: number;
  isAvailable: boolean;
  lastUpdated: string;
  isLowestPrice: boolean;
  priceDiffFromLowest: number;
}

export interface ProductComparisonGroup {
  productName: string;
  category: ProductCategory;
  unit: string;
  image: string;
  entries: ProductComparisonEntry[];
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
  totalAvailableStock: number;
  shopCount: number;
}

export interface CartItem {
  product: ProductItem;
  shop: Shop;
  quantity: number;
}
