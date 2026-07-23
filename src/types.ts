/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Candlestick {
  time: number; // timestamp
  open: number;
  high: number;
  low: number;
  close: number;
}

export type AssetCategory = 'crypto' | 'otc' | 'stocks' | 'commodities' | 'indices';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  price: number;
  change24h: number; // percentage
  payoutRate: number; // percentage (e.g. 92 for 92%)
  volatility: number;
  trend: number; // positive = bullish, negative = bearish
}

export type TradeType = 'UP' | 'DOWN';
export type TradeStatus = 'ACTIVE' | 'WON' | 'LOST' | 'DRAW';

export interface Trade {
  id: string;
  forcedOutcome?: 'WON' | 'LOST';
  assetId: string;
  assetName: string;
  type: TradeType;
  investment: number;
  strikePrice: number;
  settlementPrice?: number;
  payoutRate: number;
  payoutAmount?: number;
  status: TradeStatus;
  startTime: number; // timestamp
  expirationTime: number; // timestamp (when it closes)
  durationSeconds: number;
}

export interface UserAccount {
  password?: string;
  securityAnswer?: string;
  balanceDemo: number;
  balanceLive: number;
  isLive: boolean;
  totalDeposits?: number;
  liveTradeVolume?: number;
  level: number;
  xp: number;
  badges: string[];
  isLoggedIn?: boolean;
  email?: string;
  fullName?: string;
  kycStatus?: 'UNVERIFIED' | 'PENDING' | 'VERIFIED';
  kycDocumentType?: string;
  kycIdImage?: string;
  kycSelfieImage?: string;
  kycSubmittedAt?: number;
  affiliateCode?: string;
  affiliateBalance?: number;
  referralsCount?: number;
  referredBy?: string;
  aiAnalysesUsed?: number;
  aiSubscription?: 'none' | 'monthly_basic' | 'monthly_pro' | 'yearly_vip';
  aiSubscriptionExpires?: number;
  hasClaimedInitialBonus?: boolean;
  joinedTournaments?: string[];
  tournamentScores?: Record<string, number>;
  weeklyProfit?: number;
  hasClaimedWeeklyPayout?: boolean;
}

export interface TradingSignal {
  assetId: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  signal: 'STRONG BUY' | 'BUY' | 'SELL' | 'STRONG SELL' | 'WAIT';
  strength: number; // percentage 0-100
  timeframe: string;
  reason: string;
  timestamp: number;
}

export interface MarketAnalysis {
  technicalRating: string;
  oscillators: {
    rsi: { value: number; signal: string };
    macd: { value: string; signal: string };
    stochastic: { value: number; signal: string };
  };
  movingAverages: {
    sma20: { value: number; signal: string };
    ema50: { value: number; signal: string };
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  progress: number;
  target: number;
  iconName: string;
}

export interface SocialTrade {
  id: string;
  traderName: string;
  traderAvatar: string;
  assetName: string;
  type: TradeType;
  amount: number;
  timestamp: number;
  isWinning: boolean;
}

export interface SystemSettings {
  platformProfit: number;
  platformCutPercent: number;
  minDeposit: number;
  minWithdraw: number;
  globalWinRate?: number;
  cryptoAddresses?: {
    BTC: string;
    ETH: string;
    USDT_TRC20: string;
    SOL: string;
  };
}

export interface Transaction {
  id: string;
  email: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  bonus?: number;
  payoutCut?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SETTLED_SUCCESS';
  timestamp: number;
  approvedAt?: number;
  rejectedAt?: number;
  details?: any;
}

