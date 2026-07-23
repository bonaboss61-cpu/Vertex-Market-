/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Asset, AssetCategory, TradeType } from '../types';
import { 
  ArrowUp, 
  ArrowDown, 
  ChevronDown, 
  Search, 
  Clock, 
  DollarSign, 
  Sparkles,
  TrendingUp,
  Globe,
  Briefcase
} from 'lucide-react';

interface OrderPanelProps {
  assets: Asset[];
  currentAsset: Asset;
  setCurrentAsset: (asset: Asset) => void;
  onPlaceTrade: (type: TradeType, amount: number, durationSeconds: number) => void;
  balance: number;
}

export default function OrderPanel({ 
  assets, 
  currentAsset, 
  setCurrentAsset, 
  onPlaceTrade, 
  balance 
}: OrderPanelProps) {
  // Trade Setup States
  const [duration, setDuration] = useState<number>(30); // Default 30s
  const [amount, setAmount] = useState<number>(100); // Default $100

  // Quick Amount presets
  const timePresets = [
    { label: '30s', val: 30 },
    { label: '1m', val: 60 },
    { label: '1.5m', val: 90 },
    { label: '2m', val: 120 },
    { label: '3m', val: 180 },
    { label: '5m', val: 300 },
  ];

  // Calculate dynamic output values
  const expectedPayout = amount * (1 + currentAsset.payoutRate / 100);
  const pureProfit = amount * (currentAsset.payoutRate / 100);

  const handleAdjustAmount = (delta: number) => {
    setAmount(prev => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > balance) return Math.max(1, Math.floor(balance));
      return next;
    });
  };

  const handleAmountPercentage = (pct: number) => {
    const next = Math.floor(balance * pct);
    setAmount(next < 1 ? 1 : next);
  };

  const handlePlaceTrade = (type: TradeType) => {
    if (amount > balance) {
      alert('Insufficient account balance to place this transaction.');
      return;
    }
    onPlaceTrade(type, amount, duration);
  };

  return (
    <div className="w-full xl:w-[320px] bg-[#0a0c10] border border-white/10 rounded-xl p-4 flex flex-col gap-4 select-none" id="vertex-order-panel">
      {/* Current Active Asset (Non-interactive indicator because asset selection is now above) */}
      <div>
        <label className="text-[10px] text-gray-500 font-mono tracking-wider uppercase mb-1.5 block">Active Asset Contract</label>
        <div className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded p-3 text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <div>
              <div className="text-white text-sm font-semibold tracking-tight">{currentAsset.name}</div>
              <div className="text-[10px] text-gray-500 font-mono font-medium uppercase tracking-wider mt-0.5">Selected above chart</div>
            </div>
          </div>
          <div className="flex items-center">
            <span className="bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold px-2 py-1 rounded">
              +{currentAsset.payoutRate}%
            </span>
          </div>
        </div>
      </div>

      <div className="h-px bg-white/5"></div>

      {/* Expiration Buffer */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Purchase Time</label>
          <span className="text-[10px] text-emerald-500 font-mono flex items-center gap-1">
            <Clock className="w-3 h-3" /> Duration: {duration}s
          </span>
        </div>
        
        {/* Presets Grid */}
        <div className="grid grid-cols-6 gap-1 mb-2">
          {timePresets.map(preset => (
            <button
              key={preset.label}
              onClick={() => setDuration(preset.val)}
              className={`py-1.5 rounded text-xs font-mono transition-all ${
                duration === preset.val 
                  ? 'bg-white/10 text-emerald-400 border border-emerald-500/30 font-bold' 
                  : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/5"></div>

      {/* Investment Size Input */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Investment Size</label>
          <span className="text-[10px] text-gray-400 font-mono">
            Balance: <span className="text-gray-300 font-medium">${balance.toLocaleString()}</span>
          </span>
        </div>
        
        {/* Dynamic increment element */}
        <div className="flex items-center bg-white/5 border border-white/10 rounded p-1 mb-2">
          <button
            onClick={() => handleAdjustAmount(-10)}
            className="w-10 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-all text-sm font-bold"
          >
            -10
          </button>
          <div className="flex-1 flex items-center justify-center font-mono font-bold text-white relative">
            <span className="absolute left-4 text-emerald-500 text-sm">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setAmount(val > balance ? Math.floor(balance) : val);
              }}
              className="w-full bg-transparent border-none text-center focus:outline-none text-sm text-white font-bold pl-8 pr-4"
            />
          </div>
          <button
            onClick={() => handleAdjustAmount(10)}
            className="w-10 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-all text-sm font-bold"
          >
            +10
          </button>
        </div>

        {/* Ratio Hotkeys */}
        <div className="grid grid-cols-4 gap-1 mb-2">
          <button
            onClick={() => handleAmountPercentage(0.1)}
            className="py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-mono text-gray-400 hover:text-white border border-white/10 transition-all"
          >
            10%
          </button>
          <button
            onClick={() => handleAmountPercentage(0.25)}
            className="py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-mono text-gray-400 hover:text-white border border-white/10 transition-all"
          >
            25%
          </button>
          <button
            onClick={() => handleAmountPercentage(0.5)}
            className="py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-mono text-gray-400 hover:text-white border border-white/10 transition-all"
          >
            50%
          </button>
          <button
            onClick={() => handleAmountPercentage(1)}
            className="py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-mono text-emerald-400 border border-emerald-500/20 transition-all font-bold"
          >
            MAX
          </button>
        </div>
      </div>

      {/* Yield Indicator Panel */}
      <div className="bg-white/5 border border-white/10 rounded p-3 flex flex-col gap-1.5 font-mono">
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>Current Asset Yield:</span>
          <span className="text-emerald-400 font-bold">+{currentAsset.payoutRate}%</span>
        </div>
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>Est. Net Profit:</span>
          <span className="text-emerald-400 font-bold">+${pureProfit.toFixed(2)}</span>
        </div>
        <div className="h-px bg-white/5 my-0.5"></div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-300 font-sans font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Payout Value:
          </span>
          <span className="text-emerald-400 font-extrabold text-base">${expectedPayout.toFixed(2)}</span>
        </div>
      </div>

      {/* Transaction Action triggers */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-2 bg-[#050608]/95 backdrop-blur border-t border-white/10 md:static md:p-0 md:bg-transparent md:border-none flex flex-row md:flex-col gap-2 mt-auto" id="order-execulators">
        {/* UP CALL BUTTON */}
        <button
          onClick={() => handlePlaceTrade('UP')}
          className="w-full flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded py-3.5 px-4 font-sans font-bold flex items-center justify-between transition-all duration-150 shadow-lg active:scale-98 relative group overflow-hidden border border-emerald-400/20"
          id="buy-btn"
        >
          {/* background shine reflection */}
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shine"></span>
          
          <div className="flex items-center gap-2">
            <div className="bg-white/15 p-1 rounded">
              <ArrowUp className="w-4 h-4 text-white" />
            </div>
            <div className="text-left leading-tight">
              <span className="block text-xs text-emerald-100 uppercase tracking-wider font-semibold">Forecast UP</span>
              <span className="text-sm font-extrabold">CALL ACTION</span>
            </div>
          </div>
          <span className="text-base font-extrabold tracking-tight bg-white/15 px-2.5 py-1 rounded font-mono">
            +{currentAsset.payoutRate}%
          </span>
        </button>

        {/* DOWN PUT BUTTON */}
        <button
          onClick={() => handlePlaceTrade('DOWN')}
          className="w-full flex-1 bg-rose-600 hover:bg-rose-500 text-white rounded py-3.5 px-4 font-sans font-bold flex items-center justify-between transition-all duration-150 shadow-lg active:scale-98 relative group overflow-hidden border border-rose-400/20"
          id="sell-btn"
        >
          {/* background shine reflection */}
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shine"></span>

          <div className="flex items-center gap-2">
            <div className="bg-white/15 p-1 rounded">
              <ArrowDown className="w-4 h-4 text-white" />
            </div>
            <div className="text-left leading-tight">
              <span className="block text-xs text-rose-100 uppercase tracking-wider font-semibold">Forecast DOWN</span>
              <span className="text-sm font-extrabold">PUT ACTION</span>
            </div>
          </div>
          <span className="text-base font-extrabold tracking-tight bg-white/15 px-2.5 py-1 rounded font-mono">
            +{currentAsset.payoutRate}%
          </span>
        </button>
      </div>
    </div>
  );
}
