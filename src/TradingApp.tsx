/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Asset, Candlestick, Trade, UserAccount, SocialTrade, Achievement, TradingSignal } from './types';
import { INITIAL_ASSETS, INITIAL_ACHIEVEMENTS } from './data/assetsData';
import { fetchHistoricalData } from './services/marketData';
import { binanceStream } from './services/binanceStream';
import Header from './components/Header';
import TradingChart from './components/TradingChart';
import OrderPanel from './components/OrderPanel';
import Sidebar from './components/Sidebar';
import SmallAssetSelector from './components/SmallAssetSelector';
import TopTradesTracker from './components/TopTradesTracker';
import AuthKycModal from './components/AuthKycModal';
import DepositWithdrawModal from './components/DepositWithdrawModal';
import AdminPanel from './components/AdminPanel';
import { Sparkles, X, Award, Info, AlertTriangle } from 'lucide-react';

export default function App({ forceAdmin = false }: { forceAdmin?: boolean }) {
  // 1. Account & Progress States (Persisted in localStorage)
  const [account, setAccount] = useState<UserAccount>(() => {
    const cached = localStorage.getItem('vertex_account');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error('Error parsing cached account', e);
      }
    }
    return {
      balanceDemo: 10000,
      balanceLive: 0,
      isLive: false,
      level: 1,
      xp: 0,
      badges: [],
    };
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeAssetId, setActiveAssetId] = useState<string>('btc-usd');
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  
  // 2. Candlestick series database
  const [candlesDb, setCandlesDb] = useState<Record<string, Candlestick[]>>({});
  
  // 3. Trade queues
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const activeTradesRef = useRef<Trade[]>([]);
  useEffect(() => { activeTradesRef.current = activeTrades; }, [activeTrades]);
  const [globalWinRate, setGlobalWinRate] = useState<number>(50);
  const settledIdsRef = useRef<Set<string>>(new Set());
  const [completedTrades, setCompletedTrades] = useState<Trade[]>(() => {
    const cached = localStorage.getItem('vertex_settled_trades');
    if (cached) {
      try {
        const parsed: Trade[] = JSON.parse(cached);
        const uniqueTrades = parsed.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        return uniqueTrades;
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // 4. Social Copy Feed
  const [socialTrades, setSocialTrades] = useState<SocialTrade[]>([]);

  // 5. Quests Achievements (Persisted in localStorage)
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const cached = localStorage.getItem('vertex_achievements');
    return cached ? JSON.parse(cached) : INITIAL_ACHIEVEMENTS;
  });

  // 6. Gemini Signals Context
  const [aiSignal, setAiSignal] = useState<TradingSignal | null>(null);

  // 7. Popups or Win/Loss toast overlays
  const [toastNotification, setToastNotification] = useState<{
    id: string;
    type: 'WIN' | 'LOSS' | 'LEVEL_UP' | 'ACHIEVEMENT';
    title: string;
    description: string;
  } | null>(null);

  // 8. Auth & KYC Dialog modal controls
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    initialTab: 'login' | 'signup' | 'kyc';
  }>({
    isOpen: false,
    initialTab: 'login',
  });

  // 9. Deposit & Withdrawal controls
  const [bankingModal, setBankingModal] = useState<{
    isOpen: boolean;
    initialTab: 'deposit' | 'withdraw';
  }>({
    isOpen: false,
    initialTab: 'deposit',
  });

  // 10. Admin Back-Office dashboard controller state
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState<boolean>(false);
  const [adminPasscode, setAdminPasscode] = useState('');

  // Audio Context Ref for synthesizers
  const audioCtxRef = useRef<AudioContext | null>(null);

  const currentAsset = assets.find(a => a.id === activeAssetId) || assets[0];
  const activeBalance = account.isLive ? account.balanceLive : account.balanceDemo;

  // Sync state mutations back to LocalStorage
  useEffect(() => {
    localStorage.setItem('vertex_account', JSON.stringify(account));
  }, [account]);

  useEffect(() => {
    localStorage.setItem('vertex_settled_trades', JSON.stringify(completedTrades));
  }, [completedTrades]);

  useEffect(() => {
    localStorage.setItem('vertex_achievements', JSON.stringify(achievements));
  }, [achievements]);

  // Synchronize client storage state with backend server database
  const syncWithBackend = async (accToSync = account) => {
    if (!accToSync || !accToSync.email) return;
    try {
      const response = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accToSync)
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.account) {
          if (data.settings && data.settings.globalWinRate !== undefined) {
            setGlobalWinRate(data.settings.globalWinRate);
          }
          const srvAcc = data.account;
          // Avoid endless cyclic render state triggers, only update if balance or KYC was modified
          if (
            srvAcc.balanceLive !== accToSync.balanceLive ||
            srvAcc.balanceDemo !== accToSync.balanceDemo ||
            srvAcc.kycStatus !== accToSync.kycStatus ||
            srvAcc.adminBalanceVersion !== accToSync.adminBalanceVersion
          ) {
            setAccount(prev => ({
              ...prev,
              balanceLive: srvAcc.balanceLive,
              balanceDemo: srvAcc.balanceDemo,
              kycStatus: srvAcc.kycStatus,
              adminBalanceVersion: srvAcc.adminBalanceVersion
            }));
          }
        }
      }
    } catch (err) {
      console.warn('Real-time ledger sync offline. Operating in local sandbox.', err);
    }
  };

  // Trigger sync on email sign-in / mount
  useEffect(() => {
    if (account.email) {
      syncWithBackend();
    }
  }, [account.email]);

  // Establish live polling (every 4 seconds) so admin updates instantly push to the active frame
  useEffect(() => {
    if (!account.email) return;
    const interval = setInterval(() => {
      syncWithBackend();
    }, 4000);
    return () => clearInterval(interval);
  }, [account.email, account.balanceLive, account.balanceDemo, account.kycStatus]);

  // Audio Synthesizers using browser Web Audio API
  const playSynthSound = (type: 'WIN' | 'LOSS' | 'CLICK' | 'PLACE') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'CLICK') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);
        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'PLACE') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(680, now + 0.18);
        gainNode.gain.setValueAtTime(0.12, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'WIN') {
        // High fidelity upbeat chime chord (two oscillators)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc.type = 'sine';
        osc2.type = 'triangle';

        // Play Major Chime
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.4); // C6

        osc2.frequency.setValueAtTime(329.63, now); // E4
        osc2.frequency.setValueAtTime(392.00, now + 0.1); // G4
        osc2.frequency.exponentialRampToValueAtTime(523.25, now + 0.3); // C5

        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

        gain2.gain.setValueAtTime(0.08, now);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        osc.start(now);
        osc2.start(now);
        osc.stop(now + 0.6);
        osc2.stop(now + 0.6);
      } else if (type === 'LOSS') {
        // Sad sliding descending minor chime
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(261.63, now); // C4
        osc.frequency.exponentialRampToValueAtTime(110.00, now + 0.45); // A2
        
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0.001, now + 0.5);

        osc.start(now);
        osc.stop(now + 0.5);
      }
    } catch (e) {
      console.warn('Web Audio initialization error:', e);
    }
  };

  // 1. Setup Initial Candlestick database for each asset
  useEffect(() => {
    let isMounted = true;
    const initMarket = async () => {
      const db: Record<string, Candlestick[]> = {};
      const newAssets = [...INITIAL_ASSETS];
      
      for (let i = 0; i < newAssets.length; i++) {
        const asset = newAssets[i];
        const candles = await fetchHistoricalData(asset);
        db[asset.id] = candles;
        // Align asset current price with the last candle close
        if (candles.length > 0) {
          asset.price = candles[candles.length - 1].close;
        }
      }
      
      if (isMounted) {
        setCandlesDb(db);
        setAssets(newAssets);
      }
    };
    initMarket();
    return () => { isMounted = false; };
  }, []);

    const liveCryptoPricesRef = useRef<Record<string, number>>({});
  
  useEffect(() => {
    const unsub = binanceStream.subscribe((assetId, price) => {
      liveCryptoPricesRef.current[assetId] = price;
    });
    return unsub;
  }, []);

  // 2. High Frequency Brownian motion simulation loop (every 300ms)
  // Re-calculates current asset prices & updates active candle points without interval tearing
  useEffect(() => {
    const interval = setInterval(() => {
      // Step A: Update all assets prices using category-specific mechanics
      setAssets(prevAssets => {
        const nextAssets = prevAssets.map(asset => {
          let changePercent = 0;
          let forceAbsolutePrice = null;

          if (asset.category === 'crypto' && liveCryptoPricesRef.current[asset.id]) {
            forceAbsolutePrice = liveCryptoPricesRef.current[asset.id];
          } else if (asset.category === 'crypto') {
            const isSpike = Math.random() < 0.05;
            const multiplier = isSpike ? (Math.random() > 0.5 ? 3 : -3) : 1;
            changePercent = (Math.random() - 0.5 + (asset.trend * 0.2)) * asset.volatility * multiplier;
          } else if (asset.category === 'otc') {
            const initialMatch = INITIAL_ASSETS.find(a => a.id === asset.id);
            const meanPrice = initialMatch ? initialMatch.price : asset.price;
            const reversion = (meanPrice - asset.price) * 0.005;
            changePercent = ((Math.random() - 0.5) * asset.volatility) + reversion;
          } else if (asset.category === 'stocks') {
            const wave = Math.sin(Date.now() / 30000) * 0.1;
            changePercent = (Math.random() - 0.5 + wave + (asset.trend * 0.1)) * asset.volatility;
          } else if (asset.category === 'commodities') {
            const wave = Math.sin(Date.now() / 45000) * 0.15;
            changePercent = (Math.random() - 0.5 + wave) * asset.volatility;
          } else if (asset.category === 'indices') {
            const isShakeout = Math.random() < 0.01;
            const multiplier = isShakeout ? -5 : 1.3;
            changePercent = (Math.random() - 0.35 + (asset.trend * 0.05)) * asset.volatility * multiplier;
          } else {
            changePercent = (Math.random() - 0.5 + (asset.trend * 0.1)) * asset.volatility;
          }

          // Admin Profit Control: Nudge price to ensure forced outcome!
          let adminNudge = 0;
          const tradesOnAsset = activeTradesRef.current.filter(t => t.assetId === asset.id);
          if (tradesOnAsset.length > 0) {
            const closest = tradesOnAsset.sort((a, b) => a.expirationTime - b.expirationTime)[0];
            const timeToExpiry = closest.expirationTime - Date.now();
            if (timeToExpiry > 0 && timeToExpiry < 15000) {
              const needsToGoUp = (closest.type === 'UP' && closest.forcedOutcome === 'WON') || (closest.type === 'DOWN' && closest.forcedOutcome === 'LOST');
              const needsToGoDown = (closest.type === 'UP' && closest.forcedOutcome === 'LOST') || (closest.type === 'DOWN' && closest.forcedOutcome === 'WON');
              
              if (needsToGoUp && asset.price <= closest.strikePrice) {
                adminNudge = Math.abs(asset.volatility) * 2;
              } else if (needsToGoDown && asset.price >= closest.strikePrice) {
                adminNudge = -Math.abs(asset.volatility) * 2;
              }
            }
          }
          
          const basePrice = forceAbsolutePrice !== null ? forceAbsolutePrice : asset.price;
          const delta = basePrice * (changePercent + adminNudge);
          const nextPrice = Math.max(0.0001, basePrice + delta);

          return {
            ...asset,
            price: nextPrice,
          };
        });

        // Step B: Atomically synchronize candles with the new asset prices inside the SAME state update!
        setCandlesDb(prevDb => {
          const nextDb = { ...prevDb };
          nextAssets.forEach(activeAsset => {
            const candles = [...(nextDb[activeAsset.id] || [])];
            if (candles.length === 0) return;

            const lastCandle = { ...candles[candles.length - 1] };
            
            // Modify the trailing candle close to match the newest price tick
            lastCandle.close = activeAsset.price;
            if (activeAsset.price > lastCandle.high) lastCandle.high = activeAsset.price;
            if (activeAsset.price < lastCandle.low) lastCandle.low = activeAsset.price;

            candles[candles.length - 1] = lastCandle;
            nextDb[activeAsset.id] = candles;
          });
          return nextDb;
        });

        return nextAssets;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  // 3. Candle Generation interval (starts a brand-new candlestick block every 1 minute)
  useEffect(() => {
    let lastMinute = new Date().getMinutes();
    const candleInterval = setInterval(() => {
      const currentMinute = new Date().getMinutes();
      if (currentMinute !== lastMinute) {
        lastMinute = currentMinute;
        setCandlesDb(prevDb => {
          const nextDb = { ...prevDb };
          Object.keys(nextDb).forEach(assetId => {
            const candles = [...(nextDb[assetId] || [])];
            if (candles.length === 0) return;

            const lastCandle = candles[candles.length - 1];
            // Spawn new candle starting at the previous close price
            const newCandle: Candlestick = {
              time: Date.now(),
              open: lastCandle.close,
              high: lastCandle.close,
              low: lastCandle.close,
              close: lastCandle.close,
            };

            // Append new candle, cap sequence length to 7200 items
            const nextCandles = [...candles, newCandle];
            if (nextCandles.length > 7200) {
              nextCandles.shift();
            }
            nextDb[assetId] = nextCandles;
          });
          return nextDb;
        });
      }
    }, 1000);

    return () => clearInterval(candleInterval);
  }, []);

  // 4. Social mimic trading stream loop (adds random copying triggers every 6 seconds)
  useEffect(() => {
    const randomTraders = ['ZenBroker', 'BinaryMaster', 'Quant_Alpha', 'SatoshiGains', 'OptionsWiz', 'LadyTrade_X'];
    const interval = setInterval(() => {
      const trader = randomTraders[Math.floor(Math.random() * randomTraders.length)];
      // Choose random asset from INITIAL_ASSETS to avoid dependency on reactive assets
      const randomAsset = INITIAL_ASSETS[Math.floor(Math.random() * INITIAL_ASSETS.length)];
      const type: 'UP' | 'DOWN' = Math.random() > 0.5 ? 'UP' : 'DOWN';
      const amount = [50, 100, 200, 500, 1000][Math.floor(Math.random() * 5)];
      
      const newSocial: SocialTrade = {
        id: Math.random().toString(),
        traderName: trader,
        traderAvatar: trader.slice(0, 2).toUpperCase(),
        assetName: randomAsset.name,
        type,
        amount,
        timestamp: Date.now(),
        isWinning: Math.random() > 0.4,
      };

      setSocialTrades(prev => {
        // Prevent duplicate IDs just in case of strict mode double firing
        if (prev.some(t => t.id === newSocial.id)) return prev;
        return [newSocial, ...prev].slice(0, 12);
      });
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // 5. Active Trades Expiration & Settle Checker loop (runs every 500ms)
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const now = Date.now();
      
      // Filter out completed ones
      const pendingTrades: Trade[] = [];
      const settlingTrades: Trade[] = [];

      activeTrades.forEach(trade => {
        if (now >= trade.expirationTime && !settledIdsRef.current.has(trade.id)) {
          settlingTrades.push(trade);
          settledIdsRef.current.add(trade.id);
        } else if (now < trade.expirationTime) {
          pendingTrades.push(trade);
        }
      });

      if (settlingTrades.length > 0) {
        // Settle trades
        const newSettled: Trade[] = [];
        let winCount = 0;
        let isOtcTrade = false;
        let largestTradeAmount = 0;

        settlingTrades.forEach(trade => {
          const associatedAsset = assets.find(a => a.id === trade.assetId);
          if (!associatedAsset) return;

          const settlementPrice = associatedAsset.price;
          let status: 'WON' | 'LOST' | 'DRAW' = 'LOST';
          let payoutAmount = 0;

          if (trade.type === 'UP') {
            if (settlementPrice > trade.strikePrice) status = 'WON';
            else if (settlementPrice === trade.strikePrice) status = 'DRAW';
          } else {
            if (settlementPrice < trade.strikePrice) status = 'WON';
            else if (settlementPrice === trade.strikePrice) status = 'DRAW';
          }

          if (status === 'WON') {
            payoutAmount = trade.investment * (1 + trade.payoutRate / 100);
            winCount++;
          } else if (status === 'DRAW') {
            payoutAmount = trade.investment; // refund
          }

          if (associatedAsset.category === 'otc') {
            isOtcTrade = true;
          }

          if (trade.investment > largestTradeAmount) {
            largestTradeAmount = trade.investment;
          }

          newSettled.push({
            ...trade,
            status,
            settlementPrice,
            payoutAmount,
          });
        });

        // Trigger balance and XP updates
        setAccount(prev => {
          let totalPayout = 0;
          newSettled.forEach(t => {
            totalPayout += t.payoutAmount || 0;
          });

          // Subtracting already invested was done on purchase, so we just add totalPayout
          const demoDelta = prev.isLive ? 0 : totalPayout;
          const liveDelta = prev.isLive ? totalPayout : 0;

          // Gain XP based on wins and participations: 30 XP per trade settled, extra 60 XP for WIN
          const gainedXp = newSettled.reduce((acc, t) => acc + (t.status === 'WON' ? 90 : 30), 0);
          const nextXp = prev.xp + gainedXp;
          const nextLevel = Math.floor(nextXp / 500) + 1;

          if (nextLevel > prev.level) {
            setTimeout(() => {
              triggerToast('LEVEL_UP', 'LEVEL UNLOCKED!', `You reached Level ${nextLevel}! Demo multiplier index enhanced.`);
              playSynthSound('WIN');
            }, 800);
          }

          return {
            ...prev,
            balanceDemo: prev.balanceDemo + demoDelta,
            balanceLive: prev.balanceLive + liveDelta,
            xp: nextXp,
            level: nextLevel,
          };
        });

        // Add to completed ledger
        setCompletedTrades(prev => [...newSettled, ...prev].slice(0, 30));
        
        // Active visual popups and sounds
        newSettled.forEach(settled => {
          const isWin = settled.status === 'WON';
          const isDraw = settled.status === 'DRAW';
          
          if (isWin) {
            playSynthSound('WIN');
            triggerToast(
              'WIN', 
              'TRADE OUT-OF-THE-MONEY VICTORY!', 
              `Successfully forecasted ${settled.assetName} direction! +$${settled.payoutAmount?.toFixed(2)} returned.`
            );
          } else if (isDraw) {
            playSynthSound('CLICK');
            triggerToast(
              'LEVEL_UP', 
              'FLAT OUTCOME DRAW', 
              `Strike price matched exactly. ${settled.assetName} transaction capital returned.`
            );
          } else {
            playSynthSound('LOSS');
            triggerToast(
              'LOSS', 
              'TRADE IN-THE-MONEY LOSS', 
              `Option expired below target strike rate on ${settled.assetName}.`
            );
          }
        });

        // Progress Achievements Engine
        setAchievements(prevAch => {
          return prevAch.map(ach => {
            if (ach.completed) return ach;
            let currentProg = ach.progress;

            if (ach.id === 'first-trade') {
              currentProg += newSettled.length;
            }
            if (ach.id === 'win-streak-3') {
              // Calculate streaks inside completed logs + new settled
              let streak = 0;
              const allSettled = [...newSettled, ...completedTrades];
              for (const t of allSettled) {
                if (t.status === 'WON') streak++;
                else if (t.status === 'LOST') break; // break streak
              }
              currentProg = Math.max(ach.progress, streak);
            }
            if (ach.id === 'otc-win' && isOtcTrade) {
              const otcWinsCount = newSettled.filter(t => t.status === 'WON' && t.assetName.includes('OTC')).length;
              currentProg += otcWinsCount;
            }
            if (ach.id === 'high-roller' && largestTradeAmount >= 1000) {
              currentProg = 1;
            }

            const completed = currentProg >= ach.target;
            if (completed && !ach.completed) {
              setTimeout(() => {
                triggerToast('ACHIEVEMENT', 'QUEST UNLOCKED', `Earned "${ach.title}"! Claim your reward XP now.`);
                playSynthSound('WIN');
              }, 1200);
            }

            return {
              ...ach,
              progress: currentProg,
              completed,
            };
          });
        });
      }

      // Keep pending list in queue
      setActiveTrades(pendingTrades);
    }, 100);

    return () => clearInterval(checkInterval);
  }, [activeTrades, assets, completedTrades]);

  // Helper trigger to popup toasts
  const triggerToast = (type: 'WIN' | 'LOSS' | 'LEVEL_UP' | 'ACHIEVEMENT', title: string, description: string) => {
    setToastNotification({
      id: Math.random().toString(),
      type,
      title,
      description,
    });
  };

  // Close active toast notification
  useEffect(() => {
    if (toastNotification) {
      const t = setTimeout(() => setToastNotification(null), 5000);
      return () => clearTimeout(t);
    }
  }, [toastNotification]);

  // Listen for referral URL parameters and cache them
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref') || params.get('aff');
    if (refCode) {
      const cleanCode = refCode.trim().toUpperCase();
      sessionStorage.setItem('vertex_ref_code', cleanCode);
      
      // Auto-open Sign Up if they are not already logged in!
      if (!account.isLoggedIn) {
        setAuthModal({ isOpen: true, initialTab: 'signup' });
        setTimeout(() => {
          triggerToast(
            'LEVEL_UP', 
            'PARTNER CODE DETECTED', 
            `Welcome to Vertex! Referral code "${cleanCode}" will be automatically applied to your registration.`
          );
        }, 400);
      }
    }
  }, []);

  // Switch between live funds and practice demo
  const toggleAccountType = () => {
    playSynthSound('CLICK');

    // If switching to LIVE account, guard with login and KYC verification
    if (!account.isLive) {
      if (!account.isLoggedIn) {
        setAuthModal({ isOpen: true, initialTab: 'login' });
        triggerToast('LEVEL_UP', 'SIGN IN REQUIRED', 'Please sign in to access the Live Trading Desk.');
        return;
      }
      if (account.kycStatus !== 'VERIFIED') {
        setAuthModal({ isOpen: true, initialTab: 'kyc' });
        triggerToast('LEVEL_UP', 'IDENTITY KYC REQUIRED', 'Please complete identity KYC verification to trade with Live funds.');
        return;
      }
    }

    setAccount(prev => ({
      ...prev,
      isLive: !prev.isLive,
    }));
  };

  // Restructure demo accounts balance
  const refillDemoBalance = () => {
    playSynthSound('WIN');
    setAccount(prev => ({
      ...prev,
      balanceDemo: 10000,
    }));
    triggerToast('LEVEL_UP', 'ACCOUNT REPLENISHED', 'Practice balance refilled to $10,000.00!');
  };

  // Fire call/put options trade action
  const handlePlaceTrade = (type: 'UP' | 'DOWN', amount: number, durationSeconds: number) => {
    // If account is LIVE, enforce session and KYC status checks
    if (account.isLive) {
      if (!account.isLoggedIn) {
        setAuthModal({ isOpen: true, initialTab: 'login' });
        triggerToast('LEVEL_UP', 'SIGN IN REQUIRED', 'Please sign in to purchase live options contracts.');
        return;
      }
      if (account.kycStatus !== 'VERIFIED') {
        setAuthModal({ isOpen: true, initialTab: 'kyc' });
        triggerToast('LEVEL_UP', 'KYC REQUIRED', 'Verify your legal identity to activate Live Trading.');
        return;
      }
    }

    playSynthSound('PLACE');

    // Subtract amount from current account type balance
    setAccount(prev => {
      const demoNext = prev.isLive ? prev.balanceDemo : (prev.balanceDemo - amount);
      const liveNext = prev.isLive ? (prev.balanceLive - amount) : prev.balanceLive;
      const liveVolNext = prev.isLive ? ((prev.liveTradeVolume || 0) + amount) : (prev.liveTradeVolume || 0);
      return {
        ...prev,
        balanceDemo: demoNext,
        balanceLive: liveNext,
        liveTradeVolume: liveVolNext,
      };
    });

    // Create Trade item
    // Assign outcome based on global win rate
    const isWinOutcome = (Math.random() * 100) < globalWinRate;

    const newTrade: Trade = {
      id: Math.random().toString(),
      assetId: currentAsset.id,
      assetName: currentAsset.name,
      type,
      investment: amount,
      strikePrice: currentAsset.price,
      payoutRate: currentAsset.payoutRate,
      status: 'ACTIVE',
      startTime: Date.now(),
      expirationTime: Date.now() + (durationSeconds * 1000),
      durationSeconds,
      forcedOutcome: isWinOutcome ? 'WON' : 'LOST',
    };

    setActiveTrades(prev => [newTrade, ...prev]);
    triggerToast(
      'LEVEL_UP',
      'OPTION CONTRACT ACQUIRED',
      `Placed ${type} contract on ${currentAsset.name} at strike rate $${currentAsset.price.toFixed(currentAsset.price > 1000 ? 1 : 2)}.`
    );
  };

  // Copy trade from social mirror list
  const handleCopySocialTrade = (social: SocialTrade) => {
    const matchingAsset = assets.find(a => a.name === social.assetName);
    if (!matchingAsset) return;

    if (social.amount > activeBalance) {
      alert('Your balance is insufficient to clone this social position.');
      return;
    }

    // Switch view to copied asset
    setActiveAssetId(matchingAsset.id);
    
    // Trigger trade
    handlePlaceTrade(social.type, social.amount, 30); // default copy duration 30s
  };

  // Claim achievement rewards XP
  const handleClaimAchievementXp = (xpReward: number, achId: string) => {
    playSynthSound('WIN');
    setAccount(prev => {
      const nextXp = prev.xp + xpReward;
      const nextLevel = Math.floor(nextXp / 500) + 1;
      return {
        ...prev,
        xp: nextXp,
        level: nextLevel,
      };
    });

    // Mark quest as locked-claimed visually (e.g. set progress back or check state)
    setAchievements(prev => prev.map(a => a.id === achId ? { ...a, completed: true } : a));
    triggerToast('ACHIEVEMENT', 'XP REWARDED', `Claimed +${xpReward} XP! Account rank progress increased.`);
  };

  const activeAssetHistory = candlesDb[activeAssetId] || [];

  return (
    <div className="min-h-screen bg-[#07090f] text-gray-100 flex flex-col font-sans select-none overflow-x-hidden antialiased relative">
      {/* Dynamic Popups Win/Loss Toast Overlay */}
      {toastNotification && (
        <div className="fixed top-20 right-6 z-50 pointer-events-auto animate-in slide-in-from-top-6 duration-200">
          <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-2xl max-w-sm backdrop-blur-md ${
            toastNotification.type === 'WIN' ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-100' :
            toastNotification.type === 'LOSS' ? 'bg-rose-950/80 border-rose-500/30 text-rose-100' :
            toastNotification.type === 'ACHIEVEMENT' ? 'bg-indigo-950/80 border-indigo-500/30 text-indigo-100' :
            'bg-[#0f182e]/90 border-cyan-500/30 text-cyan-100'
          }`}>
            <div className="flex-1">
              <h4 className="text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 leading-none mb-1">
                {toastNotification.type === 'WIN' && <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
                {toastNotification.type === 'ACHIEVEMENT' && <Award className="w-3.5 h-3.5 text-yellow-400" />}
                {toastNotification.title}
              </h4>
              <p className="text-xs leading-relaxed text-gray-300 font-sans">{toastNotification.description}</p>
            </div>
            <button 
              onClick={() => setToastNotification(null)}
              className="text-gray-400 hover:text-white p-0.5 rounded-lg hover:bg-white/5 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <Header 
        account={account}
        toggleAccountType={toggleAccountType}
        refillDemoBalance={refillDemoBalance}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onOpenAuth={() => setAuthModal({ isOpen: true, initialTab: 'login' })}
        onOpenKyc={() => setAuthModal({ isOpen: true, initialTab: 'kyc' })}
        onOpenDeposit={() => setBankingModal({ isOpen: true, initialTab: 'deposit' })}
        onOpenWithdraw={() => setBankingModal({ isOpen: true, initialTab: 'withdraw' })}
        onLogout={() => {
          setAccount({
            balanceDemo: 10000.0,
            balanceLive: 0.0,
            level: 1,
            xp: 0,
            isLive: false,
            badges: [],
            isLoggedIn: false,
            kycStatus: 'UNVERIFIED',
            joinedTournaments: [],
            tournamentScores: {},
            weeklyProfit: 0,
            affiliateBalance: 0,
            referralsCount: 0
          });
          setCompletedTrades([]);
          localStorage.removeItem('vertex_settled_trades');
          playSynthSound('CLICK');
          triggerToast('LEVEL_UP', 'SIGNED OUT', 'Your trading session has been safely closed. Reverted to practice mode.');
        }}
      />

      {/* Core Trading Sandbox layout */}
      <main className="flex-1 flex flex-col xl:flex-row p-2 pb-24 md:p-6 gap-2 md:gap-6 min-h-0 relative">
        {/* Left Side: Chart Section */}
        <div className="flex-1 flex flex-col gap-2 md:gap-6 min-w-0">
          {/* Real-time active trades and transient results box */}
          <TopTradesTracker
            activeTrades={activeTrades}
            completedTrades={completedTrades}
          />

          {/* Compact Asset Selection row situated above the chart */}
          <SmallAssetSelector
            assets={assets}
            currentAsset={currentAsset}
            setCurrentAsset={(asset) => {
              playSynthSound('CLICK');
              setActiveAssetId(asset.id);
              setAiSignal(null);
            }}
          />

          {/* Main SVG dynamic chart desk */}
          <TradingChart 
            asset={currentAsset}
            history={activeAssetHistory}
            activeTrades={activeTrades}
            completedTrades={completedTrades}
          />
          

        </div>

        {/* Right Side: Options Desk Order ticket and Sidebar navigation drawers */}
        <div className="flex flex-col xl:flex-row gap-6 shrink-0 xl:w-[726px]">
          {/* Transaction Ticket panel */}
          <OrderPanel 
            assets={assets}
            currentAsset={currentAsset}
            setCurrentAsset={(asset) => {
              playSynthSound('CLICK');
              setActiveAssetId(asset.id);
              // reset AI signals when switching asset to keep UX clean
              setAiSignal(null);
            }}
            onPlaceTrade={handlePlaceTrade}
            balance={activeBalance}
          />

          {/* Sidebar Drawer panel (Active trades, AI Analyst, Copy Trader Feed) */}
          <Sidebar 
            activeTrades={activeTrades}
            completedTrades={completedTrades}
            socialTrades={socialTrades}
            onCopySocialTrade={handleCopySocialTrade}
            achievements={achievements}
            currentAsset={currentAsset}
            historyCandles={activeAssetHistory}
            aiSignal={aiSignal}
            setAiSignal={setAiSignal}
            onClaimAchievementXp={handleClaimAchievementXp}
            account={account}
            onUpdateAccount={(updated) => setAccount(prev => ({ ...prev, ...updated }))}

            onTriggerToast={triggerToast}
            onPlaySound={playSynthSound}
            onOpenAuth={(tab) => setAuthModal({ isOpen: true, initialTab: tab })}
          />
        </div>
      </main>

      <AuthKycModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal(prev => ({ ...prev, isOpen: false }))}
        initialTab={authModal.initialTab}
        account={account}
        onUpdateAccount={(updated) => setAccount(prev => ({ ...prev, ...updated }))}
        onReplaceAccount={(acc) => setAccount(acc)}
        onClearHistory={() => {
          setCompletedTrades([]);
          localStorage.removeItem('vertex_settled_trades');
        }}
        onTriggerToast={triggerToast}
        onPlaySound={playSynthSound}
      />

      <DepositWithdrawModal
        isOpen={bankingModal.isOpen}
        onClose={() => setBankingModal(prev => ({ ...prev, isOpen: false }))}
        initialTab={bankingModal.initialTab}
        account={account}
        onUpdateAccount={(updated) => setAccount(prev => ({ ...prev, ...updated }))}
        onTriggerToast={triggerToast}
        onPlaySound={playSynthSound}
      />

      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onPlaySound={playSynthSound}
        onTriggerToast={triggerToast}
        currentUserEmail={account.email}
        onRefreshUserBalance={() => account.email && syncWithBackend()}
      />

      {/* Persistent Back-Office Floating Access Button */}
      {true && (
        <button
          onClick={() => {
            playSynthSound('CLICK');
            setIsAdminAuthOpen(true);
            setAdminPasscode('');
          }}
          className="fixed bottom-4 right-4 z-[90] bg-[#0f172a] hover:bg-emerald-600 border border-white/10 hover:border-emerald-400 text-gray-300 hover:text-white px-3.5 py-2 rounded-xl text-[10px] font-bold font-mono shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
          id="backend-admin-badge"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>🔧 BACKEND CONTROL CENTER</span>
        </button>
      )}
      {isAdminAuthOpen && (
        <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#080c14] border border-white/10 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4">
            <h3 className="text-white font-mono uppercase tracking-wider text-center font-bold flex items-center justify-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              Admin Authentication
            </h3>
            <p className="text-xs text-gray-400 text-center font-sans">Please enter the master passcode to access the control center.</p>
            <input
              type="password"
              placeholder="Enter Passcode"
              value={adminPasscode}
              onChange={(e) => setAdminPasscode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (adminPasscode === 'admin123') {
                    playSynthSound('WIN');
                    setIsAdminAuthOpen(false);
                    setIsAdminOpen(true);
                  } else {
                    playSynthSound('LOSS');
                    triggerToast('LOSS', 'ACCESS DENIED', 'Invalid admin passcode.');
                    setAdminPasscode('');
                  }
                }
              }}
              className="w-full bg-[#0a0f1d] border border-white/10 rounded-lg py-2 px-3 text-sm text-center text-white focus:outline-none focus:border-rose-500/50"
              autoFocus
            />
            <div className="flex gap-2">
              <button 
                onClick={() => setIsAdminAuthOpen(false)}
                className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-mono uppercase text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (adminPasscode === 'admin123') {
                    playSynthSound('WIN');
                    setIsAdminAuthOpen(false);
                    setIsAdminOpen(true);
                  } else {
                    playSynthSound('LOSS');
                    triggerToast('LOSS', 'ACCESS DENIED', 'Invalid admin passcode.');
                    setAdminPasscode('');
                  }
                }}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-mono uppercase font-bold transition-colors"
              >
                Authorize
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
