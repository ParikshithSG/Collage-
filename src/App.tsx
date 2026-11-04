/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';
import { DemoToolbar } from './components/DemoToolbar';
import { Navbar } from './components/Navbar';
import { CustomerDashboard } from './components/CustomerDashboard';
import { ShopkeeperDashboard } from './components/ShopkeeperDashboard';
import { LiveScannerModal } from './components/LiveScannerModal';
import { ProductComparisonModal } from './components/ProductComparisonModal';
import { Footer } from './components/Footer';

const AppContent: React.FC = () => {
  const { role } = useMarketplace();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-gray-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* College Project Presentation & Demo Toolbar */}
      <DemoToolbar />

      {/* Main Navigation Bar */}
      <Navbar />

      {/* Primary Dashboard (Customer or Shopkeeper View) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {role === 'customer' ? <CustomerDashboard /> : <ShopkeeperDashboard />}
      </main>

      {/* Global Interactive Overlays */}
      <LiveScannerModal />
      <ProductComparisonModal />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <MarketplaceProvider>
      <AppContent />
    </MarketplaceProvider>
  );
}
