import { apiFetch } from '../lib/apiFetch.ts';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  History, 
  Bot, 
  Users, 
  Trophy, 
  Sparkles, 
  Loader2, 
  ChevronRight, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2, 
  Award,
  Zap,
  Globe,
  Coins,
  Gift,
  Share2,
  Copy,
  Check,
  Edit2,
  ArrowRight,
  Twitter,
  Facebook,
  Send,
  MessageCircle
} from 'lucide-react';
import { Trade, Asset, SocialTrade, Achievement, TradingSignal, UserAccount } from '../types';

interface SidebarProps {
  activeTrades: Trade[];
  completedTrades: Trade[];
  socialTrades: SocialTrade[];
  onCopySocialTrade: (social: SocialTrade) => void;
  achievements: Achievement[];
  currentAsset: Asset;
  historyCandles: any[];
  aiSignal: TradingSignal | null;
  setAiSignal: (signal: TradingSignal | null) => void;
  onClaimAchievementXp: (xp: number, id: string) => void;
  account: UserAccount;
  onUpdateAccount: (updated: Partial<UserAccount>) => void;
  onTriggerToast?: (type: 'WIN' | 'LOSS' | 'LEVEL_UP' | 'ACHIEVEMENT', title: string, description: string) => void;
  onPlaySound?: (type: 'WIN' | 'LOSS' | 'CLICK' | 'PLACE') => void;
  onOpenAuth?: (tab: 'login' | 'signup') => void;
}

export default function Sidebar({
  activeTrades,
  completedTrades,
  socialTrades,
  onCopySocialTrade,
  achievements,
  currentAsset,
  historyCandles,
  aiSignal,
  setAiSignal,
  onClaimAchievementXp,
  account,
  onUpdateAccount,
  onTriggerToast,
  onPlaySound,
  onOpenAuth,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'trades' | 'ai' | 'social' | 'leaderboard' | 'quests' | 'affiliate'>('trades');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiStep, setAiStep] = useState<string>('');
  const [showPricing, setShowPricing] = useState<boolean>(false);
  const [pinActiveTrades, setPinActiveTrades] = useState<boolean>(true);
  const liveActiveTrades = activeTrades.filter(t => t.expirationTime - Date.now() > 0);

  // --- LEADERBOARD & TOURNAMENT STATES ---
  const [leaderboardSubTab, setLeaderboardSubTab] = useState<'ranks' | 'tournaments' | 'weekly'>('ranks');
  const [weeklyPayoutHistory, setWeeklyPayoutHistory] = useState<Array<{
    week: number;
    winner: string;
    prize: number;
    cut: number;
    net: number;
    timestamp: number;
  }>>([
    { week: 24, winner: 'AlphaQuant', prize: 1000, cut: 300, net: 700, timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000 },
    { week: 23, winner: 'PocketPrince', prize: 500, cut: 150, net: 350, timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000 },
    { week: 22, winner: 'OptionWhale_88', prize: 250, cut: 75, net: 175, timestamp: Date.now() - 17 * 24 * 60 * 60 * 1000 },
  ]);

  interface Tournament {
    id: string;
    name: string;
    description: string;
    entryFee: number;
    prizePool: number;
    payouts: { rank: number; prize: number; cut: number; net: number }[];
    participantsCount: number;
    daysRemaining: number;
  }

  const TOURNAMENTS: Tournament[] = [
    {
      id: 'bronze-cup',
      name: 'Bronze Starter Arena',
      description: 'Perfect for climbing option strategists. Low entry fee, robust starting yields.',
      entryFee: 10,
      prizePool: 1000,
      payouts: [
        { rank: 1, prize: 500, cut: 150, net: 350 },
        { rank: 2, prize: 300, cut: 90, net: 210 },
        { rank: 3, prize: 200, cut: 60, net: 140 },
      ],
      participantsCount: 142,
      daysRemaining: 17,
    },
    {
      id: 'silver-pro',
      name: 'Silver Pro League',
      description: 'Mid-stakes battlefield. High volume neural traders compete here on deep volume asset sets.',
      entryFee: 50,
      prizePool: 5000,
      payouts: [
        { rank: 1, prize: 2500, cut: 750, net: 1750 },
        { rank: 2, prize: 1500, cut: 450, net: 1050 },
        { rank: 3, prize: 1000, cut: 300, net: 700 },
      ],
      participantsCount: 89,
      daysRemaining: 17,
    },
    {
      id: 'gold-championship',
      name: 'Gold Whale Championship',
      description: 'Ultra-stakes expert option masters. VIP dashboard status and monumental reward multipliers.',
      entryFee: 200,
      prizePool: 20000,
      payouts: [
        { rank: 1, prize: 10000, cut: 3000, net: 7000 },
        { rank: 2, prize: 6000, cut: 1800, net: 4200 },
        { rank: 3, prize: 4000, cut: 1200, net: 2800 },
      ],
      participantsCount: 41,
      daysRemaining: 17,
    },
  ];

  const handleJoinTournament = (tournamentId: string, fee: number) => {
    onPlaySound?.('CLICK');
    const isLive = account.isLive;
    const currentBalance = isLive ? account.balanceLive : account.balanceDemo;

    if (currentBalance < fee) {
      onTriggerToast?.('LOSS', 'INSUFFICIENT FUNDS', `Your active ${isLive ? 'Live' : 'Demo'} account balance of $${currentBalance.toFixed(2)} is insufficient to cover the $${fee.toFixed(2)} entry ticket.`);
      return;
    }

    const currentJoined = account.joinedTournaments || [];
    if (currentJoined.includes(tournamentId)) {
      onTriggerToast?.('LEVEL_UP', 'ALREADY REGISTERED', 'You are already registered for this tournament!');
      return;
    }

    const nextJoined = [...currentJoined, tournamentId];
    const initialScores = account.tournamentScores || {};
    const nextScores = { ...initialScores, [tournamentId]: 0 };

    if (isLive) {
      onUpdateAccount({
        balanceLive: parseFloat((account.balanceLive - fee).toFixed(2)),
        joinedTournaments: nextJoined,
        tournamentScores: nextScores,
      });
    } else {
      onUpdateAccount({
        balanceDemo: parseFloat((account.balanceDemo - fee).toFixed(2)),
        joinedTournaments: nextJoined,
        tournamentScores: nextScores,
      });
    }

    onPlaySound?.('WIN');
    onTriggerToast?.('LEVEL_UP', 'TOURNAMENT REGISTERED', `Registered successfully for ${TOURNAMENTS.find(t => t.id === tournamentId)?.name}! Entry fee of $${fee.toFixed(2)} was debited.`);
  };

  const handleSimulateWeeklyPayout = () => {
    onPlaySound?.('WIN');
    
    // Determine user status
    const isLive = account.isLive;
    
    // Simulate user ranking 2nd for this week's payouts
    const userPrize = 500;
    const userCut = 150; // 30% cut
    const userNet = 350;

    // Credit user's account if they are logged in and verified, or just Demo/Live active balance
    if (isLive) {
      onUpdateAccount({
        balanceLive: parseFloat((account.balanceLive + userNet).toFixed(2)),
        weeklyProfit: 0, // reset weekly progress
      });
    } else {
      onUpdateAccount({
        balanceDemo: parseFloat((account.balanceDemo + userNet).toFixed(2)),
        weeklyProfit: 0, // reset weekly progress
      });
    }

    // Add to weekly payout history
    const nextWeek = weeklyPayoutHistory.length > 0 ? weeklyPayoutHistory[0].week + 1 : 1;
    const newPayouts = [
      { week: nextWeek, winner: account.fullName || 'You (Trader)', prize: userPrize, cut: userCut, net: userNet, timestamp: Date.now() },
      ...weeklyPayoutHistory,
    ];
    setWeeklyPayoutHistory(newPayouts);

    onTriggerToast?.('WIN', 'WEEKLY PAYOUT RECEIVED', `Week #${nextWeek} has concluded! You won 2nd Place. Prize: $${userPrize.toFixed(2)} | Vertex Platform Cut (30%): $${userCut.toFixed(2)} | Net Paid: +$${userNet.toFixed(2)}!`);
  };

  // --- AFFILIATE PROGRAM STATES & HANDLERS ---
  const defaultAffCode = account.fullName 
    ? account.fullName.replace(/\s+/g, '').toUpperCase().slice(0, 10) 
    : 'TRADER' + account.level;
  const currentAffCode = account.affiliateCode || defaultAffCode;

  const [customCodeInput, setCustomCodeInput] = useState<string>(currentAffCode);
  const [isEditingCode, setIsEditingCode] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [simDepositAmount, setSimDepositAmount] = useState<number>(100);

  // Sync state if account details change
  useEffect(() => {
    setCustomCodeInput(currentAffCode);
  }, [account.affiliateCode, account.fullName]);

  const handleSaveAffCode = () => {
    if (!customCodeInput || customCodeInput.trim().length < 3) {
      onTriggerToast?.('LOSS', 'INVALID CODE', 'Affiliate code must be at least 3 characters.');
      return;
    }
    const cleanCode = customCodeInput.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!cleanCode) {
      onTriggerToast?.('LOSS', 'INVALID CODE', 'Code can only contain alphanumeric characters.');
      return;
    }
    onUpdateAccount({
      affiliateCode: cleanCode
    });
    setIsEditingCode(false);
    onPlaySound?.('WIN');
    onTriggerToast?.('LEVEL_UP', 'REFERRAL CODE UPDATED', `Your unique referral code is now "${cleanCode}".`);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}${window.location.pathname}?ref=${currentAffCode}`;
    navigator.clipboard.writeText(link).then(() => {
      setIsCopied(true);
      onPlaySound?.('CLICK');
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleShare = (platform: 'twitter' | 'facebook' | 'telegram' | 'whatsapp') => {
    const link = `${window.location.origin}${window.location.pathname}?ref=${currentAffCode}`;
    const text = `Join me on Vertex Market and start trading today!`;
    let url = '';
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`;
        break;
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + link)}`;
        break;
    }
    
    window.open(url, '_blank');
    onPlaySound?.('CLICK');
  };

  const handleWithdrawAffiliate = () => {
    const currentBalance = account.affiliateBalance || 0;
    if (currentBalance < 30) {
      onTriggerToast?.('LOSS', 'INSUFFICIENT FUNDS', `Minimum withdrawal is $30.00. You have $${currentBalance.toFixed(2)}.`);
      return;
    }

    // Transfer all commissions to Live Balance
    const newLiveBalance = account.balanceLive + currentBalance;
    onUpdateAccount({
      affiliateBalance: 0,
      balanceLive: parseFloat(newLiveBalance.toFixed(2))
    });

    onPlaySound?.('WIN');
    onTriggerToast?.('LEVEL_UP', 'COMMISSION CONVERTED', `Successfully transferred $${currentBalance.toFixed(2)} to your Live Balance!`);
  };

  const handleSimulateReferral = () => {
    // Generate a simulated referral name
    const traderNames = ['AlphaWolf_99', 'CryptoSniper', 'OptionGod', 'LeverageKing', 'ZenTrader', 'BullRunner', 'BearSlayer'];
    const randomName = traderNames[Math.floor(Math.random() * traderNames.length)] + '_' + Math.floor(Math.random() * 90 + 10);
    
    // Earn 15% of the deposit amount
    const commission = parseFloat((simDepositAmount * 0.15).toFixed(2));
    const currentCount = account.referralsCount || 0;
    const currentAffBalance = account.affiliateBalance || 0;

    onUpdateAccount({
      referralsCount: currentCount + 1,
      affiliateBalance: parseFloat((currentAffBalance + commission).toFixed(2))
    });

    onPlaySound?.('WIN');
    onTriggerToast?.('LEVEL_UP', 'REFERRAL DEPOSIT RECEIVED', `Referral @${randomName} deposited $${simDepositAmount}.00. You earned 15% (+$${commission.toFixed(2)})!`);
  };

  const handleSubscribe = (plan: 'monthly_basic' | 'monthly_pro' | 'yearly_vip') => {
    let cost = 0;
    let planName = '';
    if (plan === 'monthly_basic') {
      cost = 20;
      planName = 'Basic Month Plan';
    } else if (plan === 'monthly_pro') {
      cost = 35;
      planName = 'Pro Month Plan';
    } else if (plan === 'yearly_vip') {
      cost = 200;
      planName = 'VIP Year Plan';
    }

    const isLiveActive = account.isLive;
    const currentBalance = isLiveActive ? account.balanceLive : account.balanceDemo;

    if (currentBalance < cost) {
      onTriggerToast?.('LOSS', 'INSUFFICIENT FUNDS', `Your active ${isLiveActive ? 'Live' : 'Demo'} balance is $${currentBalance.toFixed(2)}. You need $${cost.toFixed(2)} to subscribe.`);
      return;
    }

    // Deduct cost and set subscription
    if (isLiveActive) {
      onUpdateAccount({
        balanceLive: parseFloat((account.balanceLive - cost).toFixed(2)),
        aiSubscription: plan,
        aiSubscriptionExpires: Date.now() + (plan === 'yearly_vip' ? 365 : 30) * 24 * 60 * 60 * 1000,
      });
    } else {
      onUpdateAccount({
        balanceDemo: parseFloat((account.balanceDemo - cost).toFixed(2)),
        aiSubscription: plan,
        aiSubscriptionExpires: Date.now() + (plan === 'yearly_vip' ? 365 : 30) * 24 * 60 * 60 * 1000,
      });
    }

    setShowPricing(false);
    onPlaySound?.('WIN');
    onTriggerToast?.('LEVEL_UP', 'SUBSCRIBED SUCCESSFULLY', `Unlocked unlimited AI Technical Analyst under the ${planName}!`);
  };

  const handleTriggerAiAnalysis = async () => {
    const isSubscribed = account.aiSubscription && account.aiSubscription !== 'none';
    const usedCount = account.aiAnalysesUsed || 0;

    if (!isSubscribed && usedCount >= 5) {
      onTriggerToast?.('LOSS', 'TRIAL EXPIRED', 'You have exhausted your 5 free trial analyses. Please choose a subscription plan to continue.');
      setShowPricing(true);
      return;
    }

    setAiLoading(true);
    setAiStep('Gathering market liquidity data...');
    
    // Smooth step-by-step loading simulation for premium feel
    setTimeout(() => setAiStep('Calculating Relative Strength Index (RSI)...'), 600);
    setTimeout(() => setAiStep('Evaluating MACD & EMA crossovers...'), 1200);
    setTimeout(() => setAiStep('Querying Gemini market intelligence model...'), 1800);

    setTimeout(async () => {
      try {
        const response = await apiFetch('/api/gemini/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assetName: currentAsset.name,
            category: currentAsset.category,
            price: currentAsset.price,
            change24h: currentAsset.change24h,
            history: historyCandles,
          }),
        });
        const data = await response.json();
        setAiSignal({
          assetId: currentAsset.id,
          sentiment: data.sentiment,
          signal: data.signal,
          strength: data.strength,
          reason: data.reason,
          timeframe: '1m',
          timestamp: Date.now(),
        });

        // Update analyses count if they don't have an active subscription
        if (!isSubscribed) {
          const nextCount = usedCount + 1;
          onUpdateAccount({
            aiAnalysesUsed: nextCount
          });
          onTriggerToast?.('WIN', 'ANALYSIS READY', `Evaluation finalized! Free trials remaining: ${5 - nextCount}/5.`);
        } else {
          onTriggerToast?.('WIN', 'PREMIUM ANALYSIS READY', `Grounded in high-frequency patterns under your Active Premium Plan.`);
        }
      } catch (err) {
        console.error('AI Analysis failed:', err);
      } finally {
        setAiLoading(false);
        setAiStep('');
      }
    }, 2400);
  };

  // Simulated Leaderboard data
  const leaderboardData = [
    { rank: 1, name: 'AlphaQuant', profit: 48920, winRate: 84, avatar: 'AQ' },
    { rank: 2, name: 'PocketPrince', profit: 32410, winRate: 79, avatar: 'PP' },
    { rank: 3, name: 'OptionWhale_88', profit: 28450, winRate: 75, avatar: 'OW' },
    { rank: 4, name: 'BTC_Bull_Rider', profit: 19800, winRate: 72, avatar: 'BR' },
    { rank: 5, name: 'VertexKing', profit: 15400, winRate: 71, avatar: 'VK' },
  ];

  return (
    <div className="w-full xl:w-[380px] bg-[#0a0c10] border border-white/10 rounded-xl flex flex-col overflow-hidden h-[620px] select-none" id="vertex-sidebar">
      {/* Sidebar Tabs Controls */}
      <div className="flex bg-white/5 border-b border-white/10 p-1 gap-1">
        <button
          onClick={() => setActiveTab('trades')}
          className={`flex-1 py-2 rounded text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
            activeTab === 'trades' ? 'bg-white/10 text-emerald-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          title="Active & History Trades"
        >
          <History className="w-4 h-4" />
          <span className="text-[9px] tracking-wider uppercase">Trades</span>
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-2 rounded text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
            activeTab === 'ai' ? 'bg-white/10 text-emerald-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          title="Gemini AI Technical Advisor"
        >
          <Bot className="w-4 h-4 text-purple-400 animate-pulse" />
          <span className="text-[9px] tracking-wider uppercase">AI Advisor</span>
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`flex-1 py-2 rounded text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
            activeTab === 'social' ? 'bg-white/10 text-emerald-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          title="Social Mirror Trading Feed"
        >
          <Users className="w-4 h-4 text-emerald-500" />
          <span className="text-[9px] tracking-wider uppercase">Social</span>
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 py-2 rounded text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
            activeTab === 'leaderboard' ? 'bg-white/10 text-emerald-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          title="Top Traders"
        >
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span className="text-[9px] tracking-wider uppercase">Ranks</span>
        </button>
        <button
          onClick={() => setActiveTab('quests')}
          className={`flex-1 py-2 rounded text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
            activeTab === 'quests' ? 'bg-white/10 text-emerald-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          title="Achievements & Progression"
        >
          <Award className="w-4 h-4 text-emerald-500" />
          <span className="text-[9px] tracking-wider uppercase">Quests</span>
        </button>
        <button
          onClick={() => setActiveTab('affiliate')}
          className={`flex-1 py-2 rounded text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
            activeTab === 'affiliate' ? 'bg-white/10 text-emerald-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          title="Affiliate Program"
        >
          <Gift className="w-4 h-4 text-emerald-400" />
          <span className="text-[9px] tracking-wider uppercase">Partners</span>
        </button>
      </div>

      {/* Pinned active positions switch option */}
      <div className="bg-white/5 px-3 py-1.5 border-b border-white/10 flex items-center justify-between text-[10px] font-mono shrink-0">
        <span className="text-gray-400 uppercase tracking-wider">Pin open trades to side</span>
        <button 
          onClick={() => setPinActiveTrades(!pinActiveTrades)}
          className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            pinActiveTrades ? 'bg-emerald-600' : 'bg-white/10'
          }`}
          title="Toggle persistent open positions sidebar desk view"
        >
          <span
            className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              pinActiveTrades ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Tab Panels Body */}
      <div className="flex-1 p-4 overflow-y-auto min-h-0 bg-[#050608]">
        {/* TAB 1: TRADES LIST (ACTIVE AND HISTORY) */}
        {activeTab === 'trades' && (
          <div className="flex flex-col gap-4 h-full" id="trades-tab-panel">
            {/* Active options queue */}
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-xs font-bold text-gray-200 tracking-wide">ACTIVE QUEUE</span>
                <span className="bg-emerald-500/10 text-emerald-400 font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                  {liveActiveTrades.length} Active
                </span>
              </div>

              {liveActiveTrades.length === 0 ? (
                <div className="border border-dashed border-white/10 rounded p-6 text-center text-xs text-gray-500 font-sans">
                  No options are currently active. Place a CALL or PUT action.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {liveActiveTrades.map(trade => {
                    const remaining = Math.max(0, Math.ceil((trade.expirationTime - Date.now()) / 1000));
                    const isCall = trade.type === 'UP';
                    
                    return (
                      <div key={trade.id} className="bg-white/5 border border-white/10 rounded p-3 flex flex-col gap-2 shadow-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${isCall ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            <span className="text-white text-xs font-semibold">{trade.assetName}</span>
                          </div>
                          <span className={`font-mono transition-all duration-300 ${
                            remaining <= 5 
                              ? 'text-red-500 text-[10px] font-bold animate-pulse' 
                              : 'text-emerald-400 text-xs font-bold'
                          }`}>
                            {remaining}s left
                          </span>
                        </div>

                        {/* Progress Bar remaining time */}
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${isCall ? 'bg-emerald-500' : 'bg-rose-500'} rounded-full`}
                            style={{ width: `${(remaining / trade.durationSeconds) * 100}%` }}
                          ></div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                          <div>Amt: <span className="text-white font-medium">${trade.investment}</span></div>
                          <div>Strike: <span className="text-white font-medium">${trade.strikePrice.toFixed(trade.strikePrice > 1000 ? 1 : 2)}</span></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Settled trades history */}
            <div className="flex-1 overflow-y-auto">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-xs font-bold text-gray-200 tracking-wide">SETTLED LOGS</span>
                <span className="text-gray-500 font-mono text-[10px]">Recent</span>
              </div>

              {completedTrades.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-500 font-sans border border-white/5 rounded">
                  No settled positions in this session.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {completedTrades.map(trade => {
                    const isWin = trade.status === 'WON';
                    const isDraw = trade.status === 'DRAW';
                    const isCall = trade.type === 'UP';

                    return (
                      <div key={trade.id} className="bg-white/5 border border-white/5 rounded p-3 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded ${
                            isWin ? 'bg-emerald-500/10 text-emerald-400' : 
                            isDraw ? 'bg-gray-500/10 text-gray-400' : 
                            'bg-rose-500/10 text-rose-400'
                          }`}>
                            {isCall ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <div className="text-white text-xs font-semibold leading-tight">{trade.assetName}</div>
                            <div className="text-[9px] text-gray-500 font-mono mt-0.5">
                              Strike: ${trade.strikePrice.toFixed(trade.strikePrice > 1000 ? 1 : 2)}
                            </div>
                          </div>
                        </div>

                        <div className="text-right font-mono">
                          <div className={`text-xs font-bold ${
                            isWin ? 'text-emerald-400' : 
                            isDraw ? 'text-gray-400' : 
                            'text-gray-500'
                          }`}>
                            {isWin ? `+$${trade.payoutAmount?.toFixed(2)}` : isDraw ? 'REFUND' : '-$0'}
                          </div>
                          <div className="text-[9px] text-gray-500 mt-0.5">
                            Yield: {trade.payoutRate}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: GEMINI AI TECHNICAL ADVISOR */}
        {activeTab === 'ai' && (
          <div className="flex flex-col h-full gap-3.5" id="ai-tab-panel">
            {showPricing || (!(account.aiSubscription && account.aiSubscription !== 'none') && (5 - (account.aiAnalysesUsed || 0)) <= 0) ? (
              <div className="flex flex-col h-full gap-3 font-sans overflow-y-auto" id="ai-pricing-panel">
                {/* Header */}
                <div className="bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-500/15 rounded-xl p-4 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 blur-2xl rounded-full"></div>
                  <Bot className="w-9 h-9 text-purple-400 mx-auto mb-2" />
                  <h4 className="text-white text-xs font-bold tracking-wider uppercase">AI Option Analyst Premium</h4>
                  <p className="text-[10px] text-gray-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
                    {!(account.aiSubscription && account.aiSubscription !== 'none') && (5 - (account.aiAnalysesUsed || 0)) <= 0 ? (
                      <span className="text-rose-400 font-semibold uppercase tracking-wide">Your 5 free trial analyses have expired.</span>
                    ) : (
                      <span>Upgrade to run unlimited quantitative technical evaluations.</span>
                    )}
                  </p>
                </div>

                {/* Pricing Options */}
                <div className="flex flex-col gap-2.5">
                  {/* Option 1: Basic */}
                  <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col gap-2 relative hover:border-white/10 transition-all">
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="text-[11px] font-bold text-white uppercase tracking-wider">Basic Plan</h5>
                        <span className="text-[9px] text-gray-400 block mt-0.5">Unlimited technical reviews</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-emerald-400 font-mono">$20</span>
                        <span className="text-[8px] text-gray-500 block uppercase font-mono">/ mo</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSubscribe('monthly_basic')}
                      className="w-full py-1.5 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 hover:border-purple-500/50 text-purple-300 font-sans font-bold text-[10px] rounded transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-98"
                    >
                      <span>Activate Basic Monthly</span>
                    </button>
                  </div>

                  {/* Option 2: Pro */}
                  <div className="bg-gradient-to-br from-[#130d22] to-[#0a0c10] border-2 border-purple-500/30 rounded-xl p-3 flex flex-col gap-2 relative hover:border-purple-500/50 transition-all">
                    <div className="absolute top-0 right-3 -translate-y-1/2 bg-purple-500 text-black text-[7px] font-mono font-extrabold uppercase py-0.5 px-2 rounded-full tracking-widest shadow-lg">
                      Popular
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">Pro Monthly</h5>
                        <span className="text-[9px] text-gray-400 block mt-0.5">Faster priority queue models</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-purple-400 font-mono">$35</span>
                        <span className="text-[8px] text-gray-500 block uppercase font-mono">/ mo</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSubscribe('monthly_pro')}
                      className="w-full py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-sans font-bold text-[10px] rounded transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-98 shadow-lg shadow-purple-950/60"
                    >
                      <Sparkles className="w-3 h-3 text-yellow-300" />
                      <span>Activate Pro Monthly</span>
                    </button>
                  </div>

                  {/* Option 3: VIP */}
                  <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col gap-2 relative hover:border-white/10 transition-all">
                    <div className="absolute top-0 right-3 -translate-y-1/2 bg-emerald-500 text-black text-[7px] font-mono font-extrabold uppercase py-0.5 px-2 rounded-full tracking-widest shadow-lg">
                      Best Value
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="text-[11px] font-bold text-white uppercase tracking-wider">VIP Annual</h5>
                        <span className="text-[9px] text-gray-400 block mt-0.5">1-Year coverage & VIP Priority badge</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-emerald-400 font-mono">$200</span>
                        <span className="text-[8px] text-gray-500 block uppercase font-mono">/ yr</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSubscribe('yearly_vip')}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-[10px] rounded transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-98 shadow-md shadow-emerald-950/40"
                    >
                      <span>Activate VIP Yearly</span>
                    </button>
                  </div>
                </div>

                {/* Back Button */}
                {5 - (account.aiAnalysesUsed || 0) > 0 && (
                  <button
                    onClick={() => setShowPricing(false)}
                    className="w-full mt-1.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-sans font-medium text-[10px] rounded transition-all text-center cursor-pointer"
                  >
                    ← Return to Option Analyst ({5 - (account.aiAnalysesUsed || 0)} free remaining)
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3.5 h-full">
                {/* Trial / Premium Banner */}
                <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-mono">
                  {account.aiSubscription && account.aiSubscription !== 'none' ? (
                    <div className="flex items-center gap-1.5 text-purple-400">
                      <Zap className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                      <span className="uppercase tracking-wider font-extrabold">Active: {account.aiSubscription.replace('_', ' ')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Bot className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Free Trial: {5 - (account.aiAnalysesUsed || 0)} / 5 remaining</span>
                    </div>
                  )}
                  
                  <button
                    onClick={() => { setShowPricing(true); onPlaySound?.('CLICK'); }}
                    className="text-emerald-400 hover:text-emerald-300 uppercase tracking-widest font-extrabold flex items-center gap-0.5"
                  >
                    <span>{account.aiSubscription && account.aiSubscription !== 'none' ? 'View Plans' : 'Upgrade'}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="bg-[#0a0c10] border border-white/10 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-2xl rounded-full"></div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-500/15 rounded border border-purple-500/20 shadow-lg shadow-purple-500/5 text-purple-400">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-bold tracking-tight">Gemini Option Analyst</h4>
                      <p className="text-[10px] text-purple-300 font-sans mt-0.5 leading-relaxed">
                        Uses multi-sequence neural pattern models to technical-evaluate charts on-demand.
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-white/5"></div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-sans">Active evaluation target:</span>
                    <span className="text-white font-mono font-bold text-sm">{currentAsset.name}</span>
                  </div>

                  {/* Action Button */}
                  {!aiLoading ? (
                    <button
                      onClick={handleTriggerAiAnalysis}
                      className="w-full py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-xs active:scale-98 transition-all flex items-center justify-center gap-2 border border-emerald-500/20 shadow cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                      <span>Run Quantitative Technical Audit</span>
                    </button>
                  ) : (
                    <div className="w-full flex flex-col items-center justify-center gap-2 py-3 bg-[#050608] border border-white/5 rounded font-sans">
                      <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                      <span className="text-xs text-purple-300 font-medium">{aiStep}</span>
                    </div>
                  )}
                </div>

                {/* AI Response Output Panel */}
                {aiSignal ? (
                  <div className="flex-1 overflow-y-auto bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 font-sans">
                    {/* Sentiment & Signal Gauge */}
                    <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl p-2.5">
                      <div>
                        <span className="text-[9px] text-gray-500 font-mono block uppercase tracking-wider">AI RECOMMENDATION</span>
                        <span className={`text-base font-extrabold tracking-tight ${
                          aiSignal.signal.includes('BUY') ? 'text-emerald-400' : 
                          aiSignal.signal.includes('SELL') ? 'text-rose-400' : 'text-gray-400'
                        }`}>
                          {aiSignal.signal}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-gray-500 font-mono block uppercase tracking-wider">SIGNAL STRENGTH</span>
                        <span className="text-base font-extrabold font-mono text-emerald-400">
                          {aiSignal.strength}%
                        </span>
                      </div>
                    </div>

                    {/* Narrative Explanation */}
                    <div>
                      <span className="text-[10px] text-gray-500 font-mono block uppercase tracking-wider mb-1">TECHNICAL BREAKDOWN</span>
                      <p className="text-xs text-gray-300 leading-relaxed font-sans bg-white/5 border border-white/5 p-3 rounded-lg text-justify select-text">
                        {aiSignal.reason}
                      </p>
                    </div>

                    <div className="text-[10px] text-gray-500 font-mono text-center border-t border-white/10 pt-2">
                      Evaluation finalized. Grounded in 1-Minute historical liquidity sequences.
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl p-6 text-center text-xs text-gray-500">
                    <Bot className="w-8 h-8 text-purple-500/20 mb-2" />
                    <p>Request market patterns analysis to print expert intelligence parameters.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SOCIAL MIRROR FEED */}
        {activeTab === 'social' && (
          <div className="flex flex-col gap-3 h-full" id="social-tab-panel">
            <div className="bg-white/5 border border-white/10 p-3 rounded">
              <p className="text-[10px] text-emerald-400 leading-relaxed font-sans font-medium">
                <strong>Social Mirror Feed:</strong> View active options trades of top-ranked traders. Click **Copy** to instantly execute an identical position on your ledger!
              </p>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 custom-scrollbar">
              {socialTrades.map(social => {
                const isCall = social.type === 'UP';
                return (
                  <div key={social.id} className="bg-white/5 border border-white/10 rounded p-3 flex items-center justify-between shadow-sm animate-in slide-in-from-right-3 duration-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white font-bold text-xs select-none">
                        {social.traderAvatar}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1">
                          {social.traderName}
                          <span className="text-[9px] text-emerald-500 font-mono font-medium">★★</span>
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5 flex items-center gap-1.5">
                          <span>{social.assetName}</span>
                          <span className={isCall ? 'text-emerald-400' : 'text-rose-400'}>
                            {isCall ? '▲ CALL' : '▼ PUT'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="text-right font-mono">
                        <div className="text-xs font-bold text-gray-300">${social.amount}</div>
                        <div className="text-[9px] text-gray-500">Vol.</div>
                      </div>
                      <button
                        onClick={() => onCopySocialTrade(social)}
                        className="px-2.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-[10px] active:scale-95 transition-all uppercase"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: LEADERBOARD & TOURNAMENTS */}
        {activeTab === 'leaderboard' && (
          <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1" id="leaderboard-tab-panel">
            {/* Sub-Tabs Selector */}
            <div className="flex bg-[#060a12]/80 border border-white/5 rounded-lg p-1 gap-1 shrink-0 font-sans">
              <button
                onClick={() => { setLeaderboardSubTab('ranks'); onPlaySound?.('CLICK'); }}
                className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  leaderboardSubTab === 'ranks' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Leaders
              </button>
              <button
                onClick={() => { setLeaderboardSubTab('tournaments'); onPlaySound?.('CLICK'); }}
                className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  leaderboardSubTab === 'tournaments' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Tournaments
              </button>
              <button
                onClick={() => { setLeaderboardSubTab('weekly'); onPlaySound?.('CLICK'); }}
                className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  leaderboardSubTab === 'weekly' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Weekly Payouts
              </button>
            </div>

            {/* Sub-Tab 1: LEADERS */}
            {leaderboardSubTab === 'ranks' && (
              <div className="flex flex-col gap-2.5">
                <div className="bg-[#0b1222]/30 border border-white/5 p-3 rounded-xl flex items-center justify-between font-sans">
                  <div>
                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">LEADERBOARD RANGE</span>
                    <span className="text-xs font-bold text-white uppercase">Today's Profit Rankings</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Active</span>
                </div>

                <div className="flex flex-col gap-2">
                  {leaderboardData.map(leader => (
                    <div key={leader.rank} className="bg-[#0d111a] border border-white/5 rounded-xl p-3 flex items-center justify-between hover:border-white/10 transition-all font-sans">
                      <div className="flex items-center gap-3">
                        <div className="w-6 text-center font-mono font-bold text-xs text-gray-400">
                          {leader.rank === 1 ? '🥇' : leader.rank === 2 ? '🥈' : leader.rank === 3 ? '🥉' : `#${leader.rank}`}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500/20 to-indigo-500/10 flex items-center justify-center font-bold text-xs text-emerald-400 border border-white/10 shadow">
                          {leader.avatar}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{leader.name}</div>
                          <div className="text-[9px] font-mono text-gray-500">Win Rate: {leader.winRate}%</div>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <div className="text-xs font-bold text-emerald-400">+${leader.profit.toLocaleString()}</div>
                        <div className="text-[8px] text-gray-500 uppercase tracking-widest">Profit</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-Tab 2: TOURNAMENTS */}
            {leaderboardSubTab === 'tournaments' && (
              <div className="flex flex-col gap-3 font-sans">
                <div className="bg-gradient-to-br from-purple-950/20 to-slate-900 border border-purple-500/15 rounded-xl p-3.5 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 blur-2xl rounded-full"></div>
                  <Trophy className="w-7 h-7 text-purple-400 mx-auto mb-1.5 animate-pulse" />
                  <h4 className="text-white text-xs font-bold uppercase tracking-wider">Vertex Monthly Tournaments</h4>
                  <p className="text-[9px] text-gray-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
                    Choose your stake, join the monthly option arena, and scale the ranks. Winners receive payouts directly to their balance.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {TOURNAMENTS.map(t => {
                    const isJoined = account.joinedTournaments?.includes(t.id);
                    const userScore = account.tournamentScores?.[t.id] || 0;
                    return (
                      <div key={t.id} className="bg-[#0d111a] border border-white/5 rounded-xl p-3 flex flex-col gap-2.5 relative hover:border-white/10 transition-all">
                        {isJoined && (
                          <div className="absolute top-3 right-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[8px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full animate-pulse">
                            Active Entry
                          </div>
                        )}
                        <div>
                          <h5 className="text-xs font-bold text-white uppercase tracking-wide">{t.name}</h5>
                          <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{t.description}</p>
                        </div>

                        <div className="grid grid-cols-2 bg-white/5 border border-white/5 rounded-lg p-2 text-[10px] font-mono">
                          <div>
                            <span className="text-gray-500 block uppercase text-[8px]">ENTRY FEE</span>
                            <span className="text-white font-extrabold">${t.entryFee}</span>
                          </div>
                          <div>
                            <span className="text-purple-400 block uppercase text-[8px]">TOTAL PRIZE POOL</span>
                            <span className="text-purple-300 font-extrabold">${t.prizePool.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Ranges of payouts */}
                        <div className="bg-[#060910] border border-white/5 rounded-lg p-2 text-[9px] font-mono flex flex-col gap-1.5">
                          <span className="text-gray-500 uppercase tracking-wider text-[8px] block">PAYOUT STAGES (MINUS 30% PLATFORM CUT)</span>
                          {t.payouts.map(p => (
                            <div key={p.rank} className="flex justify-between items-center text-gray-300">
                              <span>Rank #{p.rank}:</span>
                              <span className="text-right">
                                <span className="line-through text-gray-600 mr-1.5">${p.prize}</span>
                                <span className="text-emerald-400 font-bold">${p.net}</span>
                                <span className="text-[8px] text-gray-500 font-sans ml-1">(30% Cut: -${p.cut})</span>
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Register Action */}
                        {isJoined ? (
                          <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2 text-xs font-mono">
                            <span className="text-gray-400 text-[10px]">Your Tournament Score:</span>
                            <span className="text-emerald-400 font-bold">+${userScore.toFixed(2)}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleJoinTournament(t.id, t.entryFee)}
                            className="w-full py-2 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 font-sans font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1 shadow-inner shadow-purple-900/20"
                          >
                            <Coins className="w-3.5 h-3.5 text-purple-400" />
                            <span>Register & Pay Entry (${t.entryFee})</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sub-Tab 3: WEEKLY PAYOUTS */}
            {leaderboardSubTab === 'weekly' && (
              <div className="flex flex-col gap-3 font-sans">
                {/* Countdown & simulation banner */}
                <div className="bg-[#0e1423] border border-white/10 rounded-xl p-3.5 flex flex-col gap-2.5 relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-semibold uppercase tracking-wider">Weekly Settle Clock</span>
                    <span className="text-rose-400 font-mono font-bold animate-pulse">2d 11h 45m</span>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-relaxed text-justify">
                    Active option portfolios are audited every 7 days. Payouts are distributed to top performing users. We automatically deduct a <strong className="text-emerald-400">30% platform cut</strong> on all distributions.
                  </p>

                  <button
                    onClick={handleSimulateWeeklyPayout}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all active:scale-95 cursor-pointer shadow-md shadow-emerald-950/20 border border-emerald-500/10 flex items-center justify-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                    <span>Trigger Week-End Settlement</span>
                  </button>
                </div>

                {/* Simulated Platform Cuts display */}
                <div className="p-2.5 bg-purple-950/20 border border-purple-500/20 rounded-xl text-[10px] font-mono text-purple-300 flex items-center justify-between">
                  <span>VERTEX platform profit:</span>
                  <span className="font-extrabold text-emerald-400">30% platform cut enabled</span>
                </div>

                {/* Ledger Historical payouts */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block px-1">Recent Payout Ledger</span>
                  {weeklyPayoutHistory.map((h, i) => (
                    <div key={i} className="bg-[#0d111a] border border-white/5 rounded-xl p-3 flex flex-col gap-1.5 font-sans">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Week #{h.week} Payout</span>
                        <span className="text-[9px] text-gray-500 font-mono">Completed</span>
                      </div>
                      <div className="h-px bg-white/5"></div>
                      <div className="grid grid-cols-2 gap-y-1 text-[10px] font-mono text-gray-400">
                        <div>Recipient:</div>
                        <div className="text-right text-white font-semibold">{h.winner}</div>
                        
                        <div>Gross Prize:</div>
                        <div className="text-right text-gray-300">${h.prize.toLocaleString()}</div>
                        
                        <div>Platform Cut (30%):</div>
                        <div className="text-right text-rose-400">-${h.cut.toLocaleString()}</div>
                        
                        <div className="border-t border-white/5 pt-1 mt-0.5 text-white">Net Distributed:</div>
                        <div className="text-right text-emerald-400 border-t border-white/5 pt-1 mt-0.5 font-bold">${h.net.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: QUESTS & PROGRESSION */}
        {activeTab === 'quests' && (
          <div className="flex flex-col gap-3 h-full" id="quests-tab-panel">
            <div className="bg-white/5 border border-white/10 p-3 rounded flex items-center justify-between">
              <span className="text-xs font-bold text-gray-200 tracking-wide">ACHIEVEMENTS DESK</span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">Level Up</span>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 custom-scrollbar">
              {achievements.map(achievement => {
                const percent = Math.min((achievement.progress / achievement.target) * 100, 100);
                const isClaimed = achievement.completed; // or tracked locally
                const isClaimable = achievement.progress >= achievement.target && !isClaimed;

                return (
                  <div key={achievement.id} className="bg-white/5 border border-white/5 rounded p-3 flex flex-col gap-2.5 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded ${isClaimed ? 'bg-gray-500/10 text-gray-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
                          {achievement.iconName === 'Zap' ? <Zap className="w-3.5 h-3.5" /> :
                           achievement.iconName === 'Globe' ? <Globe className="w-3.5 h-3.5" /> :
                           achievement.iconName === 'Coins' ? <Coins className="w-3.5 h-3.5" /> :
                           achievement.iconName === 'Bot' ? <Bot className="w-3.5 h-3.5" /> :
                           <Sparkles className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <h5 className={`text-xs font-bold leading-tight ${isClaimed ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                            {achievement.title}
                          </h5>
                          <p className="text-[9px] text-gray-500 mt-0.5 leading-relaxed">{achievement.description}</p>
                        </div>
                      </div>

                      {/* Claim Button or Reward indicator */}
                      {isClaimable ? (
                        <button
                          onClick={() => onClaimAchievementXp(achievement.xpReward, achievement.id)}
                          className="px-2 py-1 rounded bg-emerald-500 hover:bg-emerald-600 text-[#090d16] font-sans font-extrabold text-[9px] hover:shadow-lg active:scale-95 transition-all"
                        >
                          CLAIM {achievement.xpReward} XP
                        </button>
                      ) : isClaimed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <span className="text-[9px] text-emerald-400 font-mono font-bold bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                          +{achievement.xpReward} XP
                        </span>
                      )}
                    </div>

                    {/* Progress Slider */}
                    {!isClaimed && (
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <span className="text-[9px] font-mono font-medium text-gray-500">
                          {achievement.progress}/{achievement.target}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: AFFILIATE / REFERRALS PROGRAM */}
        {activeTab === 'affiliate' && (
          <div className="flex flex-col gap-3.5 h-full font-sans text-gray-200 animate-fade-in" id="affiliate-tab-panel">
            {!account.isLoggedIn ? (
              <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-xl bg-[#090d15]/50 h-full">
                <Gift className="w-12 h-12 text-emerald-500/40 mb-3 animate-pulse" />
                <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-1.5">Affiliate Rewards Network</h4>
                <p className="text-xs text-gray-400 leading-relaxed max-w-[280px] mb-4">
                  Register a secure option profile to generate a unique referral link, monitor invitations, and unlock 15% commissions.
                </p>
                <button
                  onClick={() => { onOpenAuth?.('signup'); onPlaySound?.('CLICK'); }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-xs rounded transition-all active:scale-95 shadow-md shadow-emerald-950/40"
                >
                  Create Pro Profile
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5 h-full">
                {/* Introduction Banner */}
                <div className="bg-[#0b1220]/60 border border-white/10 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Gift className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white tracking-wide uppercase">Partner Program (15% Commission)</span>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-relaxed font-sans">
                    Earn an instant 15% yield on all real deposits made by users you refer. Once commissions accumulate to $30.00, convert them directly into your live trading balance.
                  </p>
                </div>

                {/* Unique Invitation Link Block */}
                <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                    <span>Your Partner Invitation Code</span>
                    <button 
                      onClick={() => { setIsEditingCode(!isEditingCode); onPlaySound?.('CLICK'); }}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{isEditingCode ? 'Cancel' : 'Edit'}</span>
                    </button>
                  </div>

                  {isEditingCode ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customCodeInput}
                        maxLength={15}
                        onChange={(e) => setCustomCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                        className="flex-1 bg-black/40 border border-white/10 rounded py-1 px-2.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-emerald-500/50"
                        placeholder="CUSTOMCODE"
                      />
                      <button
                        onClick={handleSaveAffCode}
                        className="px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded flex items-center justify-center"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-black/40 border border-white/5 rounded py-1.5 px-3">
                      <span className="text-xs text-emerald-400 font-mono font-bold tracking-wide select-all">{currentAffCode}</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">15% Active</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-1 mt-1">
                    <span className="text-[10px] font-mono text-gray-500 uppercase">Referral Link</span>
                    <div className="flex items-center gap-1.5 bg-[#0a0f18] border border-white/10 rounded p-1.5 pl-2.5">
                      <span className="text-[10px] text-gray-400 truncate flex-1 font-mono">
                        {`${window.location.origin}/?ref=${currentAffCode}`}
                      </span>
                      <button
                        onClick={handleCopyLink}
                        className={`p-1.5 rounded text-xs font-sans font-bold flex items-center gap-1 transition-all shrink-0 ${
                          isCopied ? 'bg-emerald-500 text-black' : 'bg-white/5 text-emerald-400 hover:bg-white/10'
                        }`}
                        title="Copy Invitation Link"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span className="text-[9px]">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span className="text-[9px]">Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Social Share Buttons */}
                  <div className="mt-2.5">
                    <span className="text-[10px] font-mono text-gray-500 uppercase block mb-1.5">Share Link</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleShare('twitter')}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded p-1.5 flex justify-center items-center transition-colors"
                        title="Share on X (Twitter)"
                      >
                        <Twitter className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleShare('facebook')}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded p-1.5 flex justify-center items-center transition-colors"
                        title="Share on Facebook"
                      >
                        <Facebook className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleShare('telegram')}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded p-1.5 flex justify-center items-center transition-colors"
                        title="Share on Telegram"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleShare('whatsapp')}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded p-1.5 flex justify-center items-center transition-colors"
                        title="Share on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Network Statistics Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-white/5 border border-white/5 rounded-xl p-2.5">
                    <span className="text-[9px] text-gray-500 font-mono block uppercase tracking-wider">REFERRED TRAFFIC</span>
                    <span className="text-sm font-bold text-white font-mono mt-0.5 block">
                      {account.referralsCount || 0} Traders
                    </span>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-xl p-2.5">
                    <span className="text-[9px] text-gray-500 font-mono block uppercase tracking-wider">EARNED BONUS</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block">
                      ${(account.affiliateBalance || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Conversion & Withdrawal Status */}
                <div className="bg-[#0e0d16] border border-purple-950/40 rounded-xl p-3 flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-purple-300 uppercase tracking-wider">Withdrawal Threshold</span>
                    <span className="text-gray-400">$30.00 Minimum</span>
                  </div>

                  {/* Progress towards $30 threshold */}
                  <div className="flex flex-col gap-1">
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(((account.affiliateBalance || 0) / 30) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                      <span>Progress: {Math.min(Math.round(((account.affiliateBalance || 0) / 30) * 100), 100)}%</span>
                      <span>${(account.affiliateBalance || 0).toFixed(2)} / $30.00</span>
                    </div>
                  </div>

                  {/* Convert to Live Balance action */}
                  <button
                    disabled={(account.affiliateBalance || 0) < 30}
                    onClick={handleWithdrawAffiliate}
                    className={`w-full py-2 rounded text-xs font-sans font-bold transition-all flex items-center justify-center gap-1.5 ${
                      (account.affiliateBalance || 0) >= 30 
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg active:scale-98 cursor-pointer'
                        : 'bg-white/5 border border-white/5 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>Withdraw commissions to Live Balance</span>
                  </button>
                </div>

                {/* Dynamic Referral Simulation box */}
                <div className="mt-auto border border-white/10 bg-black/30 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                    <span>Invitation Sandbox Simulator</span>
                  </div>
                  <p className="text-[9px] text-gray-500 leading-normal">
                    Select a simulated invitation deposit size to audit the 15% payout logic:
                  </p>
                  
                  <div className="grid grid-cols-4 gap-1">
                    {[50, 100, 250, 500].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => { setSimDepositAmount(amt); onPlaySound?.('CLICK'); }}
                        className={`py-1 rounded text-[10px] font-mono font-medium transition-colors ${
                          simDepositAmount === amt 
                            ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-400' 
                            : 'bg-white/5 border border-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleSimulateReferral}
                    className="w-full mt-1.5 py-1.5 bg-[#0e1a14] hover:bg-[#12241b] border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 font-sans font-bold text-[10px] rounded flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                  >
                    <span>Simulate @invitation signup & deposit</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pinned Active Positions Panel at the bottom (shows up when not on trades tab and pin is enabled) */}
      {pinActiveTrades && activeTab !== 'trades' && (
        <div className="border-t border-white/10 bg-[#07090f] p-3 flex flex-col shrink-0">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">PINNED OPEN POSITIONS</span>
            <span className="bg-emerald-500/10 text-emerald-400 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
              {liveActiveTrades.length} Active
            </span>
          </div>

          {liveActiveTrades.length === 0 ? (
            <div className="border border-dashed border-white/10 rounded p-3 text-center text-[11px] text-gray-500 font-sans">
              No active positions in sandbox.
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto custom-scrollbar">
              {liveActiveTrades.map((trade) => {
                const remaining = Math.max(0, Math.ceil((trade.expirationTime - Date.now()) / 1000));
                const isCall = trade.type === 'UP';

                return (
                  <div key={trade.id} className="bg-white/5 border border-white/5 rounded p-2 flex items-center justify-between gap-2 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${isCall ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                      <span className="text-[11px] font-semibold text-white leading-tight">{trade.assetName}</span>
                      <span className={`text-[9px] font-mono font-bold uppercase px-1 rounded ${
                        isCall ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {trade.type}
                      </span>
                    </div>
                    
                    <span className={`font-mono text-[10px] font-bold transition-all ${
                      remaining <= 5 ? 'text-red-500 animate-pulse text-[9px]' : 'text-emerald-400'
                    }`}>
                      {remaining}s left
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
