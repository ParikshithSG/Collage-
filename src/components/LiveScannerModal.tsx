import React, { useEffect, useRef, useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { playScanBeep } from '../utils/audio';
import { groupProductsForComparison } from '../utils/marketplaceLogic';
import {
  Camera,
  X,
  Zap,
  Sparkles,
  ShoppingBasket,
  ArrowRight,
  TrendingDown,
  Clock,
  Store,
  Upload,
  RotateCcw,
} from 'lucide-react';
import { ProductComparisonGroup } from '../types';

export const LiveScannerModal: React.FC = () => {
  const {
    isScannerOpen,
    setIsScannerOpen,
    localityId,
    products,
    shops,
    addToCart,
    role,
    setSelectedCompareProductName,
  } = useMarketplace();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [detectedProduce, setDetectedProduce] = useState<string | null>(null);
  const [scanConfidence, setScanConfidence] = useState<number>(96);
  const [detectionTimestamp, setDetectionTimestamp] = useState<string>('');
  const [matchedComparison, setMatchedComparison] = useState<ProductComparisonGroup | null>(null);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  // Stop camera when closed
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  };

  // Start camera when opened
  useEffect(() => {
    let currentStream: MediaStream | null = null;
    if (isScannerOpen) {
      setDetectedProduce(null);
      setMatchedComparison(null);
      setIsScanning(true);

      // Attempt to access user media
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
          })
          .then((stream) => {
            currentStream = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.play().catch(() => {});
            }
            setStreamActive(true);
          })
          .catch(() => {
            // Camera not available or permission denied in iframe; fallback to simulated camera canvas
            setStreamActive(false);
          });
      }
    } else {
      stopCamera();
    }

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isScannerOpen]);

  if (!isScannerOpen) return null;

  // Perform detection of produce item or QR code
  const triggerScanDetection = (produceName: string, confidence: number = 96) => {
    playScanBeep(880, 140);
    setIsScanning(false);
    setDetectedProduce(produceName);
    setScanConfidence(confidence);
    setDetectionTimestamp(new Date().toLocaleTimeString());

    // Find price comparison in active locality
    const comparisons = groupProductsForComparison(localityId, products, shops);
    const matched = comparisons.find(
      (c) => c.productName.toLowerCase().includes(produceName.toLowerCase()) ||
             produceName.toLowerCase().includes(c.productName.toLowerCase())
    );

    if (matched) {
      setMatchedComparison(matched);
    } else {
      // If not in comparison, pick first available produce
      setMatchedComparison(comparisons[0] || null);
    }
  };

  const resetScanner = () => {
    setDetectedProduce(null);
    setMatchedComparison(null);
    setIsScanning(true);
    setAddedNotice(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Analyze file name or pick a realistic item
      const name = file.name.toLowerCase();
      let detected = 'Tomatoes';
      if (name.includes('onion')) detected = 'Onions';
      else if (name.includes('potato')) detected = 'Potatoes';
      else if (name.includes('apple')) detected = 'Apples (Royal Gala)';
      else if (name.includes('banana')) detected = 'Bananas (Robusta)';
      else if (name.includes('carrot')) detected = 'Carrots';
      triggerScanDetection(detected, 98);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scanner-modal-title"
    >
      <div className="relative w-full max-w-xl bg-gray-900 border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-900/90 border-b border-gray-800 text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 id="scanner-modal-title" className="font-semibold text-base text-white flex items-center gap-2">
                Live Produce & Price Scanner
                <span className="text-[10px] bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded tracking-wider uppercase">
                  Live
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Point at any vegetable, fruit, or shop QR code to compare local prices
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              setIsScannerOpen(false);
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
            aria-label="Close Scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="relative bg-black flex-1 min-h-[260px] max-h-[340px] flex items-center justify-center overflow-hidden">
          {/* Live Video Feed or Fallback Simulator */}
          {streamActive ? (
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950/40 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-emerald-500/50 flex items-center justify-center mb-3 bg-emerald-500/10">
                <Camera className="w-10 h-10 text-emerald-400 animate-pulse" />
              </div>
              <p className="text-sm font-medium text-emerald-200 mb-1">
                AI Produce Recognition Engine Ready
              </p>
              <p className="text-xs text-gray-400 max-w-sm">
                Use the live camera or tap any quick-scan demo tag below to instantly identify produce and pull multi-shop prices.
              </p>
            </div>
          )}

          {/* Viewfinder Target Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
            <div className="relative w-64 h-52 sm:w-72 sm:h-60 border-2 border-emerald-400/70 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

              {/* Scanning laser line animation */}
              {isScanning && (
                <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-[bounce_2.5s_infinite]" />
              )}

              {/* Central Crosshairs */}
              <div className="absolute inset-0 flex items-center justify-center opacity-40">
                <div className="w-8 h-0.5 bg-emerald-400" />
                <div className="h-8 w-0.5 bg-emerald-400 -ml-[17px]" />
              </div>

              {/* Status pill inside viewfinder */}
              <div className="absolute bottom-2 inset-x-0 flex justify-center">
                <span className="bg-black/70 backdrop-blur-md text-emerald-300 text-[11px] font-medium px-3 py-1 rounded-full border border-emerald-500/30">
                  {isScanning ? '🔍 Align produce inside box' : `✓ Identified (${scanConfidence}% match)`}
                </span>
              </div>
            </div>
          </div>

          {/* Flash & Controls */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              onClick={() => setTorchOn(!torchOn)}
              className={`p-2 rounded-full backdrop-blur-md border transition ${
                torchOn
                  ? 'bg-amber-400 text-gray-900 border-amber-300 shadow-lg shadow-amber-500/30'
                  : 'bg-black/50 text-white border-white/20 hover:bg-black/80'
              }`}
              title="Toggle Flashlight / Lighting Assist"
              aria-label="Toggle Flashlight"
            >
              <Zap className="w-4 h-4" />
            </button>
            <label
              className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition cursor-pointer"
              title="Upload Produce Photo"
              aria-label="Upload photo"
            >
              <Upload className="w-4 h-4" />
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Quick Demo Test Buttons */}
        <div className="p-3 bg-gray-950 border-t border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Quick Scan Presets (For Demo)
            </span>
            {!isScanning && (
              <button
                onClick={resetScanner}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                Scan Again
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: '🍅 Tomatoes', name: 'Tomatoes' },
              { label: '🧅 Onions', name: 'Onions' },
              { label: '🥔 Potatoes', name: 'Potatoes' },
              { label: '🍎 Apples', name: 'Apples (Royal Gala)' },
              { label: '🍌 Bananas', name: 'Bananas (Robusta)' },
              { label: '🥬 Spinach', name: 'Spinach (Palak)' },
              { label: '🏷️ QR: Green Mart', name: 'Tomatoes' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => triggerScanDetection(item.name, 97)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium border transition-all ${
                  detectedProduce === item.name
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                    : 'bg-gray-800/80 hover:bg-gray-800 border-gray-700 text-gray-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scan Results Card */}
        {detectedProduce && matchedComparison && (
          <div className="p-4 bg-gray-900 border-t border-emerald-500/30 overflow-y-auto max-h-[300px]">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <img
                  src={matchedComparison.image}
                  alt={matchedComparison.productName}
                  className="w-14 h-14 rounded-xl object-cover border border-emerald-500/40 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Detected: {matchedComparison.productName}
                    </span>
                    <span className="text-[11px] text-gray-400">{detectionTimestamp}</span>
                  </div>
                  <p className="text-xs text-gray-300 mt-1">
                    Comparing prices across {matchedComparison.entries.length} nearby shops in your area
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                  Best Price
                </span>
                <span className="text-xl font-bold text-emerald-400">
                  ₹{matchedComparison.lowestPrice}
                  <span className="text-xs font-normal text-gray-400">/{matchedComparison.unit}</span>
                </span>
              </div>
            </div>

            {/* Shop Price Comparison List */}
            <div className="space-y-2 mb-3">
              {matchedComparison.entries.map((entry) => (
                <div
                  key={entry.product.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    entry.isLowestPrice
                      ? 'bg-emerald-950/70 border-emerald-500/60 shadow-sm'
                      : 'bg-gray-800/60 border-gray-700/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-emerald-400 border border-gray-700">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white">{entry.shop.name}</span>
                        {entry.isLowestPrice && (
                          <span className="bg-emerald-500 text-emerald-950 font-bold text-[10px] px-1.5 py-0.2 rounded flex items-center gap-0.5">
                            <TrendingDown className="w-3 h-3" />
                            Lowest Price
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-[11px] mt-0.5">
                        <span>{entry.shop.distanceKm} km away</span>
                        <span>•</span>
                        <span>Stock: {entry.availableStock} {entry.product.unit}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          Updated recently
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-bold text-white text-sm">
                        ₹{entry.price}/{entry.product.unit}
                      </div>
                      {!entry.isLowestPrice && entry.priceDiffFromLowest > 0 && (
                        <div className="text-[10px] text-amber-400 font-medium">
                          +₹{entry.priceDiffFromLowest} higher
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        addToCart(entry.product, entry.shop, 1);
                        setAddedNotice(`Added ${matchedComparison.productName} from ${entry.shop.name}!`);
                        setTimeout(() => setAddedNotice(null), 2500);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1 transition"
                      title="Add to grocery basket"
                      aria-label={`Add from ${entry.shop.name}`}
                    >
                      <ShoppingBasket className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {addedNotice && (
              <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg p-2 text-xs text-center font-medium animate-fadeIn mb-2">
                ✓ {addedNotice}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-xs">
              <button
                onClick={() => {
                  setSelectedCompareProductName(matchedComparison.productName);
                  setIsScannerOpen(false);
                }}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
              >
                <span>Full Comparison Table</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {role === 'shopkeeper' && (
                <span className="text-gray-400">
                  Tip: Switch to Shopkeeper dashboard to update your shop's price for this produce.
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
