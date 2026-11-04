import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Camera, MapPin, RefreshCw, Store, User, Sparkles } from 'lucide-react';
import { LocalityId } from '../types';

export const DemoToolbar: React.FC = () => {
  const {
    role,
    setRole,
    localityId,
    setLocalityId,
    localities,
    shops,
    activeShopId,
    setActiveShopId,
    setIsScannerOpen,
    resetToDefaultData,
  } = useMarketplace();

  return (
    <div className="bg-emerald-950 text-emerald-100 border-b border-emerald-800/80 px-3 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Project & Presentation Tag */}
        <div className="flex items-center gap-2">
          <span className="bg-emerald-700/80 text-emerald-100 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-300" />
            College Project Demo
          </span>
          <span className="hidden sm:inline text-emerald-300/80">
            FreshNearby Hyperlocal Platform
          </span>
        </div>

        {/* Quick controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role Switcher */}
          <div className="flex items-center bg-emerald-900/90 rounded-lg p-0.5 border border-emerald-700/60">
            <button
              onClick={() => setRole('customer')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                role === 'customer'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-emerald-200 hover:text-white'
              }`}
              aria-label="Switch to Customer Mode"
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer View</span>
            </button>
            <button
              onClick={() => setRole('shopkeeper')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                role === 'shopkeeper'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-emerald-200 hover:text-white'
              }`}
              aria-label="Switch to Shopkeeper Mode"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Shopkeeper View</span>
            </button>
          </div>

          {/* If Shopkeeper, Shop selector */}
          {role === 'shopkeeper' && (
            <div className="flex items-center gap-1 bg-emerald-900/80 px-2 py-1 rounded-md border border-emerald-700/60">
              <Store className="w-3.5 h-3.5 text-emerald-300" />
              <label htmlFor="shop-select" className="text-emerald-300 font-medium">
                Shop:
              </label>
              <select
                id="shop-select"
                value={activeShopId}
                onChange={(e) => setActiveShopId(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-1"
              >
                {shops.map((s) => (
                  <option key={s.id} value={s.id} className="bg-emerald-900 text-white">
                    {s.name} ({s.localityId === 'area-x' ? 'Area X' : 'Area Y'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Locality Switcher */}
          <div className="flex items-center gap-1 bg-emerald-900/80 px-2 py-1 rounded-md border border-emerald-700/60">
            <MapPin className="w-3.5 h-3.5 text-emerald-300" />
            <label htmlFor="locality-select" className="text-emerald-300 font-medium">
              Locality:
            </label>
            <select
              id="locality-select"
              value={localityId}
              onChange={(e) => setLocalityId(e.target.value as LocalityId)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-1"
            >
              {localities.map((loc) => (
                <option key={loc.id} value={loc.id} className="bg-emerald-900 text-white">
                  {loc.name.split('(')[0].trim()}
                </option>
              ))}
            </select>
          </div>

          {/* Live Scanner trigger */}
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-700 hover:bg-emerald-600 text-white font-medium transition-all shadow-sm border border-emerald-500/40"
            title="Open Live Produce & Price Scanner"
            aria-label="Open Live Produce Scanner"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
            <span>Live Scanner</span>
          </button>

          {/* Reset Demo Data button */}
          <button
            onClick={() => {
              if (window.confirm('Reset all sample data, hourly updates, and flash deals to default?')) {
                resetToDefaultData();
              }
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 hover:text-white transition-all border border-emerald-700/40"
            title="Reset sample data"
            aria-label="Reset demo sample data"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden md:inline">Reset Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
