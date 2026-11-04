import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  isNeedsHourlyUpdate,
  formatTimeAgo,
} from '../utils/marketplaceLogic';
import {
  Store,
  Plus,
  RefreshCw,
  AlertTriangle,
  Zap,
  Clock,
  TrendingDown,
  Trash2,
  CheckCircle,
  Shield,
  Layers,
  Sparkles,
  BarChart3,
  Calendar,
  DollarSign,
  Leaf,
  Info,
} from 'lucide-react';
import { AddProductModal } from './AddProductModal';
import { CreateFlashDealModal } from './CreateFlashDealModal';
import { SubscriptionModal } from './SubscriptionModal';

export const ShopkeeperDashboard: React.FC = () => {
  const {
    activeShop,
    products,
    updateProduct,
    quickHourlyRefresh,
    removeProduct,
    flashDeals,
    removeFlashDeal,
    localities,
  } = useMarketplace();

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isFlashModalOpen, setIsFlashModalOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState<string | null>(null);

  if (!activeShop) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-gray-200">
        <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-800">No Shop Selected</h2>
        <p className="text-xs text-gray-500 mt-1">Please select or register a shop using the demo toolbar above.</p>
      </div>
    );
  }

  const shopProducts = products.filter((p) => p.shopId === activeShop.id);
  const shopFlashDeals = flashDeals.filter((d) => d.shopId === activeShop.id);

  // Statistics
  const totalListed = shopProducts.length;
  const inStockCount = shopProducts.filter((p) => p.isAvailable && p.availableStock > 0).length;
  const totalStockKg = shopProducts.reduce((sum, p) => sum + (p.isAvailable ? p.availableStock : 0), 0);

  // Items needing hourly update (> 60 mins)
  const productsNeedingHourlyUpdate = shopProducts.filter((p) =>
    isNeedsHourlyUpdate(p.lastUpdated)
  );

  const handleQuickRefreshAll = () => {
    shopProducts.forEach((p) => quickHourlyRefresh(p.id));
    setUpdateFeedback('All produce timestamps refreshed! Customers will see your prices as updated just now.');
    setTimeout(() => setUpdateFeedback(null), 3000);
  };

  const handlePriceChange = (productId: string, currentPrice: number, delta: number) => {
    const newPrice = Math.max(1, currentPrice + delta);
    updateProduct(productId, { price: newPrice });
    setUpdateFeedback(`Price updated to ₹${newPrice}!`);
    setTimeout(() => setUpdateFeedback(null), 2000);
  };

  const handleStockChange = (productId: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    updateProduct(productId, {
      availableStock: newStock,
      isAvailable: newStock > 0,
    });
    setUpdateFeedback(`Stock updated to ${newStock}!`);
    setTimeout(() => setUpdateFeedback(null), 2000);
  };

  const currentLocality = localities.find((l) => l.id === activeShop.localityId);

  return (
    <div className="space-y-8 pb-16">
      {/* Toast update notification */}
      {updateFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-800 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-bounce border border-emerald-500">
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          <span>{updateFeedback}</span>
        </div>
      )}

      {/* Shopkeeper Profile & Status Header */}
      <section className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="relative h-36 sm:h-44 bg-emerald-900 overflow-hidden">
          <img
            src={activeShop.bannerImage}
            alt={activeShop.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/40 to-transparent" />

          {/* Shop information overlay */}
          <div className="absolute bottom-4 left-4 sm:left-6 right-4 sm:right-6 flex flex-wrap items-end justify-between gap-3 text-white">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-white overflow-hidden bg-white shadow-lg shrink-0">
                <img
                  src={activeShop.avatarImage}
                  alt={activeShop.ownerName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white">{activeShop.name}</h1>
                  <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Shopkeeper Portal
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-200 mt-0.5">
                  Owner: {activeShop.ownerName} • Locality: {currentLocality?.name.split('(')[0].trim()}
                </p>
              </div>
            </div>

            {/* Subscription Quick Button */}
            <button
              onClick={() => setIsSubscriptionOpen(true)}
              className="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-xs font-bold text-white border border-white/30 flex items-center gap-1.5 transition"
              aria-label="Manage Subscription"
            >
              <Shield className="w-3.5 h-3.5 text-yellow-300" />
              <span>
                {activeShop.subscriptionTier === 'trial'
                  ? `Trial (${activeShop.trialDaysLeft} days left)`
                  : `${activeShop.subscriptionTier.toUpperCase()} Plan`}
              </span>
            </button>
          </div>
        </div>

        {/* Quick KPI Cards Bar */}
        <div className="p-4 sm:p-6 grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 bg-gray-50/60 border-t border-gray-100">
          <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-2xs">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Listed Products
            </span>
            <div className="text-2xl font-black text-gray-900 mt-0.5">{totalListed}</div>
            <span className="text-[11px] text-emerald-700 font-medium">All active produce</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-2xs">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              In-Stock Items
            </span>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">{inStockCount}</div>
            <span className="text-[11px] text-gray-500">~{totalStockKg} units on shelf</span>
          </div>

          {/* Needs Hourly Update Warning Metric */}
          <div
            className={`p-3.5 rounded-2xl border shadow-2xs transition ${
              productsNeedingHourlyUpdate.length > 0
                ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                : 'bg-white border-gray-200/80 text-gray-900'
            }`}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 text-amber-800">
              <Clock className="w-3 h-3 text-amber-600" />
              Needs Hourly Update
            </span>
            <div className="text-2xl font-black mt-0.5">
              {productsNeedingHourlyUpdate.length}
            </div>
            <span className="text-[11px] font-semibold text-amber-700">
              {productsNeedingHourlyUpdate.length > 0 ? 'Prices > 1 hr old' : 'All prices fresh!'}
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-2xs">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Active Flash Deals
            </span>
            <div className="text-2xl font-black text-amber-600 mt-0.5">{shopFlashDeals.length}</div>
            <span className="text-[11px] text-gray-500">Surplus clearance</span>
          </div>

          <div className="col-span-2 lg:col-span-1 bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-2xs">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Subscription
            </span>
            <div className="text-base font-black text-emerald-800 mt-1 capitalize flex items-center gap-1">
              <Shield className="w-4 h-4 text-emerald-600" />
              {activeShop.subscriptionTier}
            </div>
            <span className="text-[11px] text-gray-500">
              {activeShop.subscriptionTier === 'trial'
                ? `${activeShop.trialDaysLeft} days remaining`
                : 'Renews next month'}
            </span>
          </div>
        </div>
      </section>

      {/* HOURLY UPDATE SYSTEM ALERT BANNER */}
      {productsNeedingHourlyUpdate.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-4 sm:p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-yellow-200 animate-bounce" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                Hourly Price Update Reminder: {productsNeedingHourlyUpdate.length} items need a refresh
              </h3>
              <p className="text-xs sm:text-sm text-amber-100">
                Vegetable Mandi and market rates fluctuate throughout the day. Updating prices every hour gives your shop a "Freshly Updated" badge and attracts 40% more nearby buyers!
              </p>
            </div>
          </div>

          <button
            onClick={handleQuickRefreshAll}
            className="px-4 py-2.5 bg-white hover:bg-amber-50 text-amber-950 font-bold text-xs sm:text-sm rounded-xl shrink-0 shadow-sm flex items-center justify-center gap-2 transition"
          >
            <RefreshCw className="w-4 h-4 text-amber-700" />
            <span>Refresh All Timestamps to Now</span>
          </button>
        </div>
      )}

      {/* INVENTORY & PRODUCT MANAGEMENT (Easy 1-Click Update Table) */}
      <section aria-labelledby="inventory-heading" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 id="inventory-heading" className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
              <Layers className="w-6 h-6 text-emerald-600" />
              Live Inventory & Hourly Price Controls
            </h2>
            <p className="text-xs text-gray-500">
              Update produce prices and available quantities with a single click. Changes appear immediately on the customer price comparison screen.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs flex items-center gap-2 transition"
              aria-label="Add New Product"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Produce</span>
            </button>
            <button
              onClick={() => setIsFlashModalOpen(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs sm:text-sm rounded-xl shadow-xs flex items-center gap-2 transition"
              aria-label="Create Flash Sale"
            >
              <Zap className="w-4 h-4 text-yellow-100" />
              <span>Create Flash Deal</span>
            </button>
          </div>
        </div>

        {/* Product List Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {shopProducts.map((product) => {
            const needsUpdate = isNeedsHourlyUpdate(product.lastUpdated);

            return (
              <div
                key={product.id}
                className={`bg-white rounded-2xl border-2 p-4 sm:p-5 flex flex-col justify-between transition-all shadow-xs ${
                  needsUpdate
                    ? 'border-amber-300 hover:border-amber-400 bg-amber-50/20'
                    : 'border-gray-200 hover:border-emerald-300'
                }`}
              >
                <div>
                  {/* Top line with produce & grade */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-14 h-14 rounded-xl object-cover border border-gray-100 shadow-2xs"
                      />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {product.category}
                        </span>
                        <h3 className="font-bold text-gray-900 text-base mt-0.5">
                          {product.name}
                        </h3>
                        <p className="text-[11px] text-gray-500">
                          {product.qualityGrade} • {product.origin || 'Local Mandi'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm(`Remove ${product.name} from inventory?`)) {
                          removeProduct(product.id);
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition"
                      title="Remove produce"
                      aria-label={`Remove ${product.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Hourly Update Status Badge */}
                  <div className="mb-3">
                    {needsUpdate ? (
                      <div className="bg-amber-100/90 text-amber-900 text-xs px-2.5 py-1 rounded-lg flex items-center justify-between border border-amber-300 font-medium">
                        <span className="flex items-center gap-1 text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          Last updated {formatTimeAgo(product.lastUpdated)}
                        </span>
                        <button
                          onClick={() => quickHourlyRefresh(product.id)}
                          className="text-[11px] font-bold text-amber-800 hover:underline"
                        >
                          Refresh Now
                        </button>
                      </div>
                    ) : (
                      <div className="text-[11px] text-emerald-700 flex items-center justify-between">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          Updated: {formatTimeAgo(product.lastUpdated)}
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                          Fresh Today
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quick Inline Price & Stock Controls */}
                  <div className="space-y-3 bg-gray-50 p-3 rounded-xl border border-gray-100 mb-3">
                    {/* Price adjustment */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-gray-500 font-medium block">Price per {product.unit}</span>
                        <span className="text-xl font-black text-gray-900">₹{product.price}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handlePriceChange(product.id, product.price, -2)}
                          className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-100 flex items-center justify-center text-xs shadow-2xs"
                          title="Decrease price by ₹2"
                          aria-label="Decrease price"
                        >
                          -2
                        </button>
                        <button
                          onClick={() => handlePriceChange(product.id, product.price, -1)}
                          className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-100 flex items-center justify-center text-xs shadow-2xs"
                          title="Decrease price by ₹1"
                          aria-label="Decrease price by 1"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => handlePriceChange(product.id, product.price, 1)}
                          className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 flex items-center justify-center text-xs shadow-2xs"
                          title="Increase price by ₹1"
                          aria-label="Increase price by 1"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => handlePriceChange(product.id, product.price, 2)}
                          className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 flex items-center justify-center text-xs shadow-2xs"
                          title="Increase price by ₹2"
                          aria-label="Increase price by 2"
                        >
                          +2
                        </button>
                      </div>
                    </div>

                    {/* Stock adjustment */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
                      <div>
                        <span className="text-[11px] text-gray-500 font-medium block">Stock Available</span>
                        <span className="text-sm font-bold text-gray-900">
                          {product.availableStock} {product.unit}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStockChange(product.id, product.availableStock, -5)}
                          className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-100 flex items-center justify-center text-xs shadow-2xs"
                          title="Decrease stock by 5"
                          aria-label="Decrease stock by 5"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => handleStockChange(product.id, product.availableStock, 5)}
                          className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-100 flex items-center justify-center text-xs shadow-2xs"
                          title="Increase stock by 5"
                          aria-label="Increase stock by 5"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => handleStockChange(product.id, product.availableStock, 10)}
                          className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-100 flex items-center justify-center text-xs shadow-2xs"
                          title="Increase stock by 10"
                          aria-label="Increase stock by 10"
                        >
                          +10
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Status & Refresh Button */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={product.isAvailable}
                      onChange={(e) => updateProduct(product.id, { isAvailable: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-gray-700 font-medium">In Stock</span>
                  </label>

                  <button
                    onClick={() => quickHourlyRefresh(product.id)}
                    className="flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 transition"
                    title="Timestamp this product as checked right now"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Save & Timestamp</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FLASH SALES & FOOD WASTE REDUCTION HUB */}
      <section aria-labelledby="flash-hub-heading" className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 id="flash-hub-heading" className="text-xl font-bold text-gray-900">
                Flash Sales & Food Waste Prevention Hub
              </h2>
              <p className="text-xs text-gray-500">
                Discount surplus or near-peak produce before closing. Help the neighbourhood and eliminate produce loss.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsFlashModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Flash Deal</span>
          </button>
        </div>

        {shopFlashDeals.length === 0 ? (
          <div className="p-8 bg-amber-50/50 rounded-2xl border border-amber-200 text-center">
            <Leaf className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <h3 className="font-bold text-gray-800 text-sm">No Active Flash Deals for {activeShop.name}</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 mb-3">
              Do you have extra tomatoes, ripe bananas, or morning greens? Create a flash deal to recover revenue and prevent food waste!
            </p>
            <button
              onClick={() => setIsFlashModalOpen(true)}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition"
            >
              Start a Flash Deal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shopFlashDeals.map((deal) => (
              <div
                key={deal.id}
                className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-gray-900 text-sm">{deal.productName}</h4>
                    <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full">
                      Flash Deal
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-2 text-xs">
                    <span className="line-through text-gray-400">₹{deal.originalPrice}/{deal.unit}</span>
                    <span className="text-lg font-black text-amber-900">
                      ₹{deal.flashPrice}/{deal.unit}
                    </span>
                    <span className="bg-amber-200/80 text-amber-950 font-bold px-1.5 py-0.5 rounded text-[10px]">
                      Stock: {deal.availableStock} {deal.unit}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-600 italic mb-3">"{deal.reason}"</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-amber-200 text-xs">
                  <span className="text-gray-500 flex items-center gap-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Active on customer feed
                  </span>
                  <button
                    onClick={() => removeFlashDeal(deal.id)}
                    className="text-red-600 hover:text-red-700 font-semibold"
                  >
                    End Deal
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SUBSCRIPTION MODEL & BUSINESS GROWTH */}
      <section aria-labelledby="subscription-heading" className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 font-semibold text-xs px-2.5 py-1 rounded-full border border-emerald-500/30">
              <Shield className="w-3.5 h-3.5" />
              <span>Affordable Micro-Subscription Model</span>
            </div>
            <h2 id="subscription-heading" className="text-2xl font-bold text-white">
              Current Plan: <span className="text-emerald-400 capitalize">{activeShop.subscriptionTier}</span>
            </h2>
            <p className="text-sm text-emerald-100/90 leading-relaxed">
              {activeShop.subscriptionTier === 'trial'
                ? `You have ${activeShop.trialDaysLeft} days remaining in your free trial! Zero commissions, unlimited local customer reach.`
                : `Your ${activeShop.subscriptionTier} plan is active. Next simulated renewal: ${activeShop.subscriptionRenewDate}.`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setIsSubscriptionOpen(true)}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-900" />
              <span>View & Change Subscription</span>
            </button>
          </div>
        </div>

        {/* Premium Analytics Preview (Unlocked on Premium or Free Trial) */}
        <div className="mt-8 pt-6 border-t border-emerald-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-800/60">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold mb-1">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span>Food Waste Prevented</span>
            </div>
            <div className="text-2xl font-black text-white">34 kg</div>
            <span className="text-[11px] text-emerald-300">~₹1,180 recovered this month</span>
          </div>

          <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-800/60">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold mb-1">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Customer Comparison Views</span>
            </div>
            <div className="text-2xl font-black text-white">418 views</div>
            <span className="text-[11px] text-emerald-300">In {currentLocality?.name.split('(')[0].trim()}</span>
          </div>

          <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-800/60">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold mb-1">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              <span>Lowest-Price Wins</span>
            </div>
            <div className="text-2xl font-black text-white">6 products</div>
            <span className="text-[11px] text-emerald-300">Currently lowest price in area</span>
          </div>
        </div>
      </section>

      {/* Modals */}
      <AddProductModal isOpen={isAddProductOpen} onClose={() => setIsAddProductOpen(false)} />
      <CreateFlashDealModal isOpen={isFlashModalOpen} onClose={() => setIsFlashModalOpen(false)} />
      <SubscriptionModal isOpen={isSubscriptionOpen} onClose={() => setIsSubscriptionOpen(false)} />
    </div>
  );
};
