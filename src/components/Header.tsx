/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Coins, 
  User, 
  Volume2, 
  VolumeX, 
  Activity, 
  RefreshCw, 
  Crown, 
  Bell, 
  Lock,
  ShieldCheck,
  ArrowDownLeft,
  ArrowUpRight,
  Sun,
  Moon
} from 'lucide-react';
import { UserAccount } from '../types';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  account: UserAccount;
  toggleAccountType: () => void;
  refillDemoBalance: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onOpenAuth: () => void;
  onOpenKyc: () => void;
  onLogout: () => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
}

export default function Header({ 
  account, 
  toggleAccountType, 
  refillDemoBalance, 
  soundEnabled, 
  setSoundEnabled,
  onOpenAuth,
  onOpenKyc,
  onLogout,
  onOpenDeposit,
  onOpenWithdraw
}: HeaderProps) {
  const [latency, setLatency] = useState<number>(12);
  const [serverTime, setServerTime] = useState<string>('');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<string>('dark');
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const getInitials = (name: string) => {
    if (!name) return 'TR';
    return name
      .trim()
      .split(/\s+/)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Live network latency simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const next = prev + delta;
        return next < 4 ? 4 : next > 22 ? 22 : next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Server clock simulation
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setServerTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute XP percentage to next level
  const xpThreshold = 500;
  const xpProgressPercent = Math.min((account.xp % xpThreshold) / xpThreshold * 100, 100);

  return (
    <header className="bg-[#0a0c10] border-b border-white/10 px-6 flex items-center justify-between select-none h-14" id="vertex-header">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-8 h-8 bg-emerald-500 rounded-sm flex items-center justify-center transform rotate-45 shrink-0">
          <div className="w-4 h-4 bg-[#0a0c10] transform -rotate-45"></div>
        </div>
        <div>
          <span className="font-sans font-bold tracking-tighter text-white text-lg block leading-none">
            VERTEX<span className="text-emerald-500">MARKET</span>
          </span>
          <div className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Advanced Options Desk</div>
        </div>
      </div>

      {/* Center Section: Performance & Clock */}
      <div className="hidden lg:flex items-center gap-6 text-xs text-gray-400 font-mono border-x border-white/10 px-6 h-full">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span>SYSTEM ONLINE</span>
          <span className="text-emerald-500 font-semibold">({latency}ms)</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-white/20"></div>
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500">UTC:</span>
          <span className="text-gray-300 font-medium w-16 text-center">{serverTime}</span>
        </div>
      </div>

      {/* Right Section: Level, Refill, Balance Toggle, Audio and Profile */}
      <div className="flex items-center gap-4">
        {/* User XP & Level Tracker */}
        <div className="hidden md:flex flex-col gap-1 w-32">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-gray-400 flex items-center gap-0.5 font-sans">
              <Crown className="w-3 h-3 text-emerald-500" /> LVL {account.level}
            </span>
            <span className="text-emerald-500 font-mono font-medium">{account.xp % xpThreshold}/{xpThreshold} XP</span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${xpProgressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Demo Account Refill */}
        {!account.isLive && (
          <button
            onClick={refillDemoBalance}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all text-xs font-sans"
            title="Refill Demo Balance to $10,000"
            id="refill-btn"
          >
            <RefreshCw className="w-3 h-3 text-emerald-500" />
            <span>Refill</span>
          </button>
        )}

        {/* Balance and Account Switcher */}
        <div className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded p-1">
          {/* Demo Button */}
          <button
            onClick={() => account.isLive && toggleAccountType()}
            className={`px-3 py-1 rounded text-xs font-medium tracking-wide transition-all ${
              !account.isLive
                ? 'bg-white/10 text-emerald-500 font-bold shadow-sm shadow-emerald-500/5'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            DEMO
          </button>
          
          {/* Live Button */}
          <button
            onClick={() => !account.isLive && toggleAccountType()}
            className={`px-3 py-1 rounded text-xs font-medium tracking-wide transition-all flex items-center gap-1 ${
              account.isLive
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            LIVE
          </button>
        </div>

        {/* Balance Display & Deposit/Withdraw Action Area */}
        <div className="hidden sm:flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-lg p-1" id="header-balance-banking-area">
          <div className="flex flex-col text-right font-mono px-2">
            <span className="text-[9px] text-gray-500 tracking-wider uppercase leading-none mb-0.5">
              {account.isLive ? 'Real Account' : 'Practice Account'}
            </span>
            <span className={`text-xs font-bold tracking-tight leading-none ${
              account.isLive ? 'text-emerald-400' : 'text-white'
            }`}>
              ${(account.isLive ? account.balanceLive : account.balanceDemo).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>


        </div>



        {/* Audio Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`hidden sm:block p-2 rounded border transition-all ${
            soundEnabled
              ? 'bg-white/5 border-white/10 text-emerald-500'
              : 'bg-transparent border-white/5 text-gray-500 hover:border-white/10'
          }`}
          title={soundEnabled ? 'Disable Sounds' : 'Enable Sounds'}
          id="sound-toggle-btn"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* User Profile Info & Dropdown */}
        <div className="flex items-center border-l border-white/10 pl-4 h-8">
          {!account.isLoggedIn ? (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold font-sans tracking-wide transition-all shadow-md shadow-emerald-950/20 border border-emerald-500/20 cursor-pointer"
              id="signin-header-btn"
            >
              <User className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
          ) : (
            <div className="relative" id="profile-dropdown-container">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 hover:opacity-85 transition-opacity text-left cursor-pointer"
                id="profile-dropdown-trigger"
                title="Account Settings & Verification"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 text-emerald-400 font-bold text-xs select-none relative">
                  {getInitials(account.fullName || account.email || 'TR')}
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0a0c10] ${
                    account.kycStatus === 'VERIFIED' ? 'bg-emerald-500' : account.kycStatus === 'PENDING' ? 'bg-amber-500' : 'bg-rose-500'
                  }`}></span>
                </div>
                <div className="hidden xl:flex flex-col">
                  <span className="text-xs font-semibold text-gray-200 truncate max-w-[90px]">
                    {account.fullName || 'Trader'}
                  </span>
                  <span className={`text-[8px] font-mono tracking-wider leading-none uppercase mt-0.5 font-bold ${
                    account.kycStatus === 'VERIFIED' ? 'text-emerald-400' : account.kycStatus === 'PENDING' ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {account.kycStatus === 'VERIFIED' ? 'KYC Verified' : account.kycStatus === 'PENDING' ? 'KYC Pending' : 'KYC Unverified'}
                  </span>
                </div>
              </button>

              {/* Dropdown Menu overlay */}
              {isMenuOpen && (
                <div 
                  className="absolute right-0 mt-3 w-56 bg-[#090d16] border border-white/10 rounded-lg shadow-2xl shadow-black/90 p-1.5 z-50 animate-fade-in" 
                  id="profile-dropdown-menu"
                  onMouseLeave={() => setIsMenuOpen(false)}
                >
                  <div className="px-3 py-2 bg-white/5 rounded-md mb-1.5 text-xs">
                    <p className="font-semibold text-white truncate">{account.fullName || 'Trader'}</p>
                    <p className="text-[9px] text-gray-400 font-mono mt-0.5 truncate">{account.email || 'no-email@example.com'}</p>
                  </div>

                  <div className="px-3 py-1.5 flex flex-col gap-1 mb-1.5 text-[9px] font-mono text-gray-400 border-b border-white/5">
                    <div className="flex justify-between">
                      <span>DEMO:</span>
                      <span className="text-white font-bold">${account.balanceDemo.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>LIVE:</span>
                      <span className="text-emerald-400 font-bold">${account.balanceLive.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {/* Theme Selector */}
                  <div className="px-2 py-1.5 border-b border-white/5 mb-1">
                    <p className="text-[9px] text-gray-500 font-mono uppercase mb-1">App Theme</p>
                    <div className="grid grid-cols-2 gap-1">
                      <button onClick={() => setTheme('dark')} className={`py-1 text-[10px] rounded ${theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>Dark</button>
                      <button onClick={() => setTheme('light')} className={`py-1 text-[10px] rounded ${theme === 'light' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>Light</button>
                      <button onClick={() => setTheme('blue')} className={`py-1 text-[10px] rounded ${theme === 'blue' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>Cosmic</button>
                      <button onClick={() => setTheme('neon')} className={`py-1 text-[10px] rounded ${theme === 'neon' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>Neon</button>
                    </div>
                  </div>

                  {/* Quick Banking actions inside dropdown */}
                  <div className="p-1 border-b border-white/5 flex gap-1 mb-1 bg-white/5 rounded-md">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenDeposit();
                      }}
                      className="flex-1 py-1 px-2 text-[10px] font-bold text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-600 border border-emerald-500/20 rounded transition-all flex items-center justify-center gap-0.5 cursor-pointer"
                    >
                      <ArrowDownLeft className="w-3 h-3" />
                      <span>Deposit</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenWithdraw();
                      }}
                      className="flex-1 py-1 px-2 text-[10px] font-bold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 rounded transition-all flex items-center justify-center gap-0.5 cursor-pointer"
                    >
                      <ArrowUpRight className="w-3 h-3" />
                      <span>Withdraw</span>
                    </button>
                  </div>

                  {account.kycStatus !== 'VERIFIED' && (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenKyc();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-amber-400 hover:text-white hover:bg-amber-500/10 rounded-md transition-colors flex items-center gap-2 mb-1 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Complete KYC</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-rose-400 hover:text-white hover:bg-rose-500/10 rounded-md transition-colors flex items-center gap-2 cursor-pointer"
                    id="logout-btn"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Log Out Session</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
