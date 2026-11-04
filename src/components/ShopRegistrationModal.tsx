import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { X, Store, CheckCircle, ShieldCheck } from 'lucide-react';
import { LocalityId } from '../types';

interface ShopRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShopRegistrationModal: React.FC<ShopRegistrationModalProps> = ({ isOpen, onClose }) => {
  const { registerShop, localities } = useMarketplace();

  const [ownerName, setOwnerName] = useState('');
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [localityId, setLocalityId] = useState<LocalityId>('area-x');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!ownerName.trim() || !shopName.trim() || !phone.trim() || !address.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (phone.trim().length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    registerShop({
      ownerName: ownerName.trim(),
      shopName: shopName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      localityId,
      password,
    });

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reg-modal-title"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h2 id="reg-modal-title" className="text-xl font-bold">
                Register Your Produce Shop
              </h2>
              <p className="text-xs text-emerald-100">
                Start your 30-day free trial. Attract nearby customers and update prices hourly.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition"
            aria-label="Close Registration"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        {success ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Welcome to FreshNearby!</h3>
            <p className="text-sm text-gray-600">
              <strong>{shopName}</strong> has been registered with a 30-Day Free Trial. Loading your shopkeeper dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Shop Owner's Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Shop Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annapurna Fresh Veggies"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Locality / Area *
                </label>
                <select
                  value={localityId}
                  onChange={(e) => setLocalityId(e.target.value as LocalityId)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  {localities.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Shop Address & Stall Number *
              </label>
              <textarea
                required
                rows={2}
                placeholder="e.g. Shop #14, Vegetable Mandi, 2nd Cross, Near Metro Gate"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Account Password *
              </label>
              <input
                type="password"
                required
                placeholder="Choose a password for your shop login"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Trial Guarantee Note */}
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-900">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">30-Day Free Trial Included:</span>
                <p className="text-emerald-800 text-[11px] mt-0.5">
                  No credit card required. Full access to product listings, hourly price updates, and customer visibility. Only ₹99/mo after trial ends.
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition"
              >
                Complete Registration & Open Dashboard
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
