/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Trade, TradeStatus } from '../types';
import { Clock, History, X, Activity, ChevronRight, ChevronDown } from 'lucide-react';

interface TopTradesTrackerProps {
  activeTrades: Trade[];
  completedTrades: Trade[];
}

interface RecentOutcome {
  id: string;
  assetName: string;
  type: 'UP' | 'DOWN';
  status: TradeStatus;
  investment: number;
  payoutAmount: number;
  profit: number;
}

export default function TopTradesTracker({ activeTrades, completedTrades }: TopTradesTrackerProps) {
  const [recentOutcomes, setRecentOutcomes] = useState<RecentOutcome[]>([]);
  const prevCompletedIdsRef = useRef<Set<string>>(new Set());

  // Load initial collapsed state from localStorage (default to false / open)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('vertex_trades_tracker_collapsed');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  // Track if any active trade exists so we can pulse the collapsed badge
  const hasActiveTrades = activeTrades.length > 0;

  // Initialize previous completed IDs on first render
  useEffect(() => {
    prevCompletedIdsRef.current = new Set(completedTrades.map((t) => t.id));
  }, []);

  // Monitor completedTrades to detect newly settled trades
  useEffect(() => {
    const currentIds = completedTrades.map((t) => t.id);
    const newlySettled = completedTrades.filter((t) => !prevCompletedIdsRef.current.has(t.id));

    if (newlySettled.length > 0) {
      newlySettled.forEach((trade) => {
        const profitValue = (trade.payoutAmount || 0) - trade.investment;
        const outcome: RecentOutcome = {
          id: trade.id,
          assetName: trade.assetName,
          type: trade.type,
          status: trade.status || 'LOST',
          investment: trade.investment,
          payoutAmount: trade.payoutAmount || 0,
          profit: profitValue,
        };

        // Add to temporary outcomes list
        setRecentOutcomes((prev) => [...prev, outcome]);

        // If collapsed, temporarily auto-expand for 2 seconds to show the outcome
        const wasCollapsed = isCollapsed;
        if (wasCollapsed) {
          setIsCollapsed(false);
        }

        // Automatically remove outcome and restore collapsed state after 2 seconds
        setTimeout(() => {
          setRecentOutcomes((prev) => prev.filter((item) => item.id !== trade.id));
          if (wasCollapsed) {
            setIsCollapsed(true);
          }
        }, 2000);
      });
    }

    // Keep reference updated
    prevCompletedIdsRef.current = new Set(currentIds);
  }, [completedTrades, isCollapsed]);

  const toggleCollapsed = () => {
    setIsCollapsed((prev: boolean) => {
      const next = !prev;
      try {
        localStorage.setItem('vertex_trades_tracker_collapsed', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Render last 3 completed trades for the mini-history section
  const miniHistory = completedTrades.slice(0, 3);

  // If collapsed, render as a tiny, sleek, non-intrusive option bar right above the chart area
  if (isCollapsed) {
    return (
      <div className="w-full flex items-center justify-between bg-[#050608] hover:bg-[#080a0f] border border-white/10 rounded-xl px-3.5 py-1.5 select-none transition-all duration-200" id="top-trades-tracker-collapsed">
        <button
          onClick={toggleCollapsed}
          className="flex items-center gap-2 text-left focus:outline-none group flex-1"
          title="Click to expand Execution Monitor"
        >
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${hasActiveTrades ? 'bg-emerald-400' : 'bg-gray-500'}`}></span>
            <span className={`relative inline-block rounded-full h-2 w-2 ${hasActiveTrades ? 'bg-emerald-400' : 'bg-gray-500'}`}></span>
          </span>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest group-hover:text-emerald-400 transition-colors">
              EXECUTION MONITOR
            </span>
            <span className="text-[9px] font-mono text-gray-600">|</span>
            <span className="text-[10px] font-sans text-gray-500 group-hover:text-gray-300 transition-colors">
              {activeTrades.length > 0 
                ? `${activeTrades.length} positions currently active` 
                : 'No active positions'}
            </span>
          </div>
        </button>

        <div className="flex items-center gap-3">
          {/* Quick inline mini-history pill when collapsed */}
          {miniHistory.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 bg-white/5 border border-white/5 rounded px-2 py-0.5 text-[9px] font-mono text-gray-500">
              <span className="uppercase tracking-wider">Feed:</span>
              {miniHistory.slice(0, 1).map((trade) => {
                const isWin = trade.status === 'WON';
                const isDraw = trade.status === 'DRAW';
                return (
                  <span key={trade.id} className={isWin ? 'text-emerald-400' : isDraw ? 'text-gray-400' : 'text-rose-400'}>
                    {trade.assetName} {isWin ? `+$${(trade.payoutAmount || 0).toFixed(0)}` : isDraw ? 'DRAW' : '-0'}
                  </span>
                );
              })}
            </div>
          )}

          <button
            onClick={toggleCollapsed}
            className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 border border-emerald-500/20 rounded transition-all"
          >
            <span>OPEN MONITOR</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#050608] border border-white/10 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none min-h-[58px] relative transition-all duration-300" id="top-trades-tracker">
      {/* Left side: Active Trades & Live Countdown List */}
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">Live Execution Monitor</span>
          {activeTrades.length > 0 && (
            <span className="bg-emerald-500/15 text-emerald-400 font-mono text-[9px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
              {activeTrades.length} ACTIVE
            </span>
          )}
        </div>

        {activeTrades.length === 0 && recentOutcomes.length === 0 ? (
          <div className="text-[11px] text-gray-500 font-sans italic pl-1 flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-600"></span>
            <span>No active options contracts open. Place UP or DOWN position.</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 items-center">
            {/* Active countdown cards */}
            {activeTrades.map((trade) => {
              const remaining = Math.max(0, Math.ceil((trade.expirationTime - Date.now()) / 1000));
              const isCall = trade.type === 'UP';
              const isCritical = remaining <= 5;

              // Security boundary to double ensure if ticked past 0 but state hasn't updated, we don't display a negative/stale bar
              if (remaining <= 0) return null;

              return (
                <div
                  key={trade.id}
                  className={`flex items-center gap-2 px-2.5 py-1 bg-white/5 border rounded transition-all duration-300 ${
                    isCritical ? 'border-red-500 bg-red-950/10' : 'border-white/10'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isCall ? 'bg-emerald-500 animate-ping' : 'bg-rose-500 animate-ping'}`}></span>
                  <span className="text-[11px] font-semibold text-white">{trade.assetName}</span>
                  <span className={`text-[10px] font-mono font-bold uppercase px-1 rounded ${
                    isCall ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {trade.type}
                  </span>
                  
                  {/* Countdown Timer with special red formatting < 5s */}
                  <span className={`font-mono transition-all ${
                    isCritical ? 'text-red-500 text-[10px] font-bold animate-pulse' : 'text-emerald-400 text-[11px]'
                  }`}>
                    {remaining}s left
                  </span>
                </div>
              );
            })}

            {/* Instant temporary outcome cards - last exactly 2 seconds */}
            {recentOutcomes.map((outcome) => {
              const isWin = outcome.status === 'WON';
              const isDraw = outcome.status === 'DRAW';
              const isLoss = outcome.status === 'LOST';

              return (
                <div
                  key={outcome.id}
                  className={`flex items-center gap-2 px-2.5 py-1 rounded border animate-in zoom-in-95 slide-in-from-top-1 duration-150 ${
                    isWin ? 'bg-emerald-950/20 border-emerald-500 text-emerald-400 font-bold' :
                    isDraw ? 'bg-gray-900 border-gray-500 text-gray-400' :
                    'bg-rose-950/20 border-rose-500 text-rose-500 font-bold'
                  }`}
                >
                  <span className="text-[11px] uppercase tracking-wide">{outcome.assetName}</span>
                  <span className="text-[10px] opacity-75">settled:</span>
                  <span className="font-mono text-xs">
                    {isWin && `+$${outcome.payoutAmount.toFixed(2)}`}
                    {isDraw && `+$0.00 (REFUND)`}
                    {isLoss && `-0`}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right side: Compact mini-history feed */}
      <div className="flex flex-col gap-1.5 shrink-0 max-w-full md:max-w-xs border-t md:border-t-0 md:border-l border-white/10 pt-2.5 md:pt-0 md:pl-4 pr-6">
        <div className="flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">Ledger Feed</span>
        </div>

        {miniHistory.length === 0 ? (
          <span className="text-[10px] text-gray-500 font-mono">No positions settled yet.</span>
        ) : (
          <div className="flex gap-2 items-center overflow-x-auto scrollbar-none">
            {miniHistory.map((trade) => {
              const isWin = trade.status === 'WON';
              const isDraw = trade.status === 'DRAW';
              return (
                <div
                  key={trade.id}
                  className="bg-white/5 border border-white/5 rounded px-1.5 py-0.5 flex items-center gap-1 text-[10px] font-sans whitespace-nowrap"
                >
                  <span className="text-gray-400">{trade.assetName}</span>
                  <span className={`font-mono font-bold ${
                    isWin ? 'text-emerald-400' : isDraw ? 'text-gray-400' : 'text-rose-400'
                  }`}>
                    {isWin ? `+$${(trade.payoutAmount || 0).toFixed(0)}` : isDraw ? 'DRAW' : '-0'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Close button inside expanded view on the top-right */}
      <button
        onClick={toggleCollapsed}
        className="absolute top-2 right-2 text-gray-500 hover:text-white p-1 hover:bg-white/5 rounded-md transition-colors"
        title="Minimize Monitor"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
