import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { groupProductsForComparison, formatTimeAgo } from '../utils/marketplaceLogic';
import {
  X,
  Store,
  MapPin,
  Clock,
  TrendingDown,
  ShoppingBasket,
  CheckCircle2,
  Award,
  Phone,
} from 'lucide-react';

export const ProductComparisonModal: React.FC = () => {
  const {
    selectedCompareProductName,
    setSelectedCompareProductName,
    localityId,
    products,
    shops,
    addToCart,
    localities,
  } = useMarketplace();

  if (!selectedCompareProductName) return null;

  const currentLocality = localities.find((l) => l.id === localityId);
  const comparisons = groupProductsForComparison(localityId, products, shops);
  const group = comparisons.find(
    (c) => c.productName.toLowerCase() === selectedCompareProductName.toLowerCase()
  );

  if (!group) return null;

  const maxSavings = Math.max(0, group.highestPrice - group.lowestPrice);
  const savingsPercent = group.highestPrice > 0 ? Math.round((maxSavings / group.highestPrice) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="comparison-modal-title"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-start justify-between p-4 sm:p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/40 border-b border-emerald-100">
          <div className="flex items-center gap-4">
            <img
              src={group.image}
              alt={group.productName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-md border-2 border-white ring-2 ring-emerald-100"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  {group.category}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {currentLocality?.name.split('(')[0].trim()}
                </span>
              </div>
              <h2 id="comparison-modal-title" className="text-xl sm:text-2xl font-bold text-gray-900">
                {group.productName} – Price Comparison
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                Comparing {group.entries.length} local fruit & vegetable shops in your locality
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedCompareProductName(null)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            aria-label="Close Comparison"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlights banner */}
        {maxSavings > 0 && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-emerald-200" />
              <span>
                Save up to <strong>₹{maxSavings}/{group.unit}</strong> ({savingsPercent}% savings) by comparing nearby shops!
              </span>
            </div>
            <span className="hidden sm:inline bg-white/20 px-2 py-0.5 rounded text-xs">
              Live Hourly Updates
            </span>
          </div>
        )}

        {/* Comparison Content List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {group.entries.map((entry, idx) => (
              <div
                key={entry.product.id}
                className={`relative rounded-2xl p-4 sm:p-5 border-2 transition-all shadow-sm ${
                  entry.isLowestPrice
                    ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-400/20'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {/* Lowest price badge */}
                {entry.isLowestPrice && (
                  <div className="absolute -top-3 left-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    Lowest Price Winner
                  </div>
                )}

                {/* Shop title & rating */}
                <div className="flex items-start justify-between gap-2 mt-1 mb-3">
                  <div>
                    <h3 className="font-bold text-base text-gray-900 flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-emerald-600" />
                      {entry.shop.name}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      {entry.shop.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded border border-amber-200">
                      ★ {entry.shop.rating} ({entry.shop.reviewCount})
                    </span>
                    <span className="text-[11px] text-gray-500 block mt-0.5">
                      {entry.shop.distanceKm} km away
                    </span>
                  </div>
                </div>

                {/* Pricing Block */}
                <div className="bg-white rounded-xl p-3 border border-gray-100 flex items-center justify-between mb-3 shadow-xs">
                  <div>
                    <span className="text-xs text-gray-500 block">Current Price</span>
                    <div className="text-2xl font-black text-gray-900">
                      ₹{entry.price}
                      <span className="text-xs font-normal text-gray-500">/{entry.product.unit}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    {entry.isLowestPrice ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-1 rounded-md block">
                        Best Deal Today
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-md block">
                        +₹{entry.priceDiffFromLowest} higher
                      </span>
                    )}
                    <span className="text-[11px] text-gray-500 mt-1 block">
                      Stock: <strong>{entry.availableStock} {entry.product.unit}</strong>
                    </span>
                  </div>
                </div>

                {/* Metadata row */}
                <div className="space-y-1.5 text-xs text-gray-600 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Quality Grade:</span>
                    <span className="font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {entry.product.qualityGrade}
                    </span>
                  </div>
                  {entry.product.origin && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Source/Mandi:</span>
                      <span className="font-medium text-gray-700">{entry.product.origin}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      Price updated:
                    </span>
                    <span className="font-medium text-emerald-700">
                      {formatTimeAgo(entry.lastUpdated)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-gray-400" />
                      Shop contact:
                    </span>
                    <span className="text-gray-700">{entry.shop.phone}</span>
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={() => {
                    addToCart(entry.product, entry.shop, 1);
                    setSelectedCompareProductName(null);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition shadow-xs ${
                    entry.isLowestPrice
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                  aria-label={`Add from ${entry.shop.name} to cart`}
                >
                  <ShoppingBasket className="w-4 h-4" />
                  <span>Add from {entry.shop.name}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-1.5 text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Prices are updated by verified local shopkeepers hourly</span>
          </div>
          <button
            onClick={() => setSelectedCompareProductName(null)}
            className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 font-medium rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
