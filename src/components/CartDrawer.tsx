import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  X,
  ShoppingBasket,
  Trash2,
  TrendingDown,
  Store,
  CheckCircle,
  PhoneCall,
  Sparkles,
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const {
    cart,
    removeFromCart,
    addToCart,
    clearCart,
    getCartTotal,
    shops,
    products,
    localityId,
  } = useMarketplace();

  const [orderPlaced, setOrderPlaced] = useState(false);

  if (!isOpen) return null;

  const total = getCartTotal();

  // Smart Basket Analysis:
  // For all produce items in the cart, calculate how much this entire basket would cost if bought at each shop in the locality
  const localityShops = shops.filter((s) => s.localityId === localityId);
  const shopBasketTotals = localityShops.map((shop) => {
    let basketCost = 0;
    let availableCount = 0;

    for (const item of cart) {
      // Find this product in this shop
      const shopProduct = products.find(
        (p) => p.shopId === shop.id && p.name.toLowerCase() === item.product.name.toLowerCase()
      );
      if (shopProduct) {
        basketCost += shopProduct.price * item.quantity;
        availableCount += 1;
      } else {
        // Fallback to item price if shop doesn't carry it
        basketCost += item.product.price * item.quantity;
      }
    }

    return {
      shop,
      basketCost,
      availableCount,
    };
  });

  // Find shop with lowest basket cost
  shopBasketTotals.sort((a, b) => a.basketCost - b.basketCost);
  const bestShop = shopBasketTotals[0];

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
    >
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slideLeft">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <ShoppingBasket className="w-5 h-5" />
            </div>
            <div>
              <h2 id="cart-drawer-title" className="font-bold text-gray-900 text-lg">
                Fresh Produce Basket
              </h2>
              <p className="text-xs text-gray-500">
                {cart.length} {cart.length === 1 ? 'item' : 'items'} selected
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            aria-label="Close Basket"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {orderPlaced ? (
          <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Order Inquiry Sent!</h3>
            <p className="text-sm text-gray-600 mb-6">
              Your fresh produce basket reservation has been submitted. The shopkeeper will keep your produce packed and fresh for pickup or local delivery.
            </p>
            <button
              onClick={() => {
                clearCart();
                setOrderPlaced(false);
                onClose();
              }}
              className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition"
            >
              Done & Return
            </button>
          </div>
        ) : cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
              <ShoppingBasket className="w-8 h-8" />
            </div>
            <h3 className="font-semibold text-gray-800 text-base mb-1">Your basket is empty</h3>
            <p className="text-xs text-gray-500 max-w-xs mb-4">
              Search vegetables and fruits, compare prices across nearby shops, and add the best deals here!
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition"
            >
              Browse Local Produce
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Basket Items List */}
            <div className="space-y-2.5">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Store className="w-3 h-3 text-emerald-600" />
                      {item.shop.name}
                    </p>
                    <div className="text-xs font-bold text-gray-800 mt-0.5">
                      ₹{item.product.price}/{item.product.unit}
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden text-xs">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            addToCart(item.product, item.shop, -1);
                          } else {
                            removeFromCart(item.product.id);
                          }
                        }}
                        className="px-2 py-1 text-gray-600 hover:bg-gray-100 font-bold"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-2 font-semibold text-gray-800">{item.quantity}</span>
                      <button
                        onClick={() => addToCart(item.product, item.shop, 1)}
                        className="px-2 py-1 text-gray-600 hover:bg-gray-100 font-bold"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Smart Basket Optimizer */}
            {bestShop && localityShops.length > 1 && (
              <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-emerald-500/5 rounded-2xl p-4 border border-emerald-500/30">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs mb-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Smart Basket Price Comparison</span>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  If you buy this entire basket at a single shop in your area:
                </p>

                <div className="space-y-1.5">
                  {shopBasketTotals.map((entry, i) => (
                    <div
                      key={entry.shop.id}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs ${
                        i === 0
                          ? 'bg-emerald-100/90 text-emerald-950 font-semibold border border-emerald-300'
                          : 'bg-white/80 text-gray-700 border border-gray-100'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-emerald-600" />
                        {entry.shop.name}
                        {i === 0 && (
                          <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded font-bold">
                            Lowest Total
                          </span>
                        )}
                      </span>
                      <span>₹{entry.basketCost}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {!orderPlaced && cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/80 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total Estimated Cost:</span>
              <span className="text-2xl font-black text-gray-900">₹{total}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setOrderPlaced(true)}
                className="col-span-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Reserve Produce at Shop</span>
              </button>
            </div>
            <p className="text-[11px] text-center text-gray-500">
              FreshNearby is 100% free for customers. Pay the shopkeeper directly upon pickup.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
