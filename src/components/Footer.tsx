import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Sparkles, Shield, Heart, Store } from 'lucide-react';

export const Footer: React.FC = () => {
  const { role, setRole } = useMarketplace();

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥬</span>
              <span className="text-lg font-black text-white tracking-tight">
                Fresh<span className="text-emerald-400">Nearby</span>
              </span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed max-w-md">
              A hyperlocal fresh produce marketplace connecting neighbourhood vegetable and fruit vendors with nearby households. Featuring hourly live price comparisons, food-waste reduction flash deals, and an affordable subscription model for local shops.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 pt-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Working Prototype for College Project Demonstration</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Platform Features
            </h4>
            <ul className="space-y-2 text-gray-400">
              <li>Multi-Shop Price Comparison</li>
              <li>Hourly Stock & Rate Refresh</li>
              <li>Live Camera Produce Scanner</li>
              <li>Food Waste Rescue Flash Deals</li>
              <li>Smart Grocery Basket Optimizer</li>
            </ul>
          </div>

          {/* Business & Social Model */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Fair Business Model
            </h4>
            <ul className="space-y-2 text-gray-400">
              <li className="text-emerald-400 font-semibold">100% Free For All Customers</li>
              <li>30 Days Free Trial for Shops</li>
              <li>Basic Plan: ₹99/month</li>
              <li>Premium Plan: ₹199/month</li>
              <li className="pt-1">
                <button
                  onClick={() => setRole(role === 'customer' ? 'shopkeeper' : 'customer')}
                  className="text-emerald-400 hover:underline font-bold"
                >
                  Switch to {role === 'customer' ? 'Shopkeeper Portal' : 'Customer View'} →
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-500">
          <p>© {new Date().getFullYear()} FreshNearby – Hyperlocal Fresh Produce Marketplace.</p>
          <p className="flex items-center gap-1">
            Built for sustainable local communities & zero food waste <Heart className="w-3 h-3 text-red-500 fill-red-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
};
