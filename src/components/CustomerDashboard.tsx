import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  groupProductsForComparison,
  filterComparisonGroups,
  getActiveFlashDeals,
  formatTimeAgo,
} from '../utils/marketplaceLogic';
import {
  Search,
  MapPin,
  TrendingDown,
  Clock,
  Store,
  Sparkles,
  ShoppingBasket,
  ArrowUpDown,
  Zap,
  Camera,
  Award,
  Layers,
  Flame,
  Phone,
} from 'lucide-react';
import { LocalityId } from '../types';

export const CustomerDashboard: React.FC = () => {
  const {
    localityId,
    setLocalityId,
    localities,
    shops,
    products,
    flashDeals,
    addToCart,
    setSelectedCompareProductName,
    setIsScannerOpen,
  } = useMarketplace();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'vegetable' | 'fruit' | 'flash'>('all');
  const [sortBy, setSortBy] = useState<'lowest-price' | 'highest-stock' | 'name'>('lowest-price');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [addedItemName, setAddedItemName] = useState<string | null>(null);

  const currentLocality = localities.find((l) => l.id === localityId);
  const localityShops = shops.filter((s) => s.localityId === localityId);

  // Grouped comparisons for this locality
  const allComparisons = groupProductsForComparison(localityId, products, shops);
  const filteredComparisons = filterComparisonGroups(
    allComparisons,
    searchQuery,
    selectedCategory === 'flash' ? 'all' : selectedCategory,
    sortBy,
    onlyInStock
  );

  // Active flash deals for this locality
  const activeDeals = getActiveFlashDeals(flashDeals, shops, localityId);

  const handleAddToCartFeedback = (produceName: string, shopName: string) => {
    setAddedItemName(`Added ${produceName} from ${shopName} to basket!`);
    setTimeout(() => setAddedItemName(null), 2400);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {addedItemName && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-bounce">
          <ShoppingBasket className="w-4 h-4 text-emerald-200" />
          <span>{addedItemName}</span>
        </div>
      )}

      {/* Hero Welcome & Locality Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-900 to-emerald-950 text-white p-6 sm:p-10 shadow-xl border border-emerald-700/50">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 font-semibold text-xs sm:text-sm px-3.5 py-1.5 rounded-full mb-3 border border-emerald-400/30 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>Hyperlocal Fresh Produce Marketplace • 100% Free For Customers</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-3">
            Compare Local Prices. <br className="hidden sm:inline" />
            <span className="text-emerald-400 underline decoration-emerald-500/40">Shop Fresh & Save More.</span>
          </h1>

          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl">
            Live hourly prices and stock from fruit & vegetable shops in your locality. Discover the lowest price for every tomato, onion, apple, or potato before stepping outside.
          </p>

          {/* Quick Locality Selector Bar */}
          <div className="bg-emerald-950/80 p-3 sm:p-4 rounded-2xl border border-emerald-600/40 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/80">
                  Current Neighbourhood Locality
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={localityId}
                    onChange={(e) => setLocalityId(e.target.value as LocalityId)}
                    className="bg-transparent text-white font-bold text-base sm:text-lg focus:outline-none cursor-pointer pr-2 hover:text-emerald-200 transition"
                  >
                    {localities.map((loc) => (
                      <option key={loc.id} value={loc.id} className="bg-emerald-950 text-white">
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Live Scanner Launch Button */}
            <button
              onClick={() => setIsScannerOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-emerald-950 font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 transition shadow-md"
              title="Scan vegetable/fruit or QR code"
              aria-label="Open Camera Produce Scanner"
            >
              <Camera className="w-4 h-4" />
              <span>Live Produce Scanner</span>
            </button>
          </div>
        </div>
      </section>

      {/* Flash Deals / Food Waste Rescue Section */}
      {activeDeals.length > 0 && (
        <section aria-labelledby="flash-deals-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Flame className="w-5 h-5 text-amber-600 animate-pulse" />
              </div>
              <div>
                <h2 id="flash-deals-heading" className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
                  Today's Flash Deals
                  <span className="bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Save Food Waste
                  </span>
                </h2>
                <p className="text-xs text-gray-500">
                  Discounted surplus and near-peak produce from neighbourhood shops. Fresh, delicious & affordable.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              ⚡ Limited Stock Clearance
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {activeDeals.map((deal) => (
              <div
                key={deal.id}
                className="bg-white rounded-2xl border-2 border-amber-300/80 shadow-md hover:shadow-lg transition-all p-4 relative flex flex-col justify-between overflow-hidden group"
              >
                {/* Discount Ribbon */}
                <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  {deal.discountPercent}% OFF
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={deal.image}
                      alt={deal.productName}
                      className="w-16 h-16 rounded-xl object-cover border border-amber-200 shadow-xs group-hover:scale-105 transition-transform"
                    />
                    <div>
                      <h3 className="font-bold text-gray-900 text-base leading-snug">
                        {deal.productName}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Store className="w-3 h-3 text-emerald-600" />
                        {deal.shop.name} ({deal.shop.distanceKm} km away)
                      </p>
                    </div>
                  </div>

                  {/* Pricing Box */}
                  <div className="bg-amber-50/80 rounded-xl p-3 border border-amber-200/70 mb-3 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-gray-500 line-through">
                        ₹{deal.originalPrice}/{deal.unit}
                      </span>
                      <div className="text-2xl font-black text-amber-950">
                        ₹{deal.flashPrice}
                        <span className="text-xs font-normal text-gray-600">/{deal.unit}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded block">
                        Stock: {deal.availableStock} {deal.unit} left
                      </span>
                      <div className="text-[11px] text-red-600 font-semibold flex items-center gap-1 justify-end mt-1">
                        <Clock className="w-3 h-3" />
                        <span>Expires in {deal.timeLeftMinutes} mins</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 italic mb-4 line-clamp-2">
                    "{deal.reason}"
                  </p>
                </div>

                <button
                  onClick={() => {
                    const matchedProduct = products.find((p) => p.id === deal.productId);
                    if (matchedProduct) {
                      addToCart({ ...matchedProduct, price: deal.flashPrice }, deal.shop, 1);
                      handleAddToCartFeedback(deal.productName, deal.shop.name);
                    }
                  }}
                  className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <ShoppingBasket className="w-4 h-4" />
                  <span>Claim Flash Price (Add to Basket)</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Search, Category Filters, and Sort Controls */}
      <section className="space-y-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tomatoes, onions, potatoes, apples, bananas, shops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort & Availability Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs text-gray-700">
                <ArrowUpDown className="w-3.5 h-3.5 text-emerald-600" />
                <label htmlFor="sort-select" className="font-medium text-gray-500">
                  Sort:
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'lowest-price' | 'highest-stock' | 'name')}
                  className="bg-transparent font-semibold text-gray-800 focus:outline-none cursor-pointer"
                >
                  <option value="lowest-price">Lowest Price First</option>
                  <option value="highest-stock">Highest Stock</option>
                  <option value="name">Produce Name (A-Z)</option>
                </select>
              </div>

              <label className="flex items-center gap-2 text-xs text-gray-700 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                />
                <span className="font-medium">In Stock Only</span>
              </label>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-400 font-medium mr-1">Categories:</span>
            {[
              { id: 'all', label: 'All Produce' },
              { id: 'vegetable', label: '🥦 Fresh Vegetables' },
              { id: 'fruit', label: '🍎 Seasonal Fruits' },
              { id: 'flash', label: '⚡ Flash Deals' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as 'all' | 'vegetable' | 'fruit' | 'flash')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT PRICE COMPARISON SECTION (Crucial Core Feature) */}
      <section aria-labelledby="comparison-heading" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 id="comparison-heading" className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Layers className="w-6 h-6 text-emerald-600" />
              Produce Price Comparison
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                {currentLocality?.name.split('(')[0].trim()}
              </span>
            </h2>
            <p className="text-xs text-gray-500">
              Live multi-shop price grid. We automatically highlight the lowest price in your locality!
            </p>
          </div>
          <span className="text-xs text-gray-500">
            Showing {filteredComparisons.length} produce varieties
          </span>
        </div>

        {filteredComparisons.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl border border-gray-200 text-center">
            <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800 mb-1">No matching produce found</h3>
            <p className="text-xs text-gray-500 mb-4">
              Try searching for "Tomatoes", "Onions", "Potatoes", or reset your filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setOnlyInStock(false);
              }}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredComparisons.map((group) => {
              const lowestEntry = group.entries.find((e) => e.isLowestPrice);
              const maxSaving = group.highestPrice - group.lowestPrice;

              return (
                <div
                  key={group.productName}
                  className="bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all p-4 sm:p-5 flex flex-col justify-between"
                >
                  <div>
                    {/* Produce Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={group.image}
                          alt={group.productName}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-gray-100 shadow-xs"
                        />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            {group.category}
                          </span>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mt-1">
                            {group.productName}
                          </h3>
                          <p className="text-xs text-gray-500">
                            Available in {group.shopCount} nearby shops • Total stock: {group.totalAvailableStock} {group.unit}
                          </p>
                        </div>
                      </div>

                      {/* Lowest Price Banner in this Area */}
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                          Lowest in Area
                        </span>
                        <div className="text-2xl font-black text-emerald-600">
                          ₹{group.lowestPrice}
                          <span className="text-xs font-normal text-gray-400">/{group.unit}</span>
                        </div>
                        {maxSaving > 0 && (
                          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded mt-0.5 block">
                            Save up to ₹{maxSaving}/{group.unit}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Side-by-Side / Multi-Shop Comparison Cards */}
                    <div className="space-y-2 mb-4">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                        Shops in {currentLocality?.name.split('(')[0].trim()}:
                      </span>
                      {group.entries.map((entry) => (
                        <div
                          key={entry.product.id}
                          className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                            entry.isLowestPrice
                              ? 'bg-emerald-50/80 border-emerald-400 shadow-xs ring-1 ring-emerald-300'
                              : 'bg-gray-50/70 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-emerald-700 font-bold text-xs shadow-2xs">
                              <Store className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-gray-900 text-xs sm:text-sm">
                                  {entry.shop.name}
                                </span>
                                {entry.isLowestPrice && (
                                  <span className="bg-emerald-600 text-white font-extrabold text-[9px] px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                    <Award className="w-2.5 h-2.5" />
                                    Lowest Price
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                                <span>{entry.shop.distanceKm} km away</span>
                                <span>•</span>
                                <span>Stock: <strong>{entry.availableStock} {entry.product.unit}</strong></span>
                                <span>•</span>
                                <span className="flex items-center gap-0.5 text-emerald-700">
                                  <Clock className="w-3 h-3 text-emerald-500" />
                                  {formatTimeAgo(entry.lastUpdated)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div className="text-sm sm:text-base font-extrabold text-gray-900">
                                ₹{entry.price}/{entry.product.unit}
                              </div>
                              {!entry.isLowestPrice && entry.priceDiffFromLowest > 0 && (
                                <div className="text-[10px] text-amber-700 font-medium">
                                  +₹{entry.priceDiffFromLowest} higher
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => {
                                addToCart(entry.product, entry.shop, 1);
                                handleAddToCartFeedback(group.productName, entry.shop.name);
                              }}
                              className={`p-2 rounded-lg font-semibold text-xs transition ${
                                entry.isLowestPrice
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  : 'bg-white hover:bg-gray-100 border border-gray-300 text-gray-700'
                              }`}
                              title={`Add from ${entry.shop.name}`}
                              aria-label={`Add ${group.productName} from ${entry.shop.name}`}
                            >
                              <ShoppingBasket className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer Button to Open Detailed Modal */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      Prices verified hourly
                    </span>
                    <button
                      onClick={() => setSelectedCompareProductName(group.productName)}
                      className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
                    >
                      <span>Full Comparison Table & Details →</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* NEARBY SHOPS DIRECTORY (Locality Restricted) */}
      <section aria-labelledby="shops-heading" className="space-y-4">
        <div>
          <h2 id="shops-heading" className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Store className="w-6 h-6 text-emerald-600" />
            Verified Nearby Shops in {currentLocality?.name.split('(')[0].trim()}
          </h2>
          <p className="text-xs text-gray-500">
            Local vegetable and fruit vendors active in your area. Contact directly or check stock updates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {localityShops.map((shop) => {
            const shopProductCount = products.filter((p) => p.shopId === shop.id).length;
            const shopActiveFlashCount = flashDeals.filter((d) => d.shopId === shop.id).length;

            return (
              <div
                key={shop.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="relative h-28 overflow-hidden bg-gray-100">
                  <img
                    src={shop.bannerImage}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
                    <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-white shrink-0">
                      <img src={shop.avatarImage} alt={shop.ownerName} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white flex items-center gap-1.5">
                        {shop.name}
                        {shop.verified && (
                          <span className="bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                            Verified
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-emerald-200">Owner: {shop.ownerName}</p>
                    </div>
                  </div>

                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-amber-300 text-xs font-bold px-2 py-0.5 rounded-lg border border-white/20">
                    ★ {shop.rating} ({shop.reviewCount})
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between text-xs text-gray-600 gap-2">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                      <span>{shop.address}</span>
                    </div>
                    <span className="font-semibold text-emerald-700 shrink-0">
                      {shop.distanceKm} km away
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {shop.phone}
                    </span>
                    <span>Hours: {shop.openingHours}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                        {shopProductCount} products listed
                      </span>
                      {shopActiveFlashCount > 0 && (
                        <span className="bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-600" />
                          {shopActiveFlashCount} flash deal
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSearchQuery(shop.name);
                      }}
                      className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
                    >
                      Filter Shop Produce →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
