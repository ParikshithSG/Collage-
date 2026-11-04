import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isNeedsHourlyUpdate,
  formatTimeAgo,
  calculateDiscountPercent,
  groupProductsForComparison,
  filterComparisonGroups,
} from './marketplaceLogic';
import { ProductItem, Shop } from '../types';

test('isNeedsHourlyUpdate detects older than 60 minutes correctly', () => {
  const now = 1730700000000;
  const fortyMinsAgo = new Date(now - 40 * 60 * 1000).toISOString();
  const eightyMinsAgo = new Date(now - 80 * 60 * 1000).toISOString();

  assert.equal(isNeedsHourlyUpdate(fortyMinsAgo, now), false);
  assert.equal(isNeedsHourlyUpdate(eightyMinsAgo, now), true);
  assert.equal(isNeedsHourlyUpdate('invalid-date', now), true);
});

test('calculateDiscountPercent calculates correct discount percentage', () => {
  assert.equal(calculateDiscountPercent(30, 15), 50);
  assert.equal(calculateDiscountPercent(40, 30), 25);
  assert.equal(calculateDiscountPercent(30, 30), 0);
  assert.equal(calculateDiscountPercent(20, 25), 0);
});

test('formatTimeAgo handles minutes, hours, and days', () => {
  const now = 1730700000000;
  assert.equal(formatTimeAgo(new Date(now - 30 * 1000).toISOString(), now), 'Just now');
  assert.equal(formatTimeAgo(new Date(now - 12 * 60 * 1000).toISOString(), now), '12 mins ago');
  assert.equal(formatTimeAgo(new Date(now - 2 * 3600 * 1000).toISOString(), now), '2 hrs ago');
});

test('groupProductsForComparison identifies lowest price and shop entries', () => {
  const mockShops: Shop[] = [
    {
      id: 'shop-1',
      name: 'Fresh Basket',
      ownerName: 'Ramesh',
      phone: '9876543210',
      address: 'Shop 4, Market Road',
      localityId: 'area-x',
      localityName: 'Area X',
      rating: 4.8,
      reviewCount: 120,
      distanceKm: 0.4,
      isOpen: true,
      openingHours: '7:00 AM - 9:00 PM',
      subscriptionTier: 'trial',
      trialDaysLeft: 22,
      subscriptionRenewDate: '2026-11-26',
      bannerImage: '',
      avatarImage: '',
      joinedDate: '2026-10-10',
      verified: true,
    },
    {
      id: 'shop-2',
      name: 'Green Mart',
      ownerName: 'Suresh',
      phone: '9876543211',
      address: 'Shop 12, Subzi Mandi',
      localityId: 'area-x',
      localityName: 'Area X',
      rating: 4.6,
      reviewCount: 95,
      distanceKm: 0.9,
      isOpen: true,
      openingHours: '6:30 AM - 9:30 PM',
      subscriptionTier: 'premium',
      trialDaysLeft: 0,
      subscriptionRenewDate: '2026-12-01',
      bannerImage: '',
      avatarImage: '',
      joinedDate: '2026-09-15',
      verified: true,
    },
  ];

  const mockProducts: ProductItem[] = [
    {
      id: 'p1',
      shopId: 'shop-1',
      name: 'Tomatoes',
      category: 'vegetable',
      unit: 'kg',
      price: 32,
      availableStock: 15,
      isAvailable: true,
      lastUpdated: new Date().toISOString(),
      image: '',
      qualityGrade: 'Farm Fresh',
    },
    {
      id: 'p2',
      shopId: 'shop-2',
      name: 'Tomatoes',
      category: 'vegetable',
      unit: 'kg',
      price: 25,
      availableStock: 20,
      isAvailable: true,
      lastUpdated: new Date().toISOString(),
      image: '',
      qualityGrade: 'Farm Fresh',
    },
  ];

  const comparisons = groupProductsForComparison('area-x', mockProducts, mockShops);
  assert.equal(comparisons.length, 1);
  assert.equal(comparisons[0].productName, 'Tomatoes');
  assert.equal(comparisons[0].lowestPrice, 25);
  assert.equal(comparisons[0].highestPrice, 32);

  const lowestEntry = comparisons[0].entries.find((e) => e.isLowestPrice);
  assert.ok(lowestEntry);
  assert.equal(lowestEntry?.shop.name, 'Green Mart');
  assert.equal(lowestEntry?.price, 25);

  const otherEntry = comparisons[0].entries.find((e) => !e.isLowestPrice);
  assert.ok(otherEntry);
  assert.equal(otherEntry?.priceDiffFromLowest, 7);
});

test('filterComparisonGroups filters by search query and category', () => {
  const groups = [
    {
      productName: 'Tomatoes',
      category: 'vegetable' as const,
      unit: 'kg',
      image: '',
      entries: [],
      lowestPrice: 25,
      highestPrice: 32,
      averagePrice: 28,
      totalAvailableStock: 35,
      shopCount: 2,
    },
    {
      productName: 'Apples',
      category: 'fruit' as const,
      unit: 'kg',
      image: '',
      entries: [],
      lowestPrice: 120,
      highestPrice: 150,
      averagePrice: 135,
      totalAvailableStock: 18,
      shopCount: 2,
    },
  ];

  const fruitsOnly = filterComparisonGroups(groups, '', 'fruit');
  assert.equal(fruitsOnly.length, 1);
  assert.equal(fruitsOnly[0].productName, 'Apples');

  const searchTom = filterComparisonGroups(groups, 'tom', 'all');
  assert.equal(searchTom.length, 1);
  assert.equal(searchTom[0].productName, 'Tomatoes');
});
