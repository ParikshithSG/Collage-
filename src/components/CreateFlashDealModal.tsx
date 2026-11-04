import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { calculateDiscountPercent } from '../utils/marketplaceLogic';
import { X, Zap, Leaf, Clock, TrendingDown } from 'lucide-react';

interface CreateFlashDealModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateFlashDealModal: React.FC<CreateFlashDealModalProps> = ({ isOpen, onClose }) => {
  const { activeShop, products, createFlashDeal } = useMarketplace();

  // Get products of the active shop
  const shopProducts = activeShop ? products.filter((p) => p.shopId === activeShop.id) : [];

  const [selectedProductId, setSelectedProductId] = useState<string>(
    shopProducts[0]?.id || ''
  );
  const [flashPrice, setFlashPrice] = useState<number>(15);
  const [dealStock, setDealStock] = useState<number>(8);
  const [expiryHours, setExpiryHours] = useState<number>(3);
  const [reason, setReason] = useState('Surplus afternoon harvest to prevent food spoilage');

  if (!isOpen || !activeShop) return null;

  const currentProduct = shopProducts.find((p) => p.id === selectedProductId) || shopProducts[0];
  const originalPrice = currentProduct ? currentProduct.price : 30;
  const discountPercent = calculateDiscountPercent(originalPrice, flashPrice);

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    const prod = shopProducts.find((p) => p.id === productId);
    if (prod) {
      // Default to 40% off
      setFlashPrice(Math.round(prod.price * 0.6));
      setDealStock(Math.min(prod.availableStock, 10));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct || flashPrice >= originalPrice || dealStock <= 0) return;

    const expiryTimestamp = new Date(Date.now() + expiryHours * 3600 * 1000).toISOString();

    createFlashDeal({
      shopId: activeShop.id,
      productId: currentProduct.id,
      productName: currentProduct.name,
      category: currentProduct.category,
      originalPrice,
      flashPrice: Number(flashPrice),
      availableStock: Number(dealStock),
      unit: currentProduct.unit,
      expiryTimestamp,
      reason,
      image: currentProduct.image,
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="flash-deal-title"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-amber-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
              <Zap className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h2 id="flash-deal-title" className="text-lg font-bold">
                Create Food-Waste Reduction Flash Deal
              </h2>
              <p className="text-xs text-amber-100">
                Rescue surplus or near-peak produce with instant customer flash discounts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-white/10 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Why it matters note */}
        <div className="bg-amber-50 p-3.5 border-b border-amber-100 flex items-center gap-2.5 text-xs text-amber-900">
          <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Every kilo of surplus produce discounted recovers revenue for your shop and prevents nutritious food waste!
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Select Product */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Select Produce from Your Shop *
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-medium"
            >
              {shopProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Current: ₹{p.price}/{p.unit} • Stock: {p.availableStock} {p.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
              <span className="text-[11px] text-gray-500 block font-medium">Original Price</span>
              <div className="text-xl font-bold text-gray-700 line-through">
                ₹{originalPrice}
                <span className="text-xs font-normal">/{currentProduct?.unit}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-900 mb-1">
                Flash Sale Price (₹) *
              </label>
              <input
                type="number"
                required
                min={1}
                max={originalPrice - 1}
                value={flashPrice}
                onChange={(e) => setFlashPrice(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border-2 border-amber-500 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold text-amber-950 bg-amber-50/30"
              />
            </div>
          </div>

          {/* Discount badge preview */}
          {discountPercent > 0 && (
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl p-2.5 flex items-center justify-between text-xs font-bold shadow-xs">
              <span className="flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4" />
                Customer Savings: {discountPercent}% OFF
              </span>
              <span>
                Discount of ₹{originalPrice - flashPrice}/{currentProduct?.unit}
              </span>
            </div>
          )}

          {/* Quantity & Expiry Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Surplus Quantity to Clear ({currentProduct?.unit}) *
              </label>
              <input
                type="number"
                required
                min={1}
                max={currentProduct?.availableStock || 50}
                value={dealStock}
                onChange={(e) => setDealStock(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Offer Expiry Countdown *
              </label>
              <select
                value={expiryHours}
                onChange={(e) => setExpiryHours(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
              >
                <option value={1}>Expires in 1 Hour (Urgent clearance)</option>
                <option value={2}>Expires in 2 Hours</option>
                <option value={3}>Expires in 3 Hours (Recommended)</option>
                <option value={5}>Expires in 5 Hours</option>
                <option value={8}>Expires at End of Day</option>
              </select>
            </div>
          </div>

          {/* Reason Tag */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Surplus Reason / Customer Notice
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
            >
              <option value="Surplus afternoon harvest to prevent food spoilage">
                Surplus afternoon harvest to prevent food spoilage
              </option>
              <option value="Peak sugar ripeness! Perfect for today's cooking and salads">
                Peak sugar ripeness! Perfect for today's cooking and salads
              </option>
              <option value="End-of-day Mandi crate clearance">
                End-of-day Mandi crate clearance
              </option>
              <option value="Special neighbourhood discount batch">
                Special neighbourhood discount batch
              </option>
            </select>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition"
            >
              <Zap className="w-4 h-4 text-yellow-300" />
              <span>Publish Flash Deal to Local Customers</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
