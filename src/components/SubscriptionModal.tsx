import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { X, Check, Sparkles, Shield, Zap, CheckCircle2 } from 'lucide-react';
import { SubscriptionTier } from '../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { activeShop, upgradeSubscription } = useMarketplace();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>('premium');
  const [activating, setActivating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen || !activeShop) return null;

  const currentTier = activeShop.subscriptionTier;

  const handleSimulatedUpgrade = (tier: SubscriptionTier) => {
    setActivating(true);
    setTimeout(() => {
      upgradeSubscription(activeShop.id, tier);
      setActivating(false);
      setSuccessMessage(
        `Plan successfully updated to ${
          tier === 'premium' ? 'Premium Plan (₹199/mo)' : 'Basic Plan (₹99/mo)'
        }! Features are now active.`
      );
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1800);
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="subscription-modal-title"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition"
            aria-label="Close Subscription Modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/30 text-emerald-300 font-semibold text-xs px-2.5 py-1 rounded-full mb-2 border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              Affordable Shopkeeper Growth Plans
            </div>
            <h2 id="subscription-modal-title" className="text-2xl sm:text-3xl font-extrabold text-white">
              FreshNearby Shopkeeper Subscriptions
            </h2>
            <p className="text-sm text-emerald-100/90 mt-1">
              Currently managing: <strong className="text-white">{activeShop.name}</strong> • Customer app is always 100% free!
            </p>
          </div>

          {/* Current status pill */}
          <div className="mt-4 inline-flex items-center gap-2 bg-emerald-950/80 px-3.5 py-1.5 rounded-xl border border-emerald-700/60 text-xs">
            <span className="text-emerald-300">Active Status:</span>
            <span className="font-bold uppercase tracking-wider text-white">
              {currentTier === 'trial' ? `Free Trial (${activeShop.trialDaysLeft} days left)` : `${currentTier} Plan`}
            </span>
          </div>
        </div>

        {/* Success toast */}
        {successMessage ? (
          <div className="p-10 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Subscription Activated!</h3>
            <p className="text-sm text-gray-600 max-w-md">{successMessage}</p>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Free Trial Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    First 30 Days Free Trial Guarantee
                  </h3>
                  <p className="text-xs text-gray-600">
                    All essential features are free for the first month. Zero commission on sales.
                  </p>
                </div>
              </div>
              <span className="bg-amber-200/80 text-amber-900 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                {activeShop.trialDaysLeft} Days Remaining
              </span>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Basic Plan */}
              <div
                onClick={() => setSelectedPlan('basic')}
                className={`rounded-2xl p-5 border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  selectedPlan === 'basic'
                    ? 'border-emerald-600 bg-emerald-50/20 shadow-md ring-2 ring-emerald-400/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Standard
                    </span>
                    {currentTier === 'basic' && (
                      <span className="text-[11px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                        Current Plan
                      </span>
                    )}
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">Basic Plan</h4>
                  <div className="mt-2 mb-4">
                    <span className="text-3xl font-black text-gray-900">₹99</span>
                    <span className="text-xs text-gray-500 font-medium">/month</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-4">
                    Essential inventory and live pricing tools to attract local neighbourhood shoppers.
                  </p>

                  <ul className="space-y-2.5 text-xs text-gray-700">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Unlimited produce product listings</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Hourly price and stock updates</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Verified shop profile in locality search</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Local customer price comparison inclusion</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSimulatedUpgrade('basic');
                    }}
                    disabled={activating}
                    className="w-full py-2.5 rounded-xl text-xs font-bold transition bg-gray-100 hover:bg-gray-200 text-gray-800"
                  >
                    {currentTier === 'basic' ? 'Renew Basic Plan (₹99)' : 'Choose Basic Plan (₹99/mo)'}
                  </button>
                </div>
              </div>

              {/* Premium Plan */}
              <div
                onClick={() => setSelectedPlan('premium')}
                className={`rounded-2xl p-5 border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  selectedPlan === 'premium'
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-lg ring-2 ring-emerald-500/30'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="absolute -top-3 right-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-yellow-300" />
                  Recommended
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Most Popular
                    </span>
                    {currentTier === 'premium' && (
                      <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        Current Plan
                      </span>
                    )}
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">Premium Plan</h4>
                  <div className="mt-2 mb-4">
                    <span className="text-3xl font-black text-emerald-700">₹199</span>
                    <span className="text-xs text-gray-500 font-medium">/month</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-4">
                    High-volume growth tools, food-waste reduction flash deals, and customer analytics.
                  </p>

                  <ul className="space-y-2.5 text-xs text-gray-700">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <strong className="text-gray-900">Everything in Basic Plan</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Flash Deals Hub:</strong> Clear surplus produce with countdowns</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Food Waste Reduction Analytics:</strong> Track kg saved & revenue rescued</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Priority Locality Placement:</strong> Top badge in customer comparisons</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Produce demand heatmaps & hourly price insights</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSimulatedUpgrade('premium');
                    }}
                    disabled={activating}
                    className="w-full py-2.5 rounded-xl text-xs font-bold transition bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                  >
                    {currentTier === 'premium'
                      ? 'Renew Premium Plan (₹199)'
                      : 'Activate Premium Plan (₹199/mo)'}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-gray-500">
              Note: This is a college project prototype demonstration. Subscription activation is simulated instantly with zero real charges.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
