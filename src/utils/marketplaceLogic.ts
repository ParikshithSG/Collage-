import { FlashDeal, LocalityId, ProductComparisonGroup, ProductItem, Shop } from '../types';

/**
 * Checks if a product needs an hourly update (last updated > 60 minutes ago).
 */
export function isNeedsHourlyUpdate(lastUpdatedIso: string, referenceTimeMs: number = Date.now()): boolean {
  try {
    const updatedMs = new Date(lastUpdatedIso).getTime();
    if (isNaN(updatedMs)) return true;
    const diffMinutes = (referenceTimeMs - updatedMs) / (1000 * 60);
    return diffMinutes >= 60;
  } catch {
    return true;
  }
}

/**
 * Formats a timestamp into human-readable relative string.
 */
export function formatTimeAgo(isoString: string, referenceTimeMs: number = Date.now()): string {
  try {
    const timeMs = new Date(isoString).getTime();
    if (isNaN(timeMs)) return 'Recently';
    const diffSeconds = Math.max(0, Math.floor((referenceTimeMs - timeMs) / 1000));

    if (diffSeconds < 60) return 'Just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes === 1 ? '' : 's'} ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hr${diffHours === 1 ? '' : 's'} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } catch {
    return 'Recently';
  }
}

/**
 * Calculate percentage discount between original and discounted price.
 */
export function calculateDiscountPercent(originalPrice: number, discountedPrice: number): number {
  if (originalPrice <= 0 || discountedPrice >= originalPrice) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}

/**
 * Groups products across shops for a specific locality to enable instant price comparison.
 */
export function groupProductsForComparison(
  localityId: LocalityId,
  products: ProductItem[],
  shops: Shop[]
): ProductComparisonGroup[] {
  // Filter shops by locality
  const localityShops = shops.filter((s) => s.localityId === localityId);
  const shopMap = new Map<string, Shop>(localityShops.map((s) => [s.id, s]));

  // Filter products for these shops
  const localityProducts = products.filter((p) => shopMap.has(p.shopId));

  // Group by normalized product name
  const groupedByName = new Map<string, ProductItem[]>();
  for (const product of localityProducts) {
    const key = product.name.trim().toLowerCase();
    const existing = groupedByName.get(key) || [];
    existing.push(product);
    groupedByName.set(key, existing);
  }

  const results: ProductComparisonGroup[] = [];

  for (const [, items] of groupedByName) {
    if (items.length === 0) continue;
    const first = items[0];

    // Determine available prices to find the lowest
    const availablePrices = items
      .filter((i) => i.isAvailable && i.availableStock > 0)
      .map((i) => i.price);

    const minPrice = availablePrices.length > 0 ? Math.min(...availablePrices) : Math.min(...items.map((i) => i.price));
    const allPrices = items.map((i) => i.price);
    const maxPrice = Math.max(...allPrices);
    const avgPrice = Math.round(allPrices.reduce((sum, p) => sum + p, 0) / allPrices.length);
    const totalStock = items.reduce((sum, i) => sum + (i.isAvailable ? i.availableStock : 0), 0);

    const entries = items.map((product) => {
      const shop = shopMap.get(product.shopId)!;
      const isLowest = product.price === minPrice && product.isAvailable && product.availableStock > 0;
      return {
        shop,
        product,
        price: product.price,
        availableStock: product.availableStock,
        isAvailable: product.isAvailable,
        lastUpdated: product.lastUpdated,
        isLowestPrice: isLowest,
        priceDiffFromLowest: Math.max(0, product.price - minPrice),
      };
    });

    // Sort entries: lowest price first, then available first
    entries.sort((a, b) => {
      if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;
      return a.price - b.price;
    });

    results.push({
      productName: first.name,
      category: first.category,
      unit: first.unit,
      image: first.image,
      entries,
      lowestPrice: minPrice,
      highestPrice: maxPrice,
      averagePrice: avgPrice,
      totalAvailableStock: totalStock,
      shopCount: entries.length,
    });
  }

  // Sort groups alphabetically by product name
  return results.sort((a, b) => a.productName.localeCompare(b.productName));
}

/**
 * Filter and sort comparison groups based on search term, category, and sorting preference.
 */
export function filterComparisonGroups(
  groups: ProductComparisonGroup[],
  query: string,
  category: string,
  sortBy: 'lowest-price' | 'highest-stock' | 'name' = 'lowest-price',
  onlyInStock: boolean = false
): ProductComparisonGroup[] {
  return groups
    .filter((g) => {
      if (onlyInStock && g.totalAvailableStock <= 0) return false;
      if (category !== 'all' && g.category !== category) return false;
      if (!query.trim()) return true;
      const clean = query.trim().toLowerCase();
      return (
        g.productName.toLowerCase().includes(clean) ||
        g.entries.some((e) => e.shop.name.toLowerCase().includes(clean))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'lowest-price') return a.lowestPrice - b.lowestPrice;
      if (sortBy === 'highest-stock') return b.totalAvailableStock - a.totalAvailableStock;
      return a.productName.localeCompare(b.productName);
    });
}

/**
 * Calculate active flash deals for a locality.
 */
export function getActiveFlashDeals(
  deals: FlashDeal[],
  shops: Shop[],
  localityId: LocalityId,
  currentTimeMs: number = Date.now()
): (FlashDeal & { shop: Shop; discountPercent: number; isExpired: boolean; timeLeftMinutes: number })[] {
  const shopMap = new Map(shops.filter((s) => s.localityId === localityId).map((s) => [s.id, s]));

  return deals
    .filter((d) => shopMap.has(d.shopId))
    .map((deal) => {
      const shop = shopMap.get(deal.shopId)!;
      const expiryMs = new Date(deal.expiryTimestamp).getTime();
      const timeLeftMinutes = Math.max(0, Math.floor((expiryMs - currentTimeMs) / (1000 * 60)));
      const isExpired = timeLeftMinutes <= 0;
      const discountPercent = calculateDiscountPercent(deal.originalPrice, deal.flashPrice);

      return {
        ...deal,
        shop,
        discountPercent,
        isExpired,
        timeLeftMinutes,
      };
    })
    .filter((d) => !d.isExpired && d.availableStock > 0)
    .sort((a, b) => b.discountPercent - a.discountPercent);
}
