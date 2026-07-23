/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { Asset, AssetCategory } from '../types';
import { Search, ChevronDown, Globe, Briefcase, TrendingUp, Flame, BarChart3 } from 'lucide-react';

interface SmallAssetSelectorProps {
  assets: Asset[];
  currentAsset: Asset;
  setCurrentAsset: (asset: Asset) => void;
}

export default function SmallAssetSelector({
  assets,
  currentAsset,
  setCurrentAsset,
}: SmallAssetSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [category, setCategory] = useState<AssetCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredAssets = assets.filter((asset) => {
    const matchesCategory = category === 'all' || asset.category === category;
    const matchesSearch = asset.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pick some prominent "Quick Access" assets to show as 1-click pills
  const quickAccessAssets = [
    { id: 'btc-usd', label: 'BTC/USD' },
    { id: 'eth-usd', label: 'ETH/USD' },
    { id: 'eur-usd-otc', label: 'EUR/USD (OTC)' },
    { id: 'gbp-usd-otc', label: 'GBP/USD (OTC)' },
    { id: 'aapl-otc', label: 'AAPL (OTC)' },
    { id: 'tsla-otc', label: 'TSLA (OTC)' },
    { id: 'nvda-otc', label: 'NVDA (OTC)' },
  ];

  return (
    <div className="w-full bg-[#050608] border border-white/10 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 select-none" id="small-asset-selector">
      {/* Left side: Category filters and Selected Asset badge */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mr-1">Market:</div>
        
        {/* Category Buttons */}
        <div className="flex bg-white/5 p-0.5 rounded border border-white/10 flex-wrap gap-0.5">
          <button
            onClick={() => setCategory('all')}
            className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
              category === 'all' ? 'bg-white/10 text-emerald-400 font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => setCategory('crypto')}
            className={`px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1 transition-all ${
              category === 'crypto' ? 'bg-white/10 text-emerald-400 font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-2.5 h-2.5 text-amber-500" />
            <span>CRYP</span>
          </button>
          <button
            onClick={() => setCategory('otc')}
            className={`px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1 transition-all ${
              category === 'otc' ? 'bg-white/10 text-emerald-400 font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Globe className="w-2.5 h-2.5 text-emerald-500" />
            <span>OTC</span>
          </button>
          <button
            onClick={() => setCategory('stocks')}
            className={`px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1 transition-all ${
              category === 'stocks' ? 'bg-white/10 text-emerald-400 font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-2.5 h-2.5 text-blue-400" />
            <span>STK</span>
          </button>
          <button
            onClick={() => setCategory('commodities')}
            className={`px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1 transition-all ${
              category === 'commodities' ? 'bg-white/10 text-emerald-400 font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Flame className="w-2.5 h-2.5 text-orange-500" />
            <span>COMM</span>
          </button>
          <button
            onClick={() => setCategory('indices')}
            className={`px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1 transition-all ${
              category === 'indices' ? 'bg-white/10 text-emerald-400 font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-2.5 h-2.5 text-purple-400" />
            <span>INDX</span>
          </button>
        </div>

        {/* Vertical divider */}
        <div className="h-5 w-px bg-white/10 hidden md:block mx-1"></div>

        {/* Selected Asset Trigger Badge */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 rounded text-xs font-semibold text-emerald-400 transition-all shadow"
            id="current-asset-compact-trigger"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{currentAsset.name}</span>
            <span className="bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded font-mono text-[9px] font-bold">
              +{currentAsset.payoutRate}%
            </span>
            <ChevronDown className="w-3 h-3 text-emerald-400" />
          </button>

          {/* Full Dropdown Overlay */}
          {showDropdown && (
            <div className="absolute top-[115%] left-0 w-64 bg-[#0a0c10] border border-white/10 rounded shadow-2xl shadow-black/90 p-2.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150" id="small-asset-dropdown">
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-2 w-3 h-3 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded pl-7 pr-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="max-h-48 overflow-y-auto pr-1 flex flex-col gap-0.5 custom-scrollbar">
                {filteredAssets.length === 0 ? (
                  <div className="text-center py-4 text-xs text-gray-500 font-sans">No matches</div>
                ) : (
                  filteredAssets.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => {
                        setCurrentAsset(asset);
                        setShowDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left transition-all ${
                        asset.id === currentAsset.id
                          ? 'bg-white/10 text-emerald-400 font-bold'
                          : 'hover:bg-white/5 text-gray-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-1 h-1 rounded-full ${
                          asset.category === 'crypto' ? 'bg-amber-400' :
                          asset.category === 'otc' ? 'bg-emerald-400' :
                          asset.category === 'stocks' ? 'bg-blue-400' :
                          asset.category === 'commodities' ? 'bg-orange-500' :
                          asset.category === 'indices' ? 'bg-purple-400' : 'bg-gray-400'
                        }`}></div>
                        <div>
                          <div className="text-[11px] font-semibold leading-tight">{asset.name}</div>
                          <div className="text-[9px] font-mono text-gray-500">${asset.price.toFixed(asset.price > 1000 ? 1 : 2)}</div>
                        </div>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-mono font-bold px-1 py-0.2 rounded">
                        {asset.payoutRate}%
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Compact Quick Access List */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none max-w-full">
        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider hidden lg:inline mr-1">Quick:</span>
        {quickAccessAssets.map((quick) => {
          const matching = assets.find((a) => a.id === quick.id);
          if (!matching) return null;
          const isActive = matching.id === currentAsset.id;
          return (
            <button
              key={quick.id}
              onClick={() => setCurrentAsset(matching)}
              className={`px-2 py-1 text-[10px] font-sans font-medium rounded whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                  : 'bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {quick.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
