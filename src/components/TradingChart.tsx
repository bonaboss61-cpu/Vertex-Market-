/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Candlestick, Trade, Asset } from '../types';
import { 
  Eye, Settings, BarChart2, TrendingUp, HelpCircle, Move, RotateCcw, 
  Trash2, Plus, Play, ChevronLeft, ChevronRight, Check, Award, Info, 
  Sparkles, Sliders, Layers, BookOpen, Volume2, VolumeX, Clock, Pencil, Maximize, Minimize, Bell
} from 'lucide-react';

interface TradingChartProps {
  asset: Asset;
  history: Candlestick[];
  activeTrades: Trade[];
  completedTrades?: Trade[];
}

// Indicator configurations type definition
interface IndicatorConfig {
  active: boolean;
  period: number;
  color: string;
}

interface BBandsConfig {
  active: boolean;
  period: number;
  dev: number;
  color: string;
}

interface RsiConfig {
  active: boolean;
  period: number;
  overbought: number;
  oversold: number;
  color: string;
}

interface MacdConfig {
  active: boolean;
  fast: number;
  slow: number;
  signal: number;
  macdColor: string;
  signalColor: string;
}

interface StochConfig {
  active: boolean;
  kPeriod: number;
  dPeriod: number;
  overbought: number;
  oversold: number;
  color: string;
}

interface SarConfig {
  active: boolean;
  af: number;
  maxAf: number;
  color: string;
}

// Browser-native Web Audio effects synthesizer
const playSimulatorSound = (type: 'WIN' | 'LOSS' | 'CLICK' | 'PLACE') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'CLICK') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'PLACE') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(380, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(760, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.17);
    } else if (type === 'WIN') {
      const now = ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.45);
      osc.start();
      osc.stop(now + 0.5);
    } else if (type === 'LOSS') {
      const now = ctx.currentTime;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(196.00, now); // G3
      osc.frequency.exponentialRampToValueAtTime(98.00, now + 0.28); // G2
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.32);
      osc.start();
      osc.stop(now + 0.35);
    }
  } catch (e) {
    // Silently handle web audio blocks
  }
};

// Math helpers for Technical Indicators
const calculateEMAArray = (prices: number[], period: number): number[] => {
  const ema: number[] = [];
  if (prices.length === 0) return [];
  const k = 2 / (period + 1);
  let prevEma = prices[0];
  ema.push(prevEma);
  for (let i = 1; i < prices.length; i++) {
    const currentEma = prices[i] * k + prevEma * (1 - k);
    ema.push(currentEma);
    prevEma = currentEma;
  }
  return ema;
};

const calculateRSIArray = (data: Candlestick[], period: number): number[] => {
  const rsi: number[] = [];
  if (data.length === 0) return [];
  
  for (let i = 0; i < Math.min(data.length, period); i++) {
    rsi.push(50);
  }

  let gainsSum = 0;
  let lossesSum = 0;

  for (let i = 1; i <= period; i++) {
    if (i >= data.length) break;
    const diff = data[i].close - data[i - 1].close;
    if (diff > 0) gainsSum += diff;
    else lossesSum -= diff;
  }

  let avgGain = gainsSum / period;
  let avgLoss = lossesSum / period;
  
  if (data.length > period) {
    const firstRs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi[period] = 100 - 100 / (1 + firstRs);

    for (let i = period + 1; i < data.length; i++) {
      const diff = data[i].close - data[i - 1].close;
      const gain = diff > 0 ? diff : 0;
      const loss = diff < 0 ? -diff : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;

      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(100 - 100 / (1 + rs));
    }
  }

  return rsi;
};

const calculateMACDArray = (data: Candlestick[], fastPeriod: number, slowPeriod: number, signalPeriod: number) => {
  const prices = data.map(c => c.close);
  const emaFast = calculateEMAArray(prices, fastPeriod);
  const emaSlow = calculateEMAArray(prices, slowPeriod);
  const macdLine: number[] = [];
  
  for (let i = 0; i < prices.length; i++) {
    macdLine.push((emaFast[i] || 0) - (emaSlow[i] || 0));
  }

  const signalLine: number[] = [];
  if (macdLine.length > 0) {
    const k = 2 / (signalPeriod + 1);
    let prevSignal = macdLine[0];
    signalLine.push(prevSignal);
    for (let i = 1; i < macdLine.length; i++) {
      const currentSignal = macdLine[i] * k + prevSignal * (1 - k);
      signalLine.push(currentSignal);
      prevSignal = currentSignal;
    }
  }

  const histogram: number[] = [];
  for (let i = 0; i < macdLine.length; i++) {
    histogram.push(macdLine[i] - (signalLine[i] || 0));
  }

  return { macdLine, signalLine, histogram };
};

const calculateStochasticArray = (data: Candlestick[], kPeriod: number, dPeriod: number) => {
  const kValues: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < kPeriod - 1) {
      kValues.push(50);
    } else {
      const slice = data.slice(i - kPeriod + 1, i + 1);
      const highs = slice.map(c => c.high);
      const lows = slice.map(c => c.low);
      const highestHigh = Math.max(...highs);
      const lowestLow = Math.min(...lows);
      
      const range = highestHigh - lowestLow || 1;
      const k = (100 * (data[i].close - lowestLow)) / range;
      kValues.push(k);
    }
  }

  const dValues: number[] = [];
  for (let i = 0; i < kValues.length; i++) {
    if (i < dPeriod - 1) {
      dValues.push(50);
    } else {
      const slice = kValues.slice(i - dPeriod + 1, i + 1);
      const avg = slice.reduce((a, b) => a + b, 0) / dPeriod;
      dValues.push(avg);
    }
  }

  return { kValues, dValues };
};

const calculateSARArray = (data: Candlestick[], afStep: number = 0.02, afMax: number = 0.2): number[] => {
  const sar: number[] = [];
  if (data.length === 0) return [];
  
  let isBull = true;
  let currentSAR = data[0].low;
  let ep = data[0].high;
  let af = afStep;
  
  sar.push(currentSAR);
  
  for (let i = 1; i < data.length; i++) {
    const prevSAR = currentSAR;
    let nextSAR = prevSAR + af * (ep - prevSAR);
    
    if (isBull) {
      const low1 = data[i-1].low;
      const low2 = i > 1 ? data[i-2].low : low1;
      nextSAR = Math.min(nextSAR, low1, low2);
      
      if (data[i].low < nextSAR) {
        isBull = false;
        nextSAR = ep;
        ep = data[i].low;
        af = afStep;
      } else {
        if (data[i].high > ep) {
          ep = data[i].high;
          af = Math.min(af + afStep, afMax);
        }
      }
    } else {
      const high1 = data[i-1].high;
      const high2 = i > 1 ? data[i-2].high : high1;
      nextSAR = Math.max(nextSAR, high1, high2);
      
      if (data[i].high > nextSAR) {
        isBull = true;
        nextSAR = ep;
        ep = data[i].high;
        af = afStep;
      } else {
        if (data[i].low < ep) {
          ep = data[i].low;
          af = Math.min(af + afStep, afMax);
        }
      }
    }
    
    currentSAR = nextSAR;
    sar.push(currentSAR);
  }
  return sar;
};

export default function TradingChart({ asset, history, activeTrades, completedTrades = [] }: TradingChartProps) {
  // Advanced Unified Technical Indicator Configurations
  const [indicators, setIndicators] = useState({
    sma: { active: false, period: 15, color: '#f59e0b' }, // Amber
    ema: { active: false, period: 25, color: '#06b6d4' }, // Cyan
    bands: { active: false, period: 15, dev: 1.8, color: '#a855f7' }, // Purple
    rsi: { active: false, period: 14, overbought: 70, oversold: 30, color: '#ec4899' }, // Pink
    macd: { active: false, fast: 12, slow: 26, signal: 9, macdColor: '#3b82f6', signalColor: '#ef4444' }, // Blue & Red
    stoch: { active: false, kPeriod: 14, dPeriod: 3, overbought: 80, oversold: 20, color: '#10b981' }, // Emerald
    sar: { active: false, af: 0.02, maxAf: 0.2, color: '#f43f5e' } // Rose
  });



  // Backward-compatible derivations
  const showSMA = indicators.sma.active;
  const showBands = indicators.bands.active;
  const showRSI = indicators.rsi.active;

  const [chartType, setChartType] = useState<'candle' | 'line' | 'bar'>('candle');
  const [timeframe, setTimeframe] = useState<string>('M1');
  const MT5_TIMEFRAMES = ['1s', '1m', '5m', '15m', '1H', '4H', '1D', '1W'];
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);


  // Dragging and scroll back offsets
  const [scrollOffset, setScrollOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [dragStartScrollOffset, setDragStartScrollOffset] = useState<number>(0);
  const [mousePos, setMousePos] = useState<{x: number, y: number} | null>(null);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Zoom control
  const [visibleCount, setVisibleCount] = useState<number>(45);

  // Drawing Tools State
  // Price Alerts State
  const [alertMode, setAlertMode] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<{ id: string; price: number; triggered: boolean }[]>([]);
  const [cursorPrice, setCursorPrice] = useState<number | null>(null);

  const [drawingMode, setDrawingMode] = useState<'trend' | 'horizontal' | 'vertical' | 'fibonacci' | null>(null);
  const [drawings, setDrawings] = useState<{ id: string; type: 'trend' | 'horizontal' | 'vertical' | 'fibonacci'; start: { time: number; price: number }, end: { time: number; price: number } }[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<{ id: string; type: 'trend' | 'horizontal' | 'vertical' | 'fibonacci'; start: { time: number; price: number }, end?: { time: number; price: number } } | null>(null);

  const handleZoomIn = () => {
    setVisibleCount(prev => Math.max(15, prev - 10));
    playClick();
  };

  // Handle triggering price alerts
  useEffect(() => {
    if (alerts.length === 0) return;
    setAlerts(prev => prev.map(alert => {
      if (alert.triggered) return alert;
      // Trigger if current price crosses or is very close (0.1% tolerance)
      const diff = Math.abs(asset.price - alert.price) / alert.price;
      if (diff < 0.001 || 
         (history.length > 1 && 
          ((history[0].open < alert.price && asset.price >= alert.price) || 
           (history[0].open > alert.price && asset.price <= alert.price)))) {
        // Ideally we would show a toast here, but we'll just mark it triggered
        return { ...alert, triggered: true };
      }
      return alert;
    }));
  }, [asset.price, history, alerts]);

  const handleZoomOut = () => {
    setVisibleCount(prev => Math.min(150, prev + 10));
    playClick();
  };

  // Advanced Overlay Sidebar Control Drawer
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [sidebarTab, setSidebarTab] = useState<'indicators' | 'tutorials' | 'objects'>('indicators');
  const [activeTutorial, setActiveTutorial] = useState<string | null>(null);

  // Interactive Live Academy Simulator State
  const [simState, setSimState] = useState<'IDLE' | 'BULLISH' | 'BEARISH'>('IDLE');
  const [simCandles, setSimCandles] = useState<Candlestick[]>([]);
  const [simActiveOption, setSimActiveOption] = useState<{
    type: 'UP' | 'DOWN';
    strike: number;
    timer: number;
    entryIndex: number;
  } | null>(null);
  const [simMessage, setSimMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Reset scroll back to live if asset changes
  useEffect(() => {
    setScrollOffset(0);
  }, [asset.id]);

  // Handle click sound on user action
  const playClick = () => playSimulatorSound('CLICK');

  // Initialize Simulator mock candles
  const initSimulator = (trendType: 'UP' | 'DOWN' | 'NORMAL' = 'NORMAL') => {
    const basePrice = 100;
    const generated: Candlestick[] = [];
    let currentPrice = basePrice;
    const now = Date.now();
    for (let i = 0; i < 20; i++) {
      const change = (Math.random() - (trendType === 'UP' ? 0.42 : trendType === 'DOWN' ? 0.58 : 0.5)) * 2;
      const open = currentPrice;
      const close = currentPrice + change;
      const high = Math.max(open, close) + Math.random() * 0.8;
      const low = Math.min(open, close) - Math.random() * 0.8;
      generated.push({
        time: now - (20 - i) * 5000,
        open,
        high,
        low,
        close
      });
      currentPrice = close;
    }
    setSimCandles(generated);
    setSimActiveOption(null);
    setSimMessage(null);
  };

  // Run the tutorial interactive candles loop
  useEffect(() => {
    if (!activeTutorial) return;
    initSimulator();

    const interval = setInterval(() => {
      setSimCandles(prev => {
        if (prev.length === 0) return prev;
        const next = [...prev];
        const lastIndex = next.length - 1;
        const lastCandle = next[lastIndex];

        // Tick simulation - update last candle close
        let bias = 0;
        if (simState === 'BULLISH') bias = 0.45;
        if (simState === 'BEARISH') bias = -0.45;

        const change = (Math.random() - 0.5 + bias) * 0.5;
        const newClose = lastCandle.close + change;
        
        lastCandle.close = newClose;
        lastCandle.high = Math.max(lastCandle.high, newClose);
        lastCandle.low = Math.min(lastCandle.low, newClose);

        // Every 3.6 seconds, close the candle and start a new one
        const rand = Math.random();
        if (rand > 0.72) {
          const nextOpen = lastCandle.close;
          const nextCandleChange = (Math.random() - 0.5 + bias) * 1.5;
          const nextClose = nextOpen + nextCandleChange;
          next.shift(); // keep array length constant
          next.push({
            time: Date.now(),
            open: nextOpen,
            high: Math.max(nextOpen, nextClose) + Math.random() * 0.6,
            low: Math.min(nextOpen, nextClose) - Math.random() * 0.6,
            close: nextClose
          });
        }
        return next;
      });

      // Advance mock timer if an active trade is running in simulator
      setSimActiveOption(prevOpt => {
        if (!prevOpt) return null;
        if (prevOpt.timer <= 1) {
          // Resolve mock trade
          const finalPrice = simCandles[simCandles.length - 1]?.close || 100;
          const isWin = prevOpt.type === 'UP' ? finalPrice > prevOpt.strike : finalPrice < prevOpt.strike;
          
          if (isWin) {
            playSimulatorSound('WIN');
            setSimMessage({
              text: `SUCCESS! Strike: $${prevOpt.strike.toFixed(2)}, Settlement: $${finalPrice.toFixed(2)}. Payout +$92.00! Excellent strategy execution.`,
              success: true
            });
          } else {
            playSimulatorSound('LOSS');
            setSimMessage({
              text: `LOSS. Strike: $${prevOpt.strike.toFixed(2)}, Settlement: $${finalPrice.toFixed(2)}. The trend reversed. Review parameters and try again!`,
              success: false
            });
          }
          setSimState('IDLE');
          return null;
        }
        return { ...prevOpt, timer: prevOpt.timer - 1 };
      });

    }, 1200);

    return () => clearInterval(interval);
  }, [activeTutorial, simState]);

  const displayHistory = useMemo(() => {
    let groupSize = 1;
    // Base candle is 1 minute (MT5 M1)
    if (timeframe === 'M1') groupSize = 1;
    if (timeframe === 'M5') groupSize = 5;
    if (timeframe === 'M15') groupSize = 15;
    if (timeframe === 'M30') groupSize = 30;
    if (timeframe === 'H1') groupSize = 60;
    if (timeframe === 'H4') groupSize = 240;
    if (timeframe === 'D1') groupSize = 1440;
    if (timeframe === 'W1') groupSize = 10080;
    if (timeframe === 'MN') groupSize = 43200;

    if (groupSize === 1) return history;

    const result: Candlestick[] = [];
    for (let i = 0; i < history.length; i += groupSize) {
      const slice = history.slice(i, i + groupSize);
      result.push({
        time: slice[0].time,
        open: slice[0].open,
        high: Math.max(...slice.map(c => c.high)),
        low: Math.min(...slice.map(c => c.low)),
        close: slice[slice.length - 1].close,
      });
    }
    return result;
  }, [history, timeframe]);

  if (!displayHistory || displayHistory.length === 0) {
    return (
      <div className="flex-1 bg-[#090d16] flex items-center justify-center border border-[#141b2a] rounded-xl" id="trading-chart-loading">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-cyan-500 border-r-cyan-500/30 border-b-cyan-500/10 border-l-cyan-500/20 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400 font-sans text-sm font-medium">Synchronizing with liquidity providers...</p>
        </div>
      </div>
    );
  }

  // Dimension parameters
  const paddingRight = 80;
  const paddingTop = 30;
  const paddingBottom = 20;
  const chartHeight = 280;
  const rsiHeight = 80;
  const width = 800;

  // Dynamic visual styling depending on asset category
  const getCategoryStyles = () => {
    switch (asset.category) {
      case 'crypto':
        return {
          primaryColor: '#f59e0b', // Amber / Gold
          glowColor: 'rgba(245, 158, 11, 0.25)',
          glowId: 'areaGlowCrypto',
        };
      case 'otc':
        return {
          primaryColor: '#10b981', // Emerald
          glowColor: 'rgba(16, 185, 129, 0.25)',
          glowId: 'areaGlowOtc',
        };
      case 'stocks':
        return {
          primaryColor: '#3b82f6', // Electric Blue
          glowColor: 'rgba(59, 130, 246, 0.25)',
          glowId: 'areaGlowStocks',
        };
      case 'commodities':
        return {
          primaryColor: '#f97316', // Orange / Bronze
          glowColor: 'rgba(249, 115, 22, 0.25)',
          glowId: 'areaGlowCommodities',
        };
      case 'indices':
        return {
          primaryColor: '#a855f7', // Purple / Violet
          glowColor: 'rgba(168, 85, 247, 0.25)',
          glowId: 'areaGlowIndices',
        };
      default:
        return {
          primaryColor: '#10b981',
          glowColor: 'rgba(16, 185, 129, 0.25)',
          glowId: 'areaGlowDefault',
        };
    }
  };

  const catStyle = getCategoryStyles();

  // Window size of visible candles
  const maxScroll = Math.max(0, displayHistory.length - visibleCount);
  const clampedScrollOffset = Math.min(scrollOffset, maxScroll);

  let visibleHistory = displayHistory;
  let startIndex = 0;
  let endIndex = displayHistory.length;

  if (displayHistory.length > visibleCount) {
    endIndex = displayHistory.length - clampedScrollOffset;
    startIndex = endIndex - visibleCount;
    visibleHistory = displayHistory.slice(startIndex, endIndex);
  }

  // Compute boundaries for the main price chart
  const visiblePriceList = visibleHistory.map(c => [c.open, c.close, c.high, c.low]).flat();
  const activeTradePrices = activeTrades
    .filter(t => t.assetId === asset.id && t.status === 'ACTIVE')
    .map(t => t.strikePrice);
  
  const allPrices = [...visiblePriceList];
  if (clampedScrollOffset === 0) {
    allPrices.push(asset.price);
    if (activeTradePrices.length > 0) {
      allPrices.push(...activeTradePrices);
    }
  }
  
  let maxPrice = Math.max(...allPrices);
  let minPrice = Math.min(...allPrices);
  const priceRange = maxPrice - minPrice;
  
  maxPrice += priceRange * 0.1;
  minPrice -= priceRange * 0.1;
  const adjustedPriceRange = maxPrice - minPrice || 1;

  // Coordinate mappings
  const getX = (indexInWindow: number) => {
    const offset = Math.max(0, visibleCount - visibleHistory.length);
    return ((indexInWindow + offset) / Math.max(1, visibleCount - 1)) * (width - paddingRight);
  };

  const getY = (price: number) => {
    return chartHeight - ((price - minPrice) / adjustedPriceRange) * (chartHeight - paddingTop - paddingBottom) - paddingBottom;
  };

  const getPriceFromY = (y: number) => {
    return minPrice + ((chartHeight - y - paddingBottom) / (chartHeight - paddingTop - paddingBottom)) * adjustedPriceRange;
  };

  const getTimeFromX = (x: number) => {
    if (visibleHistory.length < 2) return 0;
    // Calculate based on index instead
    const fraction = x / (width - paddingRight);
    const floatIndex = fraction * (visibleCount - 1) - Math.max(0, visibleCount - visibleHistory.length);
    
    if (floatIndex <= 0) return visibleHistory[0].time;
    if (floatIndex >= visibleHistory.length - 1) return visibleHistory[visibleHistory.length - 1].time;
    
    const lower = Math.floor(floatIndex);
    const upper = Math.ceil(floatIndex);
    const rem = floatIndex - lower;
    
    const t1 = visibleHistory[lower]?.time || 0;
    const t2 = visibleHistory[upper]?.time || 0;
    return t1 + (t2 - t1) * rem;
  };

  const getXForTime = (time: number) => {
    if (visibleHistory.length < 2) return -1;
    // Find index
    let exactIndex = -1;
    for (let i = 0; i < visibleHistory.length - 1; i++) {
      if (time >= visibleHistory[i].time && time <= visibleHistory[i+1].time) {
        const t1 = visibleHistory[i].time;
        const t2 = visibleHistory[i+1].time;
        exactIndex = i + (time - t1) / (t2 - t1);
        break;
      }
    }
    if (exactIndex === -1) {
      if (time < visibleHistory[0].time) exactIndex = -1;
      if (time > visibleHistory[visibleHistory.length - 1].time) exactIndex = visibleHistory.length;
    }
    return getX(exactIndex);
  };

  // Dragging handlers
  const getClientCoords = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    return { clientX: (e as React.MouseEvent).clientX, clientY: (e as React.MouseEvent).clientY };
  };

  const getMouseCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const svg = (e.currentTarget as Element).tagName === 'svg' ? e.currentTarget : (e.currentTarget as Element).querySelector('svg') || e.currentTarget;
    const rect = (svg as Element).getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = chartHeight / rect.height;
    const { clientX, clientY } = getClientCoords(e);
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (alertMode) {
      const coords = getMouseCoords(e);
      const price = getPriceFromY(coords.y);
      setAlerts(prev => [...prev, { id: Date.now().toString(), price, triggered: false }]);
      setAlertMode(false);
      setCursorPrice(null);
      return;
    }
    if (drawingMode) {
      const coords = getMouseCoords(e);
      const time = getTimeFromX(coords.x);
      const price = getPriceFromY(coords.y);
      if (drawingMode === 'horizontal') {
        setDrawings(prev => [...prev, { id: Date.now().toString(), type: 'horizontal', start: { time, price }, end: { time, price } }]);
        setDrawingMode(null);
      } else if (drawingMode === 'vertical') {
        setDrawings(prev => [...prev, { id: Date.now().toString(), type: 'vertical', start: { time, price }, end: { time, price } }]);
        setDrawingMode(null);
      } else if (drawingMode === 'fibonacci') {
        setCurrentDrawing({ id: Date.now().toString(), type: 'fibonacci', start: { time, price } });
      } else {
        setCurrentDrawing({ id: Date.now().toString(), type: 'trend', start: { time, price } });
      }
      return;
    }
    setIsDragging(true);
    setDragStartX(getClientCoords(e).clientX);
    setDragStartScrollOffset(clampedScrollOffset);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getMouseCoords(e);
    setMousePos(coords);
    if (alertMode) {
      setCursorPrice(getPriceFromY(coords.y));
    } else if (cursorPrice !== null) {
      setCursorPrice(null);
    }
    if (drawingMode && currentDrawing) {
      const time = getTimeFromX(coords.x);
      const price = getPriceFromY(coords.y);
      setCurrentDrawing({ ...currentDrawing, end: { time, price } });
      return;
    }
    if (!isDragging) return;
    const dx = getClientCoords(e).clientX - dragStartX;
    // Base shift off standard scale to be consistent regardless of actual pixel width
    const svg = (e.currentTarget as Element).tagName === 'svg' ? e.currentTarget : (e.currentTarget as Element).querySelector('svg') || e.currentTarget;
    const rect = (svg as Element).getBoundingClientRect();
    const actualPixelsPerCandle = (rect.width * ((width - paddingRight) / width)) / visibleCount;
    
    // Scale shift correctly so 1 visual candle dragged = 1 candle shifted
    const candleShift = Math.round(dx / actualPixelsPerCandle);
    const newOffset = dragStartScrollOffset + candleShift;
    setScrollOffset(Math.max(0, Math.min(newOffset, maxScroll)));
  };

  const handleMouseLeave = (e: React.MouseEvent | React.TouchEvent) => {
    setCursorPrice(null);
    setMousePos(null);
    handleMouseUp(e);
  };

  const handleMouseUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (drawingMode && currentDrawing) {
      if (currentDrawing.end) {
        setDrawings(prev => [...prev, currentDrawing as any]);
      }
      setCurrentDrawing(null);
      setDrawingMode(null); // Auto exit drawing mode after one line
      return;
    }
    setIsDragging(false);
  };

  // Dynamic Technical Indicators calculations (Stable buffer offset algorithm)
  // 1. SMA (Simple Moving Average)
  const smaPeriod = indicators.sma.period;
  const smaPoints: { x: number; y: number }[] = [];
  for (let i = 0; i < visibleHistory.length; i++) {
    const originalIndex = startIndex + i;
    if (originalIndex >= smaPeriod - 1) {
      const slice = displayHistory.slice(originalIndex - smaPeriod + 1, originalIndex + 1);
      const sum = slice.reduce((acc, c) => acc + c.close, 0);
      const avg = sum / smaPeriod;
      smaPoints.push({ x: getX(i), y: getY(avg) });
    }
  }

  // 2. EMA (Exponential Moving Average)
  const emaPeriod = indicators.ema.period;
  const emaValues = calculateEMAArray(displayHistory.map(c => c.close), emaPeriod);
  const emaPoints: { x: number; y: number }[] = [];
  for (let i = 0; i < visibleHistory.length; i++) {
    const originalIndex = startIndex + i;
    if (originalIndex >= emaPeriod - 1 && emaValues[originalIndex] !== undefined) {
      emaPoints.push({ x: getX(i), y: getY(emaValues[originalIndex]) });
    }
  }

  // 3. Bollinger Bands (Customisable period & deviation multiplier)
  const bandPeriod = indicators.bands.period;
  const devMultiplier = indicators.bands.dev;
  const bbUpperPoints: { x: number; y: number }[] = [];
  const bbLowerPoints: { x: number; y: number }[] = [];
  const bbMiddlePoints: { x: number; y: number }[] = [];

  for (let i = 0; i < visibleHistory.length; i++) {
    const originalIndex = startIndex + i;
    if (originalIndex >= bandPeriod - 1) {
      const slice = displayHistory.slice(originalIndex - bandPeriod + 1, originalIndex + 1);
      const closePrices = slice.map(c => c.close);
      const avg = closePrices.reduce((a, b) => a + b, 0) / bandPeriod;
      
      const variance = closePrices.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / bandPeriod;
      const stdDev = Math.sqrt(variance);

      bbUpperPoints.push({ x: getX(i), y: getY(avg + stdDev * devMultiplier) });
      bbLowerPoints.push({ x: getX(i), y: getY(avg - stdDev * devMultiplier) });
      bbMiddlePoints.push({ x: getX(i), y: getY(avg) });
    }
  }

  // 4. Wilder's High-Fidelity RSI Index
  const rsiValues = calculateRSIArray(displayHistory, indicators.rsi.period);
  const getRsiY = (rsiVal: number) => {
    const topMargin = 10;
    const bottomMargin = 10;
    return rsiHeight - ((rsiVal / 100) * (rsiHeight - topMargin - bottomMargin)) - bottomMargin;
  };

  // 5. Moving Average Convergence Divergence (MACD 12, 26, 9)
  const { macdLine, signalLine, histogram } = calculateMACDArray(
    displayHistory,
    indicators.macd.fast,
    indicators.macd.slow,
    indicators.macd.signal
  );
  
  const macdVisible: { x: number; macdVal: number; signalVal: number; histVal: number }[] = [];
  for (let i = 0; i < visibleHistory.length; i++) {
    const originalIndex = startIndex + i;
    macdVisible.push({
      x: getX(i),
      macdVal: macdLine[originalIndex] || 0,
      signalVal: signalLine[originalIndex] || 0,
      histVal: histogram[originalIndex] || 0
    });
  }

  const macdValuesList = macdVisible.map(m => [m.macdVal, m.signalVal, m.histVal]).flat();
  let maxMacd = Math.max(...macdValuesList);
  let minMacd = Math.min(...macdValuesList);
  const macdRange = maxMacd - minMacd || 1;
  maxMacd += macdRange * 0.1;
  minMacd -= macdRange * 0.1;
  const adjustedMacdRange = maxMacd - minMacd;

  const getMacdY = (val: number) => {
    const topMargin = 10;
    const bottomMargin = 10;
    return rsiHeight - ((val - minMacd) / adjustedMacdRange) * (rsiHeight - topMargin - bottomMargin) - bottomMargin;
  };

  // 6. Stochastic Oscillator (%K, %D)
  const stochData = calculateStochasticArray(displayHistory, indicators.stoch.kPeriod, indicators.stoch.dPeriod);
  const stochVisible: { x: number; kVal: number; dVal: number }[] = [];
  for (let i = 0; i < visibleHistory.length; i++) {
    const originalIndex = startIndex + i;
    stochVisible.push({
      x: getX(i),
      kVal: stochData.kValues[originalIndex] || 50,
      dVal: stochData.dValues[originalIndex] || 50
    });
  }

  const getStochY = (val: number) => {
    const topMargin = 10;
    const bottomMargin = 10;
    return rsiHeight - ((val / 100) * (rsiHeight - topMargin - bottomMargin)) - bottomMargin;
  };

  // 7. Parabolic SAR Reversals
  const sarValues = calculateSARArray(displayHistory, indicators.sar.af, indicators.sar.maxAf);
  const sarPoints: { x: number; y: number; isBull: boolean }[] = [];
  for (let i = 0; i < visibleHistory.length; i++) {
    const originalIndex = startIndex + i;
    if (sarValues[originalIndex] !== undefined) {
      const isBull = sarValues[originalIndex] < visibleHistory[i].close;
      sarPoints.push({ x: getX(i), y: getY(sarValues[originalIndex]), isBull });
    }
  }

  // Grid Prices rendering helper
  const gridLineCount = 5;
  const gridPrices: number[] = [];
  for (let i = 0; i < gridLineCount; i++) {
    gridPrices.push(minPrice + (adjustedPriceRange * (i + 1)) / (gridLineCount + 1));
  }

  // Continuous Area/Line plot paths
  const linePath = visibleHistory.map((c, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(c.close)}`).join(' ');
  const areaPath = `${linePath} L ${getX(visibleHistory.length - 1)} ${chartHeight} L ${getX(0)} ${chartHeight} Z`;

  const activeAssetTrades = activeTrades.filter(
    t => t.assetId === asset.id && t.status === 'ACTIVE' && (t.expirationTime - Date.now() > 0)
  );

  // Quick preset colors list
  const COLOR_PALETTE = ['#f59e0b', '#06b6d4', '#ec4899', '#a855f7', '#10b981', '#3b82f6', '#f43f5e', '#ffffff'];

  // Tutorial database
  const TUTORIALS_DATABASE = [
    {
      id: 'sma_crossover',
      title: 'Moving Average Crossovers',
      desc: 'Master SMA & EMA golden/death crossovers to enter trends with surgical timing.',
      category: 'Trend Averages',
      difficulty: 'Beginner',
      winRate: '72%',
      explanation: 'Moving averages (SMA & EMA) smooth out noise. A BUY signal is spotted when the price breaks above the moving average, or when a faster period EMA crosses above a slower period SMA. This is known as a "Golden Cross" and signals powerful bullish momentum.',
      tips: [
        'Use SMA(15) for smooth medium-term trend direction.',
        'Use EMA(25) for high responsiveness to recent ticks.',
        'Wait for a candle to CLOSE above the average before entering.'
      ]
    },
    {
      id: 'bbands_bounce',
      title: 'Bollinger Bands Volatility Bounce',
      desc: 'Ride volatility waves by identifying extreme price bounces on the bands.',
      category: 'Volatility',
      difficulty: 'Intermediate',
      winRate: '75%',
      explanation: 'Bollinger Bands consist of three lines. Price acts like a rubber band—when it stretches to touch the Upper Band, it is considered overbought and likely to "bounce" back down. When it touches the Lower Band, it is oversold and likely to jump up.',
      tips: [
        'In quiet markets, the bands contract. Look for a breakout.',
        'When price hits the Lower Band and forms a bullish hammer, enter a CALL (UP).',
        'In strong trends, prices can ride bands. Do not blindly fade strong momentum.'
      ]
    },
    {
      id: 'rsi_reversal',
      title: 'RSI Reversal Masterclass',
      desc: 'Capture turning points by identifying overbought and oversold thresholds.',
      category: 'Momentum Oscillators',
      difficulty: 'Intermediate',
      winRate: '78%',
      explanation: 'The Relative Strength Index (RSI) scales from 0 to 100. Readings above 70 indicate that the asset is over-extended (Overbought) and a correction/drop is imminent. Readings below 30 indicate it is Oversold and due for a recovery jump.',
      tips: [
        'A BUY signal is stronger when RSI dips below 30, then hooks back UP above 30.',
        'A SELL signal forms when RSI rallies above 70, then hooks back DOWN below 70.',
        'Look for divergences: Price making higher highs but RSI making lower highs.'
      ]
    },
    {
      id: 'macd_trend',
      title: 'MACD Momentum Wave Rider',
      desc: 'Spot explosive trend momentum shifts before they register on price.',
      category: 'Momentum Oscillators',
      difficulty: 'Advanced',
      winRate: '80%',
      explanation: 'MACD tracks the distance between two exponential moving averages. A CALL (UP) signal triggers when the blue MACD line crosses ABOVE the red Signal Line. A PUT (DOWN) signal triggers when MACD crosses BELOW the Signal Line.',
      tips: [
        'The Histogram shows the gap strength. Expanding green columns support CALLs.',
        'Zero-line crossings: MACD crossing above 0 indicates a major bullish shift.',
        'MACD is best paired with a Support indicator (like SMA).'
      ]
    },
    {
      id: 'stoch_oscillator',
      title: 'Stochastic Dual-Line Oscillator',
      desc: 'Trace exact reversal cycles using dual-line momentum oscillators.',
      category: 'Momentum Oscillators',
      difficulty: 'Advanced',
      winRate: '76%',
      explanation: 'Stochastic compares close prices to their range over time. It uses %K (fast) and %D (slow). When both dip below 20 (Oversold) and the %K line crosses ABOVE the %D line, it represents a highly reliable short-term BUY signal.',
      tips: [
        'Stochastic overbought line is at 80, and oversold line is at 20.',
        'Look for the crossover occurring exactly within the extreme zones.',
        'Highly effective in sideways or ranging markets.'
      ]
    },
    {
      id: 'sar_dots',
      title: 'Parabolic SAR Acceleration dots',
      desc: 'Spot absolute support limits and trend reversals using stop-and-reverse dots.',
      category: 'Trend Averages',
      difficulty: 'Intermediate',
      winRate: '74%',
      explanation: 'Parabolic SAR places dots above or below candlesticks. When a dot appears below candles, the trend is Bullish. When dots "flip" to appear above candles, the trend is Bearish. The dots accelerate closer to the price as the trend matures.',
      tips: [
        'Wait for the first 2 or 3 dots of a new direction to confirm safety.',
        'If dots are far away, the trend is strong and safe.',
        'When dots get extremely close to price, a reverse flip is imminent.'
      ]
    }
  ];

  const currentTutorialObj = TUTORIALS_DATABASE.find(t => t.id === activeTutorial);

  let hoveredCandle: any = null;
  if (mousePos && visibleHistory.length > 0) {
    const fraction = mousePos.x / (width - paddingRight);
    const floatIndex = fraction * (visibleCount - 1) - Math.max(0, visibleCount - visibleHistory.length);
    const index = Math.round(floatIndex);
    if (index >= 0 && index < visibleHistory.length) {
      hoveredCandle = visibleHistory[index];
    }
  }

  return (
    <div className={`flex-1 bg-[#050608] flex flex-col select-none ${isFullScreen ? 'fixed inset-0 z-50 p-6 m-0 rounded-none' : 'border border-white/10 rounded-xl p-4 min-h-[400px] md:min-h-[500px]'}`} id="trading-desk-panel">
      {/* Chart Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-sans font-semibold text-sm tracking-tight flex items-center gap-2">
              {asset.name}
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                asset.change24h >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
              }`}>
                {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
              </span>
            </span>
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              {['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1', 'MN'].map(tf => (
                <button
                  key={tf}
                  onClick={() => { playClick(); setTimeframe(tf); }}
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                    timeframe === tf 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold'
                      : 'bg-[#0a0f1d] text-gray-500 border-white/5 hover:bg-white/10 hover:text-gray-300'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <button onClick={handleZoomOut} className="px-1.5 py-0.5 rounded border border-white/10 bg-[#0a0f1d] hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer text-xs font-bold leading-none">-</button>
              <button onClick={handleZoomIn} className="px-1.5 py-0.5 rounded border border-white/10 bg-[#0a0f1d] hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer text-xs font-bold leading-none">+</button>
            </div>
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1 block">IQ Pro Terminal Flow</span>
          </div>
        </div>

        {/* Action Controls & Floating Openers */}
        <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
          <button
            onClick={() => { playClick(); setIsFullScreen(!isFullScreen); }}
            className="px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 bg-[#0a0f1d] hover:bg-white/5 text-gray-300 border-white/10"
            title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
          >
            {isFullScreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullScreen ? 'Exit Full Screen' : 'Full Screen'}</span>
          </button>
          <button
            onClick={() => { playClick(); setIsSidebarOpen(true); setSidebarTab('indicators'); }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
              isSidebarOpen && sidebarTab === 'indicators'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-lg'
                : 'bg-[#0a0f1d] hover:bg-white/5 text-gray-300 border-white/10'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Setup Indicators</span>
          </button>

          <button
            onClick={() => { playClick(); setIsSidebarOpen(true); setSidebarTab('tutorials'); }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
              isSidebarOpen && sidebarTab === 'tutorials'
                ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 shadow-lg'
                : 'bg-indigo-950/40 hover:bg-indigo-900/40 text-indigo-200 border-indigo-500/20'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-yellow-400" />
            <span>IQ Academy Tutorials</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: Left Toolbelt + Center Canvas Area */}
      <div className="flex-1 flex flex-col-reverse md:flex-row gap-2 md:gap-3 min-h-[300px] md:min-h-[350px] relative">
        
        {/* IQ Options Left-Hand Navigation Toolbelt */}
        <div className="flex flex-row md:flex-col gap-2 md:gap-3 bg-[#0a0f1d] border border-white/10 p-1.5 md:py-3 md:px-1.5 rounded-xl items-center justify-between text-gray-500 shrink-0 overflow-x-auto custom-scrollbar">
          <div className="flex flex-row md:flex-col gap-2 md:gap-3.5 items-center">
            {/* Grid Toggle */}
            <button
              onClick={() => { playClick(); setShowGrid(!showGrid); }}
              className={`p-2 rounded-lg transition-all cursor-pointer hover:text-white ${
                showGrid ? 'bg-white/5 text-emerald-400 border border-white/10' : 'text-gray-400'
              }`}
              title="Toggle Background Grid"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
            </button>
            
            {/* Chart Type Trigger */}
            <button
              onClick={() => {
                playClick();
                setChartType(chartType === 'candle' ? 'bar' : chartType === 'bar' ? 'line' : 'candle');
              }}
              className={`p-2 rounded-lg transition-all cursor-pointer hover:text-white ${
                chartType !== 'line' ? 'bg-white/5 text-emerald-400 border border-white/10' : 'text-gray-400'
              }`}
              title="Toggle Chart Type"
            >
              {chartType === 'candle' ? <BarChart2 className="w-4 h-4 rotate-90" /> : chartType === 'bar' ? <BarChart2 className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            </button>

            {/* Price Alert Tool */}
            <button
              onClick={() => {
                playClick();
                setAlertMode(!alertMode);
                setDrawingMode(null as any);
              }}
              className={`p-2 rounded-lg transition-all cursor-pointer hover:text-white ${
                alertMode ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-gray-400'
              }`}
              title="Set Price Alert"
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* Graphical Tools Opener */}
            <button
              onClick={() => {
                playClick();
                setIsSidebarOpen(!isSidebarOpen || sidebarTab !== 'objects');
                setSidebarTab('objects');
              }}
              className={`p-2 rounded-lg transition-all cursor-pointer hover:text-white ${
                isSidebarOpen && sidebarTab === 'objects' ? 'bg-amber-500/10 text-amber-400' : 'text-gray-400'
              }`}
              title="Graphical Tools"
            >
              <Pencil className="w-4 h-4" />
            </button>
            {(drawings.length > 0 || alerts.length > 0) && (
              <button
                onClick={() => {
                  playClick();
                  setDrawings([]);
                  setAlerts([]);
                }}
                className="p-2 rounded-lg transition-all cursor-pointer text-gray-400 hover:text-rose-400"
                title="Clear Drawings & Alerts"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            {drawings.length > 0 && false && (
              <button
                onClick={() => {
                  playClick();
                  setDrawings([]);
                }}
                className="p-2 rounded-lg transition-all cursor-pointer text-gray-400 hover:text-rose-400"
                title="Clear Drawings"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            {/* Quick Indicators Opener */}
            <button
              onClick={() => {
                playClick();
                setIsSidebarOpen(!isSidebarOpen || sidebarTab !== 'indicators');
                setSidebarTab('indicators');
              }}
              className={`p-2 rounded-lg transition-all cursor-pointer hover:text-white ${
                isSidebarOpen && sidebarTab === 'indicators' ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400'
              }`}
              title="Technical Indicators Setup"
            >
              <Layers className="w-4 h-4" />
            </button>

            {/* Quick Tutorials Opener */}
            <button
              onClick={() => {
                playClick();
                setIsSidebarOpen(!isSidebarOpen || sidebarTab !== 'tutorials');
                setSidebarTab('tutorials');
              }}
              className={`p-2 rounded-lg transition-all cursor-pointer hover:text-white ${
                isSidebarOpen && sidebarTab === 'tutorials' ? 'bg-indigo-500/10 text-indigo-400' : 'text-gray-400'
              }`}
              title="IQ Options Academy"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>

          {/* Reset Zoom / Go Live button */}
          <div className="flex flex-col items-center">
            {scrollOffset > 0 ? (
              <button
                onClick={() => { playClick(); setScrollOffset(0); }}
                className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse cursor-pointer hover:scale-105 transition-all"
                title="Go back to live ticks stream"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            ) : (
              <div className="p-2 rounded-lg text-gray-700 pointer-events-none" title="Running at live edge">
                <Clock className="w-4 h-4 animate-spin-slow" />
              </div>
            )}
          </div>
        </div>

        {/* Center Canvas Area with Sliding sidebar overlays */}
        <div className="flex-1 flex flex-col gap-2 min-w-0 bg-[#06080e] border border-white/5 rounded-xl overflow-hidden relative">
          
          {/* Main Price Chart SVG */}
          <div 
            className={`flex-1 relative flex flex-col bg-[#050608] cursor-grab select-none overflow-hidden touch-none ${
              isDragging ? 'cursor-grabbing' : ''
            }`}
            id="chart-dragging-container"

          >

            {hoveredCandle && !isDragging && (
              <div className="absolute top-10 left-3 pointer-events-none flex flex-col gap-0.5 bg-[#0a0f1d]/90 backdrop-blur-md border border-white/10 px-2.5 py-1.5 rounded text-[10px] text-gray-400 font-mono tracking-wider z-10 shadow-lg">
                <div className="flex gap-2">
                  <span>O: <span className={hoveredCandle.open <= hoveredCandle.close ? 'text-emerald-400' : 'text-rose-400'}>{hoveredCandle.open.toFixed(2)}</span></span>
                  <span>H: <span className="text-gray-300">{hoveredCandle.high.toFixed(2)}</span></span>
                  <span>L: <span className="text-gray-300">{hoveredCandle.low.toFixed(2)}</span></span>
                  <span>C: <span className={hoveredCandle.close >= hoveredCandle.open ? 'text-emerald-400' : 'text-rose-400'}>{hoveredCandle.close.toFixed(2)}</span></span>
                </div>
                <div className="text-gray-500">
                  {new Date(hoveredCandle.time).toLocaleString()} 
                </div>
              </div>
            )}
            {/* Background floating watermarks */}
            <div className="absolute top-2 left-3 pointer-events-none flex items-center gap-1.5 bg-white/5 backdrop-blur-md border border-white/10 px-2 py-1 rounded text-[10px] text-gray-400 font-mono tracking-wider z-10">
              <Eye className="w-3 h-3 text-emerald-500" />
              <span>PAYOUT: <span className="text-emerald-400 font-bold">{asset.payoutRate}%</span></span>
            </div>

            {clampedScrollOffset > 0 && (
              <button 
                onClick={() => setScrollOffset(0)}
                className="absolute top-2 right-3 flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border border-emerald-400/20 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg shadow-emerald-500/25 transition-all z-20 animate-pulse cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Past ({clampedScrollOffset} ticks back) — Sync Live</span>
              </button>
            )}

            <svg 
              className="flex-1 w-full h-full min-h-[250px] cursor-crosshair touch-none"
              viewBox={`0 0 ${width} ${chartHeight}`}
              preserveAspectRatio="none"
              id="main-price-svg"
              onPointerDown={handleMouseDown}
              onPointerMove={handleMouseMove}
              onPointerUp={handleMouseUp}
              onPointerLeave={handleMouseLeave}
            >
              {/* Grid Guides */}
              {showGrid && gridPrices.map((price, i) => (
                <g key={i} className="opacity-40">
                  <line 
                    x1="0" 
                    y1={getY(price)} 
                    x2={width - paddingRight} 
                    y2={getY(price)} 
                    stroke="rgba(255, 255, 255, 0.05)" 
                    strokeWidth="1" 
                    strokeDasharray="2 4"
                  />
                  <text 
                    x={width - paddingRight + 8} 
                    y={getY(price) + 4} 
                    fill="rgba(255, 255, 255, 0.4)" 
                    fontSize="9" 
                    fontFamily="monospace"
                    textAnchor="start"
                  >
                    {price.toFixed(price > 1000 ? 1 : price > 2 ? 2 : 4)}
                  </text>
                </g>
              ))}

              {/* Bollinger Bands Shaded Area */}
              {showBands && bbUpperPoints.length > 1 && (
                <>
                  <path
                    d={`M ${bbUpperPoints[0].x} ${bbUpperPoints[0].y} 
                        ${bbUpperPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')} 
                        L ${bbLowerPoints[bbLowerPoints.length - 1].x} ${bbLowerPoints[bbLowerPoints.length - 1].y} 
                        ${bbLowerPoints.slice().reverse().slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')} Z`}
                    fill="rgba(168, 85, 247, 0.03)"
                    className="pointer-events-none"
                  />
                  <path
                    d={bbUpperPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                    fill="none"
                    stroke={indicators.bands.color}
                    strokeWidth="1.2"
                    strokeDasharray="2 2"
                    className="pointer-events-none opacity-60"
                  />
                  <path
                    d={bbLowerPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                    fill="none"
                    stroke={indicators.bands.color}
                    strokeWidth="1.2"
                    strokeDasharray="2 2"
                    className="pointer-events-none opacity-60"
                  />
                  <path
                    d={bbMiddlePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                    fill="none"
                    stroke={indicators.bands.color}
                    strokeWidth="0.8"
                    className="pointer-events-none opacity-20"
                  />
                </>
              )}

              {/* Area Line Plot */}
              {chartType === 'line' && (
                <>
                  <defs>
                    <linearGradient id={catStyle.glowId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={catStyle.primaryColor} stopOpacity="0.25" />
                      <stop offset="100%" stopColor={catStyle.primaryColor} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d={areaPath} fill={`url(#${catStyle.glowId})`} className="pointer-events-none" />
                  <path d={linePath} fill="none" stroke={catStyle.primaryColor} strokeWidth="2.2" className="pointer-events-none" />
                </>
              )}

              {/* Candlestick Plotting */}
              {chartType === 'bar' && visibleHistory.map((c, i) => {
                const x = getX(i);
                const yOpen = getY(c.open);
                const yClose = getY(c.close);
                const yHigh = getY(c.high);
                const yLow = getY(c.low);
                const isBullish = c.close >= c.open;
                const strokeColor = isBullish ? '#10b981' : '#f43f5e';
                const tickWidth = Math.max(2, (width - paddingRight) / visibleCount / 3);

                return (
                  <g key={i} className="transition-all duration-300">
                    {/* Vertical Line H to L */}
                    <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={strokeColor} strokeWidth="1.5" />
                    {/* Open tick (Left) */}
                    <line x1={x - tickWidth} y1={yOpen} x2={x} y2={yOpen} stroke={strokeColor} strokeWidth="1.5" />
                    {/* Close tick (Right) */}
                    <line x1={x} y1={yClose} x2={x + tickWidth} y2={yClose} stroke={strokeColor} strokeWidth="1.5" />
                  </g>
                );
              })}

              {chartType === 'candle' && visibleHistory.map((c, i) => {
                const x = getX(i);
                const yOpen = getY(c.open);
                const yClose = getY(c.close);
                const yHigh = getY(c.high);
                const yLow = getY(c.low);

                const isBullish = c.close >= c.open;
                const candleWidth = Math.max(3, (width - paddingRight) / visibleCount - 3);
                const rectHeight = Math.max(1, Math.abs(yOpen - yClose));
                const rectY = Math.min(yOpen, yClose);

                const strokeColor = isBullish ? '#10b981' : '#f43f5e';
                const fillColor = isBullish ? 'rgba(16, 185, 129, 0.45)' : 'rgba(244, 63, 94, 0.45)';

                return (
                  <g key={i} className="transition-all duration-300">
                    <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={strokeColor} strokeWidth="1.2" />
                    <rect 
                      x={x - candleWidth / 2} 
                      y={rectY} 
                      width={candleWidth} 
                      height={rectHeight} 
                      fill={fillColor} 
                      stroke={strokeColor} 
                      strokeWidth="1.2" 
                      rx="0.5"
                    />
                  </g>
                );
              })}

              {/* Price Alerts */}
              {alerts.map(alert => {
                const y = getY(alert.price);
                return (
                  <g key={alert.id} className={alert.triggered ? "opacity-30" : "opacity-100"}>
                    <line x1="0" y1={y} x2={width - paddingRight} y2={y} stroke="#f43f5e" strokeWidth="1" strokeDasharray="6 4" />
                    <rect x={width - paddingRight + 4} y={y - 8} width="40" height="16" rx="2" fill="#f43f5e" />
                    <text x={width - paddingRight + 24} y={y + 3} fill="#ffffff" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                      {alert.triggered ? "HIT" : "ALERT"}
                    </text>
                  </g>
                );
              })}
              {alertMode && cursorPrice !== null && (
                <g className="opacity-70 pointer-events-none">
                  <line x1="0" y1={getY(cursorPrice)} x2={width - paddingRight} y2={getY(cursorPrice)} stroke="#f43f5e" strokeWidth="1" strokeDasharray="6 4" />
                  <rect x={width - paddingRight + 4} y={getY(cursorPrice) - 8} width="40" height="16" rx="2" fill="#f43f5e" />
                  <text x={width - paddingRight + 24} y={getY(cursorPrice) + 3} fill="#ffffff" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    SET
                  </text>
                </g>
              )}

              {/* Graphical Tools (Trading Objects) */}
              {[...drawings, ...(currentDrawing && currentDrawing.end ? [currentDrawing] : [])].map((d, i) => {
                if (d.type === 'horizontal') {
                  const y = getY(d.start.price);
                  return <line key={d.id || i} x1={0} y1={y} x2={width - paddingRight} y2={y} stroke="#fcd34d" strokeWidth="2" />;
                }
                if (d.type === 'vertical') {
                  const x = getXForTime(d.start.time);
                  return <line key={d.id || i} x1={x} y1={0} x2={x} y2={chartHeight} stroke="#fcd34d" strokeWidth="2" />;
                }
                const x1 = getXForTime(d.start.time);
                const y1 = getY(d.start.price);
                const x2 = getXForTime(d.end.time);
                const y2 = getY(d.end.price);
                
                if (d.type === 'fibonacci') {
                  const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
                  const diff = y2 - y1;
                  return (
                    <g key={d.id || i} className="opacity-80">
                      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="4 4" />
                      {levels.map(level => {
                        const yLvl = y1 + diff * level;
                        return (
                          <g key={level}>
                            <line x1={Math.min(x1, x2)} y1={yLvl} x2={width} y2={yLvl} stroke={level === 0 || level === 1 ? 'rgba(255,255,255,0.3)' : level === 0.618 ? '#fbbf24' : '#60a5fa'} strokeWidth="1" />
                            <text x={Math.min(x1, x2) + 5} y={yLvl - 4} fill={level === 0 || level === 1 ? 'rgba(255,255,255,0.6)' : level === 0.618 ? '#fbbf24' : '#60a5fa'} fontSize="10" fontFamily="monospace">
                              {(level * 100).toFixed(1)}% ({getPriceFromY(yLvl).toFixed(2)})
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  );
                }
                return <line key={d.id || i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fcd34d" strokeWidth="2" strokeDasharray="4 4" />;
              })}

              {/* SMA Line Overlay */}
              {showSMA && smaPoints.length > 1 && (
                <path
                  d={smaPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                  fill="none"
                  stroke={indicators.sma.color}
                  strokeWidth="1.6"
                  className="pointer-events-none"
                />
              )}

              {/* EMA Line Overlay */}
              {indicators.ema.active && emaPoints.length > 1 && (
                <path
                  d={emaPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                  fill="none"
                  stroke={indicators.ema.color}
                  strokeWidth="1.6"
                  className="pointer-events-none"
                />
              )}

              {/* Parabolic SAR dots */}
              {indicators.sar.active && sarPoints.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="1.8"
                  fill={indicators.sar.color}
                  className="pointer-events-none opacity-80"
                />
              ))}

              {/* Active Option Horizontal Targets */}
              {activeAssetTrades.map((trade) => {
                const tradeY = getY(trade.strikePrice);
                const isCall = trade.type === 'UP';
                const strokeColor = isCall ? '#10b981' : '#f43f5e';
                const shadowClass = isCall ? 'drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]' : 'drop-shadow-[0_0_4px_rgba(244,63,94,0.5)]';
                const remaining = Math.max(0, Math.ceil((trade.expirationTime - Date.now()) / 1000));
                const isCritical = remaining <= 5;
                const timerColor = isCritical ? '#f43f5e' : strokeColor;

                return (
                  <g key={trade.id} className={shadowClass}>
                    <line x1="0" y1={tradeY} x2={width - paddingRight} y2={tradeY} stroke={strokeColor} strokeWidth="1.5" strokeDasharray="5 3" />
                    <rect x="5" y={tradeY - 9} width="72" height="18" rx="3" fill="#0a0c10" stroke={strokeColor} strokeWidth="1" />
                    <text x="41" y={tradeY + 3} fill={strokeColor} fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                      {isCall ? '▲' : '▼'} ${trade.strikePrice.toFixed(asset.price > 1000 ? 1 : 2)}
                    </text>

                    {/* Countdown indicator on target */}
                    <g transform={`translate(${width - paddingRight - 85}, ${tradeY - 9})`}>
                      <rect width="80" height="18" rx="3" fill="#0a0c10" stroke={timerColor} strokeWidth={isCritical ? "1.5" : "1"} />
                      <text x="40" y="12" fill={timerColor} fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight={isCritical ? "bold" : "normal"} className={isCritical ? "animate-pulse" : ""}>
                        {remaining}s left
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Completed Trades boxes for historical study */}
              {completedTrades.filter(t => t.assetId === asset.id).map((trade) => {
                const xStart = getXForTime(trade.startTime);
                const xEnd = getXForTime(trade.expirationTime);

                if ((xStart < 0 && xEnd < 0) || (xStart > width - paddingRight && xEnd > width - paddingRight)) {
                  return null;
                }

                const actualXStart = Math.max(0, xStart);
                const actualXEnd = Math.min(width - paddingRight, xEnd);
                const tradeY = getY(trade.strikePrice);
                const isWin = trade.status === 'WON';
                const isDraw = trade.status === 'DRAW';
                const strokeColor = isWin ? '#10b981' : isDraw ? '#9ca3af' : '#f43f5e';
                const fillColor = isWin ? 'rgba(16, 185, 129, 0.08)' : isDraw ? 'rgba(156, 163, 175, 0.05)' : 'rgba(244, 63, 94, 0.08)';
                const settlementY = trade.settlementPrice ? getY(trade.settlementPrice) : tradeY;
                const boxHeight = Math.abs(tradeY - settlementY) || 8;
                const boxY = Math.min(tradeY, settlementY);

                return (
                  <g key={trade.id} className="opacity-75 hover:opacity-100 transition-opacity">
                    <rect x={actualXStart} y={boxY} width={Math.max(4, actualXEnd - actualXStart)} height={boxHeight} fill={fillColor} stroke={strokeColor} strokeWidth="1" strokeDasharray="2 2" />
                    <line x1={actualXStart} y1={tradeY} x2={actualXEnd} y2={tradeY} stroke={strokeColor} strokeWidth="1.2" />
                    {actualXEnd - actualXStart > 32 && (
                      <g transform={`translate(${(actualXStart + actualXEnd) / 2}, ${boxY - 6})`}>
                        <rect x="-24" y="-7" width="48" height="13" rx="2" fill="#050608" stroke={strokeColor} strokeWidth="0.5" />
                        <text fill={strokeColor} fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle" y="2">
                          {isWin ? `+$${(trade.payoutAmount || 0).toFixed(0)}` : isDraw ? 'DRAW' : '-$0'}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Dynamic current price ticker right margin badge */}
              <g>
                <line x1="0" y1={getY(asset.price)} x2={width - paddingRight} y2={getY(asset.price)} stroke={catStyle.primaryColor} strokeOpacity="0.3" strokeWidth="1" strokeDasharray="2 2" />
                {clampedScrollOffset === 0 && (
                  <>
                    <circle cx={getX(visibleHistory.length - 1)} cy={getY(asset.price)} r="4.5" fill={catStyle.primaryColor} className="animate-ping" />
                    <circle cx={getX(visibleHistory.length - 1)} cy={getY(asset.price)} r="3" fill="#ffffff" stroke={catStyle.primaryColor} strokeWidth="1.5" />
                  </>
                )}
                
                <g transform={`translate(${width - paddingRight}, ${getY(asset.price) - 10})`}>
                  <polygon points="0,10 6,5 6,15" fill={catStyle.primaryColor} />
                  <rect x="6" y="0" width="72" height="20" rx="3" fill={catStyle.primaryColor} />
                  <text x="42" y="13" fill="#ffffff" fontSize="9.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    ${asset.price.toFixed(asset.price > 1000 ? 1 : asset.price > 2 ? 2 : 4)}
                  </text>
                </g>
              </g>
            </svg>
          </div>

          {/* Subplots Pane (Stacked layout sharing the exact same scale) */}
          <div className="flex flex-col shrink-0 gap-1.5 bg-[#050608] border-t border-white/10 p-2 max-h-[190px] overflow-y-auto custom-scrollbar">
            {/* RSI Index Subplot */}
            {showRSI && (
              <div className="h-[75px] bg-[#07090f] border border-white/5 rounded-lg relative overflow-hidden flex flex-col">
                <span className="absolute top-1.5 left-3 text-[8px] font-mono text-purple-400/80 tracking-widest uppercase">RSI ({indicators.rsi.period})</span>
                <svg className="w-full h-full" viewBox={`0 0 ${width} ${rsiHeight}`} preserveAspectRatio="none">
                  {/* Overbought threshold */}
                  <line x1="0" y1={getRsiY(indicators.rsi.overbought)} x2={width - paddingRight} y2={getRsiY(indicators.rsi.overbought)} stroke="#4a154b" strokeWidth="1" strokeDasharray="3 3" />
                  <text x={width - paddingRight + 6} y={getRsiY(indicators.rsi.overbought) + 3} fill="#a855f7" fontSize="8" fontFamily="monospace">{indicators.rsi.overbought}</text>
                  
                  {/* Oversold threshold */}
                  <line x1="0" y1={getRsiY(indicators.rsi.oversold)} x2={width - paddingRight} y2={getRsiY(indicators.rsi.oversold)} stroke="#154b3a" strokeWidth="1" strokeDasharray="3 3" />
                  <text x={width - paddingRight + 6} y={getRsiY(indicators.rsi.oversold) + 3} fill="#10b981" fontSize="8" fontFamily="monospace">{indicators.rsi.oversold}</text>

                  {/* Midpoint */}
                  <line x1="0" y1={getRsiY(50)} x2={width - paddingRight} y2={getRsiY(50)} stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" strokeDasharray="1 3" />

                  <rect x="0" y={getRsiY(indicators.rsi.overbought)} width={width - paddingRight} height={Math.abs(getRsiY(indicators.rsi.oversold) - getRsiY(indicators.rsi.overbought))} fill="rgba(168, 85, 247, 0.01)" />

                  {/* RSI Curve */}
                  {rsiValues.length > 1 && (
                    <path d={rsiValues.map((rsi, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getRsiY(rsi)}`).join(' ')} fill="none" stroke={indicators.rsi.color} strokeWidth="1.5" className="pointer-events-none" />
                  )}

                  {/* Endpoint value indicator */}
                  {rsiValues.length > 0 && (
                    <g>
                      <circle cx={getX(rsiValues.length - 1)} cy={getRsiY(rsiValues[rsiValues.length - 1])} r="2.5" fill={indicators.rsi.color} />
                      <rect x={width - paddingRight + 26} y={getRsiY(rsiValues[rsiValues.length - 1]) - 6} width="22" height="11" rx="2" fill="#0a0c10" stroke={indicators.rsi.color} strokeWidth="0.5" />
                      <text x={width - paddingRight + 37} y={getRsiY(rsiValues[rsiValues.length - 1]) + 2.5} fill={indicators.rsi.color} fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                        {Math.round(rsiValues[rsiValues.length - 1])}
                      </text>
                    </g>
                  )}
                </svg>
              </div>
            )}

            {/* MACD Oscillator Subplot */}
            {indicators.macd.active && (
              <div className="h-[75px] bg-[#07090f] border border-white/5 rounded-lg relative overflow-hidden flex flex-col">
                <span className="absolute top-1.5 left-3 text-[8px] font-mono text-blue-400 tracking-widest uppercase">MACD ({indicators.macd.fast}, {indicators.macd.slow}, {indicators.macd.signal})</span>
                <svg className="w-full h-full" viewBox={`0 0 ${width} ${rsiHeight}`} preserveAspectRatio="none">
                  <line x1="0" y1={getMacdY(0)} x2={width - paddingRight} y2={getMacdY(0)} stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />
                  <text x={width - paddingRight + 6} y={getMacdY(0) + 3} fill="#4b5563" fontSize="8" fontFamily="monospace">0.00</text>

                  {/* Histogram bars */}
                  {macdVisible.map((m, i) => {
                    const barY = getMacdY(m.histVal);
                    const zeroY = getMacdY(0);
                    const h = Math.abs(barY - zeroY) || 1;
                    const y = Math.min(barY, zeroY);
                    const barColor = m.histVal >= 0 ? '#10b981' : '#f43f5e';
                    return (
                      <rect
                        key={i}
                        x={m.x - 1}
                        y={y}
                        width="2"
                        height={h}
                        fill={barColor}
                        className="opacity-45 pointer-events-none"
                      />
                    );
                  })}

                  {/* MACD Line */}
                  <path
                    d={macdVisible.map((m, i) => `${i === 0 ? 'M' : 'L'} ${m.x} ${getMacdY(m.macdVal)}`).join(' ')}
                    fill="none"
                    stroke={indicators.macd.macdColor}
                    strokeWidth="1.2"
                    className="pointer-events-none"
                  />

                  {/* Signal Line */}
                  <path
                    d={macdVisible.map((m, i) => `${i === 0 ? 'M' : 'L'} ${m.x} ${getMacdY(m.signalVal)}`).join(' ')}
                    fill="none"
                    stroke={indicators.macd.signalColor}
                    strokeWidth="1.2"
                    className="pointer-events-none"
                  />

                  {/* Current Ticker endpoint */}
                  {macdVisible.length > 0 && (
                    <circle cx={macdVisible[macdVisible.length - 1].x} cy={getMacdY(macdVisible[macdVisible.length - 1].macdVal)} r="2" fill={indicators.macd.macdColor} />
                  )}
                </svg>
              </div>
            )}

            {/* Stochastic Oscillator Subplot */}
            {indicators.stoch.active && (
              <div className="h-[75px] bg-[#07090f] border border-white/5 rounded-lg relative overflow-hidden flex flex-col">
                <span className="absolute top-1.5 left-3 text-[8px] font-mono text-emerald-400 tracking-widest uppercase">STOCH ({indicators.stoch.kPeriod}, {indicators.stoch.dPeriod})</span>
                <svg className="w-full h-full" viewBox={`0 0 ${width} ${rsiHeight}`} preserveAspectRatio="none">
                  {/* Overbought (80) */}
                  <line x1="0" y1={getStochY(indicators.stoch.overbought)} x2={width - paddingRight} y2={getStochY(indicators.stoch.overbought)} stroke="#4a2815" strokeWidth="0.8" strokeDasharray="3 3" />
                  <text x={width - paddingRight + 6} y={getStochY(indicators.stoch.overbought) + 3} fill="#f59e0b" fontSize="8" fontFamily="monospace">{indicators.stoch.overbought}</text>

                  {/* Oversold (20) */}
                  <line x1="0" y1={getStochY(indicators.stoch.oversold)} x2={width - paddingRight} y2={getStochY(indicators.stoch.oversold)} stroke="#154b3a" strokeWidth="0.8" strokeDasharray="3 3" />
                  <text x={width - paddingRight + 6} y={getStochY(indicators.stoch.oversold) + 3} fill="#10b981" fontSize="8" fontFamily="monospace">{indicators.stoch.oversold}</text>

                  <rect x="0" y={getStochY(indicators.stoch.overbought)} width={width - paddingRight} height={Math.abs(getStochY(indicators.stoch.oversold) - getStochY(indicators.stoch.overbought))} fill="rgba(16, 185, 129, 0.015)" />

                  {/* %K line */}
                  <path
                    d={stochVisible.map((m, i) => `${i === 0 ? 'M' : 'L'} ${m.x} ${getStochY(m.kVal)}`).join(' ')}
                    fill="none"
                    stroke={indicators.stoch.color}
                    strokeWidth="1.2"
                    className="pointer-events-none"
                  />

                  {/* %D Line */}
                  <path
                    d={stochVisible.map((m, i) => `${i === 0 ? 'M' : 'L'} ${m.x} ${getStochY(m.dVal)}`).join(' ')}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1"
                    strokeDasharray="2 1"
                    className="pointer-events-none"
                  />

                  {/* Active Endpoint */}
                  {stochVisible.length > 0 && (
                    <circle cx={stochVisible[stochVisible.length - 1].x} cy={getStochY(stochVisible[stochVisible.length - 1].kVal)} r="2.5" fill={indicators.stoch.color} />
                  )}
                </svg>
              </div>
            )}
          </div>

          {/* IQ Options Sliding Sidebar Menu Control */}
          {isSidebarOpen && (
            <div className="absolute top-0 bottom-0 left-0 w-80 bg-[#070b13]/97 backdrop-blur-md border-r border-white/10 flex flex-col z-30 shadow-2xl transition-all duration-300">
              
              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b border-white/10 bg-[#0d1222]/90 shrink-0">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-white uppercase tracking-wider">
                    {activeTutorial ? 'Interactive Academy' : sidebarTab === 'indicators' ? 'Setup Indicators' : sidebarTab === 'objects' ? 'Graphical Tools' : 'IQ Academy Catalog'}
                  </span>
                </div>
                <button 
                  onClick={() => { playClick(); setIsSidebarOpen(false); setActiveTutorial(null); }}
                  className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Toggle tabs (Indicators vs Tutorials) if no active tutorial is loaded */}
              {!activeTutorial && (
                <div className="flex border-b border-white/5 text-[11px] bg-[#090d18]/70 p-1 font-semibold shrink-0">
                  <button
                    onClick={() => { playClick(); setSidebarTab('indicators'); }}
                    className={`flex-1 py-1.5 rounded transition-all cursor-pointer ${
                      sidebarTab === 'indicators' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Indicators
                  </button>
                  <button
                    onClick={() => { playClick(); setSidebarTab('tutorials'); }}
                    className={`flex-1 py-1.5 rounded transition-all cursor-pointer ${
                      sidebarTab === 'tutorials' 
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Academy Tutorials
                  </button>
                </div>
              )}

              {/* Tab: Indicator Settings Catalog */}
              {!activeTutorial && sidebarTab === 'indicators' && (
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3.5 custom-scrollbar">
                  <div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mb-1">Active overlays & Oscillators</div>

                  {/* 1. Simple Moving Average */}
                  <div className="bg-[#0b101c] p-3 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: indicators.sma.color }} />
                        <span className="text-xs font-bold text-gray-200">SMA Average</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={indicators.sma.active} 
                          onChange={(e) => {
                            playClick();
                            setIndicators(prev => ({ ...prev, sma: { ...prev.sma, active: e.target.checked } }));
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                    {indicators.sma.active && (
                      <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-white/5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400">Period length</span>
                          <input 
                            type="number" 
                            min="5" 
                            max="100" 
                            value={indicators.sma.period}
                            onChange={(e) => setIndicators(prev => ({ ...prev, sma: { ...prev.sma, period: Math.max(5, Math.min(100, parseInt(e.target.value) || 15)) } }))}
                            className="w-16 bg-[#06080e] border border-white/10 rounded px-1.5 py-0.5 text-center text-white"
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400">Line Color</span>
                          <div className="flex gap-1">
                            {COLOR_PALETTE.map(col => (
                              <button 
                                key={col} 
                                onClick={() => setIndicators(prev => ({ ...prev, sma: { ...prev.sma, color: col } }))}
                                className={`w-3.5 h-3.5 rounded-full border ${indicators.sma.color === col ? 'border-white scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: col }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Exponential Moving Average */}
                  <div className="bg-[#0b101c] p-3 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: indicators.ema.color }} />
                        <span className="text-xs font-bold text-gray-200">EMA Average</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={indicators.ema.active} 
                          onChange={(e) => {
                            playClick();
                            setIndicators(prev => ({ ...prev, ema: { ...prev.ema, active: e.target.checked } }));
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                    {indicators.ema.active && (
                      <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-white/5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400">Period length</span>
                          <input 
                            type="number" 
                            min="5" 
                            max="100" 
                            value={indicators.ema.period}
                            onChange={(e) => setIndicators(prev => ({ ...prev, ema: { ...prev.ema, period: Math.max(5, Math.min(100, parseInt(e.target.value) || 25)) } }))}
                            className="w-16 bg-[#06080e] border border-white/10 rounded px-1.5 py-0.5 text-center text-white"
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400">Line Color</span>
                          <div className="flex gap-1">
                            {COLOR_PALETTE.map(col => (
                              <button 
                                key={col} 
                                onClick={() => setIndicators(prev => ({ ...prev, ema: { ...prev.ema, color: col } }))}
                                className={`w-3.5 h-3.5 rounded-full border ${indicators.ema.color === col ? 'border-white scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: col }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Bollinger Bands */}
                  <div className="bg-[#0b101c] p-3 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: indicators.bands.color }} />
                        <span className="text-xs font-bold text-gray-200">Bollinger Bands</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={indicators.bands.active} 
                          onChange={(e) => {
                            playClick();
                            setIndicators(prev => ({ ...prev, bands: { ...prev.bands, active: e.target.checked } }));
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                    {indicators.bands.active && (
                      <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-white/5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400">Period length</span>
                          <input 
                            type="number" 
                            min="5" 
                            max="50" 
                            value={indicators.bands.period}
                            onChange={(e) => setIndicators(prev => ({ ...prev, bands: { ...prev.bands, period: Math.max(5, Math.min(50, parseInt(e.target.value) || 15)) } }))}
                            className="w-16 bg-[#06080e] border border-white/10 rounded px-1.5 py-0.5 text-center text-white"
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400">Std Dev Multiplier</span>
                          <input 
                            type="number" 
                            step="0.1"
                            min="1.0" 
                            max="3.0" 
                            value={indicators.bands.dev}
                            onChange={(e) => setIndicators(prev => ({ ...prev, bands: { ...prev.bands, dev: Math.max(1, Math.min(3, parseFloat(e.target.value) || 1.8)) } }))}
                            className="w-16 bg-[#06080e] border border-white/10 rounded px-1.5 py-0.5 text-center text-white"
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400">Bands Color</span>
                          <div className="flex gap-1">
                            {COLOR_PALETTE.map(col => (
                              <button 
                                key={col} 
                                onClick={() => setIndicators(prev => ({ ...prev, bands: { ...prev.bands, color: col } }))}
                                className={`w-3.5 h-3.5 rounded-full border ${indicators.bands.color === col ? 'border-white scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: col }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. RSI Index */}
                  <div className="bg-[#0b101c] p-3 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: indicators.rsi.color }} />
                        <span className="text-xs font-bold text-gray-200">RSI Oscillator</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={indicators.rsi.active} 
                          onChange={(e) => {
                            playClick();
                            setIndicators(prev => ({ ...prev, rsi: { ...prev.rsi, active: e.target.checked } }));
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                    {indicators.rsi.active && (
                      <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-white/5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400">RSI Period</span>
                          <input 
                            type="number" 
                            min="5" 
                            max="30" 
                            value={indicators.rsi.period}
                            onChange={(e) => setIndicators(prev => ({ ...prev, rsi: { ...prev.rsi, period: Math.max(5, Math.min(30, parseInt(e.target.value) || 14)) } }))}
                            className="w-16 bg-[#06080e] border border-white/10 rounded px-1.5 py-0.5 text-center text-white"
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400">Overbought limit</span>
                          <input 
                            type="number" 
                            min="60" 
                            max="90" 
                            value={indicators.rsi.overbought}
                            onChange={(e) => setIndicators(prev => ({ ...prev, rsi: { ...prev.rsi, overbought: Math.max(60, Math.min(90, parseInt(e.target.value) || 70)) } }))}
                            className="w-16 bg-[#06080e] border border-white/10 rounded px-1.5 py-0.5 text-center text-white"
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400">Oversold limit</span>
                          <input 
                            type="number" 
                            min="10" 
                            max="40" 
                            value={indicators.rsi.oversold}
                            onChange={(e) => setIndicators(prev => ({ ...prev, rsi: { ...prev.rsi, oversold: Math.max(10, Math.min(40, parseInt(e.target.value) || 30)) } }))}
                            className="w-16 bg-[#06080e] border border-white/10 rounded px-1.5 py-0.5 text-center text-white"
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400">Line Color</span>
                          <div className="flex gap-1">
                            {COLOR_PALETTE.map(col => (
                              <button 
                                key={col} 
                                onClick={() => setIndicators(prev => ({ ...prev, rsi: { ...prev.rsi, color: col } }))}
                                className={`w-3.5 h-3.5 rounded-full border ${indicators.rsi.color === col ? 'border-white scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: col }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 5. MACD Subplot */}
                  <div className="bg-[#0b101c] p-3 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: indicators.macd.macdColor }} />
                        <span className="text-xs font-bold text-gray-200">MACD Oscillator</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={indicators.macd.active} 
                          onChange={(e) => {
                            playClick();
                            setIndicators(prev => ({ ...prev, macd: { ...prev.macd, active: e.target.checked } }));
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                    {indicators.macd.active && (
                      <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-white/5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400">Fast EMA period</span>
                          <input 
                            type="number" 
                            min="5" 
                            max="20" 
                            value={indicators.macd.fast}
                            onChange={(e) => setIndicators(prev => ({ ...prev, macd: { ...prev.macd, fast: Math.max(5, Math.min(20, parseInt(e.target.value) || 12)) } }))}
                            className="w-16 bg-[#06080e] border border-white/10 rounded px-1.5 py-0.5 text-center text-white"
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400">Slow EMA period</span>
                          <input 
                            type="number" 
                            min="20" 
                            max="50" 
                            value={indicators.macd.slow}
                            onChange={(e) => setIndicators(prev => ({ ...prev, macd: { ...prev.macd, slow: Math.max(20, Math.min(50, parseInt(e.target.value) || 26)) } }))}
                            className="w-16 bg-[#06080e] border border-white/10 rounded px-1.5 py-0.5 text-center text-white"
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400">Signal SMA period</span>
                          <input 
                            type="number" 
                            min="5" 
                            max="15" 
                            value={indicators.macd.signal}
                            onChange={(e) => setIndicators(prev => ({ ...prev, macd: { ...prev.macd, signal: Math.max(5, Math.min(15, parseInt(e.target.value) || 9)) } }))}
                            className="w-16 bg-[#06080e] border border-white/10 rounded px-1.5 py-0.5 text-center text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 6. Stochastic Oscillator */}
                  <div className="bg-[#0b101c] p-3 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: indicators.stoch.color }} />
                        <span className="text-xs font-bold text-gray-200">Stochastic Index</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={indicators.stoch.active} 
                          onChange={(e) => {
                            playClick();
                            setIndicators(prev => ({ ...prev, stoch: { ...prev.stoch, active: e.target.checked } }));
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                    {indicators.stoch.active && (
                      <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-white/5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400">%K lookback period</span>
                          <input 
                            type="number" 
                            min="5" 
                            max="30" 
                            value={indicators.stoch.kPeriod}
                            onChange={(e) => setIndicators(prev => ({ ...prev, stoch: { ...prev.stoch, kPeriod: Math.max(5, Math.min(30, parseInt(e.target.value) || 14)) } }))}
                            className="w-16 bg-[#06080e] border border-white/10 rounded px-1.5 py-0.5 text-center text-white"
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400">%D smoothing</span>
                          <input 
                            type="number" 
                            min="2" 
                            max="10" 
                            value={indicators.stoch.dPeriod}
                            onChange={(e) => setIndicators(prev => ({ ...prev, stoch: { ...prev.stoch, dPeriod: Math.max(2, Math.min(10, parseInt(e.target.value) || 3)) } }))}
                            className="w-16 bg-[#06080e] border border-white/10 rounded px-1.5 py-0.5 text-center text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 7. Parabolic SAR Reversal dots */}
                  <div className="bg-[#0b101c] p-3 rounded-xl border border-white/5 shadow-inner">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: indicators.sar.color }} />
                        <span className="text-xs font-bold text-gray-200">Parabolic SAR</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={indicators.sar.active} 
                          onChange={(e) => {
                            playClick();
                            setIndicators(prev => ({ ...prev, sar: { ...prev.sar, active: e.target.checked } }));
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                    {indicators.sar.active && (
                      <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-white/5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400">AF Step factor</span>
                          <input 
                            type="number" 
                            step="0.01"
                            min="0.01" 
                            max="0.1" 
                            value={indicators.sar.af}
                            onChange={(e) => setIndicators(prev => ({ ...prev, sar: { ...prev.sar, af: Math.max(0.01, Math.min(0.1, parseFloat(e.target.value) || 0.02)) } }))}
                            className="w-16 bg-[#06080e] border border-white/10 rounded px-1.5 py-0.5 text-center text-white"
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400">Dot Color</span>
                          <div className="flex gap-1">
                            {COLOR_PALETTE.map(col => (
                              <button 
                                key={col} 
                                onClick={() => setIndicators(prev => ({ ...prev, sar: { ...prev.sar, color: col } }))}
                                className={`w-3.5 h-3.5 rounded-full border ${indicators.sar.color === col ? 'border-white scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: col }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Academy Tutorials catalog list */}
              {!activeTutorial && sidebarTab === 'objects' && (
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 custom-scrollbar">
                  <div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mb-1">Graphical Tools</div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { playClick(); setDrawingMode(drawingMode === 'trend' ? null : 'trend'); setAlertMode(false); }}
                      className={`p-3 flex flex-col items-center justify-center gap-2 rounded-xl border transition-all cursor-pointer ${
                        drawingMode === 'trend' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-[#0b101c] text-gray-400 border-white/5 hover:border-white/10 hover:text-gray-200'
                      }`}
                    >
                      <TrendingUp className="w-5 h-5" />
                      <span className="text-[10px] font-semibold">Trend Line</span>
                    </button>
                    
                    <button
                      onClick={() => { playClick(); setDrawingMode(drawingMode === 'horizontal' ? null : 'horizontal'); setAlertMode(false); }}
                      className={`p-3 flex flex-col items-center justify-center gap-2 rounded-xl border transition-all cursor-pointer ${
                        drawingMode === 'horizontal' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-[#0b101c] text-gray-400 border-white/5 hover:border-white/10 hover:text-gray-200'
                      }`}
                    >
                      <Move className="w-5 h-5 opacity-70 rotate-90" />
                      <span className="text-[10px] font-semibold">Horizontal</span>
                    </button>
                    
                    <button
                      onClick={() => { playClick(); setDrawingMode(drawingMode === 'vertical' ? null : 'vertical'); setAlertMode(false); }}
                      className={`p-3 flex flex-col items-center justify-center gap-2 rounded-xl border transition-all cursor-pointer ${
                        drawingMode === 'vertical' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-[#0b101c] text-gray-400 border-white/5 hover:border-white/10 hover:text-gray-200'
                      }`}
                    >
                      <Move className="w-5 h-5 opacity-70" />
                      <span className="text-[10px] font-semibold">Vertical</span>
                    </button>
                    
                    <button
                      onClick={() => { playClick(); setDrawingMode(drawingMode === 'fibonacci' ? null : 'fibonacci'); setAlertMode(false); }}
                      className={`p-3 flex flex-col items-center justify-center gap-2 rounded-xl border transition-all cursor-pointer ${
                        drawingMode === 'fibonacci' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-[#0b101c] text-gray-400 border-white/5 hover:border-white/10 hover:text-gray-200'
                      }`}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><line x1="4" y1="4" x2="20" y2="4"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="20" x2="20" y2="20"></line><line x1="4" y1="20" x2="20" y2="4" strokeDasharray="4 4"></line></svg>
                      <span className="text-[10px] font-semibold">Fibonacci</span>
                    </button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Total Drawings</span>
                      <span className="text-xs font-mono text-gray-300">{drawings.length}</span>
                    </div>
                    {drawings.length > 0 && (
                      <button
                        onClick={() => { playClick(); setDrawings([]); }}
                        className="w-full mt-3 py-2 flex items-center justify-center gap-2 text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear All Drawings
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {!activeTutorial && sidebarTab === 'tutorials' && (
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 custom-scrollbar">
                  <div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mb-1">IQ Options Training Video Academy</div>
                  
                  {TUTORIALS_DATABASE.map(course => (
                    <button
                      key={course.id}
                      onClick={() => { playClick(); setActiveTutorial(course.id); }}
                      className="w-full bg-[#0b101c] hover:bg-[#121a2c] text-left p-3 rounded-xl border border-white/5 flex flex-col gap-2 transition-all hover:border-indigo-500/20 active:scale-[0.98] cursor-pointer shadow-md"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-indigo-400">{course.category}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          course.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400' :
                          course.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>{course.difficulty}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1">
                        <span>{course.title}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                      </h4>
                      <p className="text-[11px] text-gray-400 leading-relaxed">{course.desc}</p>
                      <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono mt-1 pt-2 border-t border-white/5">
                        <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-yellow-500" /> Accuracy: {course.winRate}</span>
                        <span className="text-indigo-400 font-bold uppercase">Learn course →</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Interactive Course Page */}
              {activeTutorial && currentTutorialObj && (
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4 custom-scrollbar">
                  {/* Back banner */}
                  <button
                    onClick={() => { playClick(); setActiveTutorial(null); setSimState('IDLE'); setSimActiveOption(null); setSimMessage(null); }}
                    className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-bold py-1 px-2 rounded bg-indigo-500/5 hover:bg-indigo-500/10 transition-all self-start cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back to Academy</span>
                  </button>

                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-mono tracking-widest text-indigo-400 uppercase leading-none">{currentTutorialObj.category}</span>
                    <h3 className="text-sm font-black text-white">{currentTutorialObj.title}</h3>
                  </div>

                  {/* Course description */}
                  <div className="text-xs text-gray-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                    <p>{currentTutorialObj.explanation}</p>
                  </div>

                  {/* Pro Tactics Tips */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Academy Trading Tactics</span>
                    <ul className="flex flex-col gap-1.5">
                      {currentTutorialObj.tips.map((tip, i) => (
                        <li key={i} className="text-[11px] text-gray-400 flex items-start gap-1.5 leading-relaxed">
                          <span className="text-emerald-400 shrink-0 font-bold">✓</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Interactive Live Signal Simulator Sandbox */}
                  <div className="bg-[#0b101c] rounded-xl p-3 border border-indigo-500/10 shadow-lg flex flex-col gap-2.5">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        Live Indicator Simulator
                      </span>
                      <span className="text-[10px] text-indigo-400 font-mono">1s ticks</span>
                    </div>

                    {/* Miniature SVG Simulator Chart */}
                    <div className="h-28 bg-[#050608] border border-white/15 rounded-lg overflow-hidden relative">
                      {simCandles.length > 0 ? (
                        <svg className="w-full h-full" viewBox="0 0 260 112" preserveAspectRatio="none">
                          {/* Grid line */}
                          <line x1="0" y1="56" x2="260" y2="56" stroke="rgba(255,255,255,0.02)" strokeWidth="0.8" />
                          
                          {/* Plot simulator candlesticks */}
                          {simCandles.map((c, i) => {
                            const x = (i / (simCandles.length - 1)) * 230;
                            // Map prices to bounds [95, 105]
                            const mapSimY = (val: number) => {
                              return 112 - ((val - 94) / 12) * 112;
                            };
                            const yOpen = mapSimY(c.open);
                            const yClose = mapSimY(c.close);
                            const yHigh = mapSimY(c.high);
                            const yLow = mapSimY(c.low);
                            const isBull = c.close >= c.open;
                            const strokeColor = isBull ? '#10b981' : '#f43f5e';
                            const fillColor = isBull ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)';

                            return (
                              <g key={i}>
                                <line x1={x} y1={mapSimY(c.high)} x2={x} y2={mapSimY(c.low)} stroke={strokeColor} strokeWidth="0.8" />
                                <rect x={x - 2.5} y={Math.min(yOpen, yClose)} width="5" height={Math.max(1, Math.abs(yOpen - yClose))} fill={fillColor} stroke={strokeColor} strokeWidth="0.8" />
                              </g>
                            );
                          })}

                          {/* Render SMA overlay in simulator */}
                          {simCandles.length > 5 && (
                            <path
                              d={simCandles.map((_, i) => {
                                const x = (i / (simCandles.length - 1)) * 230;
                                if (i < 4) return '';
                                const avg = simCandles.slice(i - 4, i + 1).reduce((acc, c) => acc + c.close, 0) / 5;
                                const y = 112 - ((avg - 94) / 12) * 112;
                                return `${i === 4 ? 'M' : 'L'} ${x} ${y}`;
                              }).join(' ')}
                              fill="none"
                              stroke="#f59e0b"
                              strokeWidth="1"
                            />
                          )}

                          {/* Render simulated active option horizontal strike level */}
                          {simActiveOption && (
                            <g>
                              <line 
                                x1="0" 
                                y1={112 - ((simActiveOption.strike - 94) / 12) * 112} 
                                x2="260" 
                                y2={112 - ((simActiveOption.strike - 94) / 12) * 112} 
                                stroke={simActiveOption.type === 'UP' ? '#10b981' : '#f43f5e'} 
                                strokeWidth="1" 
                                strokeDasharray="3 2" 
                              />
                            </g>
                          )}
                        </svg>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-[10px]">Preparing sandbox...</div>
                      )}

                      {/* Overlays for active options countdown */}
                      {simActiveOption && (
                        <div className="absolute top-1.5 right-1.5 bg-[#0a0c10] border border-indigo-500/30 px-2 py-0.5 rounded text-[9px] font-mono text-indigo-400 animate-pulse">
                          {simActiveOption.timer}s expiry
                        </div>
                      )}
                    </div>

                    {/* Simulation Controller Toggles */}
                    <div className="flex flex-col gap-2">
                      <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wider text-center">Inject Market Force Scenario</div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => { playSimulatorSound('PLACE'); setSimState('BULLISH'); }}
                          className={`py-1.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                            simState === 'BULLISH' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold scale-102' : 'bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-400 border border-emerald-500/10'
                          }`}
                        >
                          ▲ Pump Uptrend (Bull)
                        </button>
                        <button
                          onClick={() => { playSimulatorSound('PLACE'); setSimState('BEARISH'); }}
                          className={`py-1.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                            simState === 'BEARISH' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold scale-102' : 'bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-500/10'
                          }`}
                        >
                          ▼ Dump Downtrend (Bear)
                        </button>
                      </div>

                      {/* Dynamic Action Trigger Banner based on current simulation ticks */}
                      {simState !== 'IDLE' && !simActiveOption && !simMessage && (
                        <div className="bg-[#0f172a] border border-indigo-500/20 rounded-lg p-2.5 flex flex-col gap-2 text-center animate-pulse">
                          <span className="text-[10px] font-semibold text-indigo-300 font-mono uppercase tracking-wide flex items-center justify-center gap-1.5 leading-none">
                            <Sparkles className="w-3 h-3 text-yellow-400" />
                            {simState === 'BULLISH' ? 'Spotting Bullish Breakout' : 'Spotting Bearish Reversal'}
                          </span>
                          <span className="text-[11px] text-gray-300">Spotting Golden Cross. Click corresponding call or put option to execute mock trade!</span>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                playSimulatorSound('PLACE');
                                const currentLast = simCandles[simCandles.length - 1];
                                setSimActiveOption({
                                  type: 'UP',
                                  strike: currentLast ? currentLast.close : 100,
                                  timer: 4,
                                  entryIndex: simCandles.length - 1
                                });
                              }}
                              className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded shadow shadow-emerald-950/30 cursor-pointer"
                            >
                              BUY CALL (UP)
                            </button>
                            <button
                              onClick={() => {
                                playSimulatorSound('PLACE');
                                const currentLast = simCandles[simCandles.length - 1];
                                setSimActiveOption({
                                  type: 'DOWN',
                                  strike: currentLast ? currentLast.close : 100,
                                  timer: 4,
                                  entryIndex: simCandles.length - 1
                                });
                              }}
                              className="flex-1 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold rounded shadow shadow-rose-950/30 cursor-pointer"
                            >
                              BUY PUT (DOWN)
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Display simulator results / educational feedback */}
                      {simMessage && (
                        <div className={`p-2.5 rounded-lg border text-xs text-center flex flex-col gap-1.5 animate-in fade-in zoom-in duration-300 ${
                          simMessage.success ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-100' : 'bg-rose-950/40 border-rose-500/20 text-rose-100'
                        }`}>
                          <span className="font-bold flex items-center justify-center gap-1.5">
                            {simMessage.success ? <Award className="w-4 h-4 text-yellow-400" /> : <Info className="w-4 h-4" />}
                            {simMessage.success ? 'ACADEMY TRADE WIN' : 'ACADEMY TRY AGAIN'}
                          </span>
                          <p className="text-[11px] text-gray-300 leading-normal">{simMessage.text}</p>
                          <button
                            onClick={() => { playClick(); initSimulator(); }}
                            className="mt-1 px-3 py-1 text-[10px] font-bold bg-white/5 hover:bg-white/10 rounded border border-white/10 text-white cursor-pointer self-center"
                          >
                            Restart Simulator
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Instructions banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-3.5 text-[10.5px] text-gray-500 font-sans border-t border-white/5 pt-3">
        <div className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Double-click / drag chart to inspect past candlesticks. Enable multiple stacked indicators below.</span>
        </div>
        <span className="font-mono text-emerald-500/60 flex items-center gap-1 leading-none uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          IQ Options Engine Sync Active
        </span>
      </div>
    </div>
  );
}
