import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  MapPin,
  ShoppingBasket,
  Camera,
  Store,
  User,
  PlusCircle,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { LocalityId } from '../types';
import { CartDrawer } from './CartDrawer';
import { ShopRegistrationModal } from './ShopRegistrationModal';

export const Navbar: React.FC = () => {
  const {
    role,
    setRole,
    localityId,
    setLocalityId,
    localities,
    cart,
    setIsScannerOpen,
    activeShop,
  } = useMarketplace();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setRole('customer');
              }}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                <span className="text-xl">🥬</span>
              </div>
              <div>
                <span className="text-lg sm:text-xl font-black text-gray-900 tracking-tight flex items-center gap-1">
                  Fresh<span className="text-emerald-600">Nearby</span>
                </span>
                <span className="hidden sm:block text-[10px] font-semibold text-gray-500 uppercase tracking-wider -mt-1">
                  Local Produce Marketplace
                </span>
              </div>
            </button>
          </div>

          {/* Locality Selector (Desktop) */}
          <div className="hidden md:flex items-center gap-2 bg-emerald-50/80 border border-emerald-200/80 px-3 py-1.5 rounded-xl">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <select
              value={localityId}
              onChange={(e) => setLocalityId(e.target.value as LocalityId)}
              className="bg-transparent text-xs sm:text-sm font-bold text-emerald-950 focus:outline-none cursor-pointer pr-1"
              aria-label="Select locality"
            >
              {localities.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Scanner Button */}
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition hover:scale-102"
              title="Open camera to scan produce or shop QR"
              aria-label="Live Produce Scanner"
            >
              <Camera className="w-4 h-4 animate-pulse text-emerald-200" />
              <span className="hidden sm:inline">Live Scanner</span>
            </button>

            {/* Role Switcher Button */}
            <div className="hidden sm:flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setRole('customer')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition ${
                  role === 'customer'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Customer</span>
              </button>
              <button
                onClick={() => setRole('shopkeeper')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition ${
                  role === 'shopkeeper'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Shopkeeper</span>
              </button>
            </div>

            {/* Register Shop Trigger */}
            <button
              onClick={() => setIsRegModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl transition border border-emerald-200/60"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Register Shop</span>
            </button>

            {/* Basket Drawer Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 transition"
              aria-label={`Open Basket with ${cartCount} items`}
            >
              <ShoppingBasket className="w-5 h-5 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-3">
            {/* Locality Selector */}
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase block mb-1">
                Selected Locality
              </span>
              <select
                value={localityId}
                onChange={(e) => {
                  setLocalityId(e.target.value as LocalityId);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-xs font-bold text-gray-900 p-2 border border-gray-300 rounded-xl bg-gray-50"
              >
                {localities.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Role switch */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  setRole('customer');
                  setMobileMenuOpen(false);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                  role === 'customer'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Customer View</span>
              </button>
              <button
                onClick={() => {
                  setRole('shopkeeper');
                  setMobileMenuOpen(false);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                  role === 'shopkeeper'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Shopkeeper View</span>
              </button>
            </div>

            <button
              onClick={() => {
                setIsRegModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200"
            >
              + Register New Produce Shop
            </button>
          </div>
        )}
      </header>

      {/* Cart Drawer & Registration Modal */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <ShopRegistrationModal isOpen={isRegModalOpen} onClose={() => setIsRegModalOpen(false)} />
    </>
  );
};
