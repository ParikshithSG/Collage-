import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { PRODUCE_CATALOG } from '../data/seedData';
import { X, Plus, Sparkles } from 'lucide-react';
import { ProductCategory } from '../types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose }) => {
  const { activeShop, addProduct } = useMarketplace();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('vegetable');
  const [unit, setUnit] = useState('kg');
  const [price, setPrice] = useState<number>(30);
  const [stock, setStock] = useState<number>(20);
  const [qualityGrade, setQualityGrade] = useState<'Grade A Premium' | 'Farm Fresh' | 'Standard'>('Farm Fresh');
  const [image, setImage] = useState('');
  const [origin, setOrigin] = useState('');

  if (!isOpen || !activeShop) return null;

  const handleSelectPreset = (preset: typeof PRODUCE_CATALOG[0]) => {
    setName(preset.name);
    setCategory(preset.category);
    setUnit(preset.unit);
    setPrice(preset.basePrice);
    setImage(preset.image);
    setOrigin(preset.origin || 'Local Mandi');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price <= 0 || stock < 0) return;

    const finalImage =
      image.trim() ||
      (category === 'vegetable'
        ? 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80');

    addProduct({
      shopId: activeShop.id,
      name: name.trim(),
      category,
      unit,
      price: Number(price),
      availableStock: Number(stock),
      isAvailable: true,
      image: finalImage,
      qualityGrade,
      origin: origin.trim() || 'Local Mandi',
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-product-title"
    >
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-emerald-50/50">
          <div>
            <h2 id="add-product-title" className="font-bold text-gray-900 text-lg">
              Add New Produce to {activeShop.name}
            </h2>
            <p className="text-xs text-gray-500">
              List new vegetable or fruit item with live hourly pricing
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Presets selector */}
          <div>
            <span className="text-xs font-semibold text-gray-700 flex items-center gap-1 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Quick Fill from Common Produce:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRODUCE_CATALOG.slice(0, 8).map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => handleSelectPreset(preset)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-gray-200 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition font-medium"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Produce Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Tomatoes"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                <option value="vegetable">🥦 Vegetable</option>
                <option value="fruit">🍎 Fruit</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Price (₹) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Unit *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                <option value="kg">Per kg</option>
                <option value="piece">Per piece</option>
                <option value="bunch">Per bunch</option>
                <option value="dozen">Per dozen</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Available Stock *
              </label>
              <input
                type="number"
                required
                min={0}
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Quality Grade
              </label>
              <select
                value={qualityGrade}
                onChange={(e) => setQualityGrade(e.target.value as 'Grade A Premium' | 'Farm Fresh' | 'Standard')}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                <option value="Farm Fresh">Farm Fresh</option>
                <option value="Grade A Premium">Grade A Premium</option>
                <option value="Standard">Standard Quality</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Source / Mandi Origin
              </label>
              <input
                type="text"
                placeholder="e.g. Nashik, Kolar Mandi"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Image URL (optional)
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition"
            >
              <Plus className="w-5 h-5" />
              <span>List Product in Shop</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
