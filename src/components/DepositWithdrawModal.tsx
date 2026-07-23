/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  CheckCircle2, 
  Coins, 
  TrendingUp, 
  Loader2, 
  AlertCircle,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  HelpCircle,
  QrCode,
  Building,
  User,
  Activity,
  History,
  Clock
} from 'lucide-react';
import { UserAccount } from '../types';

const POPULAR_BANKS = [
  { name: 'Guaranty Trust Bank (GTB)', code: '058' },
  { name: 'Access Bank', code: '044' },
  { name: 'Zenith Bank', code: '057' },
  { name: 'United Bank for Africa (UBA)', code: '033' },
  { name: 'First Bank of Nigeria', code: '011' },
  { name: 'Kuda Bank', code: '50211' },
  { name: 'OPay Digital Services', code: '999992' },
  { name: 'PalmPay Limited', code: '999991' },
  { name: 'Fidelity Bank', code: '070' },
  { name: 'Wema Bank', code: '035' },
  { name: 'Sterling Bank', code: '232' },
];


interface DepositWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'deposit' | 'withdraw';
  account: UserAccount;
  onUpdateAccount: (updated: Partial<UserAccount>) => void;
  onTriggerToast: (type: 'WIN' | 'LOSS' | 'LEVEL_UP' | 'ACHIEVEMENT', title: string, description: string) => void;
  onPlaySound: (type: 'WIN' | 'LOSS' | 'CLICK' | 'PLACE') => void;
}

type StepState = 'FORM' | 'PROCESSING' | 'SUCCESS';

export default function DepositWithdrawModal({
  isOpen,
  onClose,
  initialTab = 'deposit',
  account,
  onUpdateAccount,
  onTriggerToast,
  onPlaySound,
}: DepositWithdrawModalProps) {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>(initialTab as any);
  const [step, setStep] = useState<StepState>('FORM');
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'card' | 'bank'>('crypto');
  const [cryptoCurrency, setCryptoCurrency] = useState<'BTC' | 'ETH' | 'USDT_TRC20' | 'SOL'>('USDT_TRC20');
  const [cryptoAddresses, setCryptoAddresses] = useState<Record<string, string>>({
    BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    ETH: '0x71C7656EC7ab88b098defB751B7401B5f6d1476B',
    USDT_TRC20: 'TXCdtvQp7Lsk6M5r9eKDu8VpTL5S89NdfA',
    SOL: 'HN7cABviJHU7LsX1767bVpTL5SnF2G3K9vXb9Nd',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.settings && data.settings.cryptoAddresses) {
            setCryptoAddresses(data.settings.cryptoAddresses);
          }
        }
      } catch (err) {}
    };
    fetchSettings();
  }, []);
  
  const [depositCurrency, setDepositCurrency] = useState<'USD' | 'NGN'>('USD');
  const [withdrawBankCode, setWithdrawBankCode] = useState<string>('058');
  const [depositBankCode, setDepositBankCode] = useState<string>('058');
  // Card Inputs
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');

  // Bank Inputs
  const [bankIban, setBankIban] = useState<string>('');
  const [bankAccountNumber, setBankAccountNumber] = useState<string>('');
  const [bankName, setBankName] = useState<string>('Guaranty Trust Bank (GTB)');

  // Withdrawal Inputs
  const [withdrawAddress, setWithdrawAddress] = useState<string>('');
  const [withdrawBankIban, setWithdrawBankIban] = useState<string>('');
  const [withdrawBankAccountNumber, setWithdrawBankAccountNumber] = useState<string>('');
  const [withdrawBankName, setWithdrawBankName] = useState<string>('Guaranty Trust Bank (GTB)');
  const [withdrawAccountName, setWithdrawAccountName] = useState<string>('');

  // History state
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Loading steps
  const [progressText, setProgressText] = useState<string>('Initializing Secure Handshake...');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [createdTxId, setCreatedTxId] = useState<string>('');

  const resetForm = () => {
    setCustomAmount('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCardName('');
    setBankIban('');
    setBankAccountNumber('');
    setBankName('Guaranty Trust Bank (GTB)');
    setDepositBankCode('058');
    setWithdrawAddress('');
    setWithdrawBankIban('');
    setWithdrawBankAccountNumber('');
    setWithdrawBankName('Guaranty Trust Bank (GTB)');
    setWithdrawBankCode('058');
    setWithdrawAccountName('');
    setErrorMsg('');
  };

  useEffect(() => {
    if (activeTab === 'history' && account.isLoggedIn && account.email) {
      setLoadingHistory(true);
      fetch(`/api/user/transactions?email=${encodeURIComponent(account.email)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setTransactions(data.transactions);
          }
        })
        .finally(() => {
          setLoadingHistory(false);
        });
    }
  }, [activeTab, account.isLoggedIn, account.email]);

  // Update selected tab if prop changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setStep('FORM');
      resetForm();
    } else {
      resetForm();
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (isOpen) {
      const script = document.createElement('script');
      script.src = 'https://checkout.flutterwave.com/v3.js';
      script.async = true;
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Amount list
  const QUICK_AMOUNTS = [50, 100, 250, 500, 1000, 2500];

  const currentBalance = account.isLive ? account.balanceLive : account.balanceDemo;
  const resolvedAmount = customAmount ? parseFloat(customAmount) : selectedAmount;



  const handleCopyAddress = () => {
    const addr = cryptoAddresses[cryptoCurrency];
    navigator.clipboard.writeText(addr);
    setCopied(true);
    onPlaySound('CLICK');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaymentMethodChange = (method: 'crypto' | 'card' | 'bank') => {
    onPlaySound('CLICK');
    setPaymentMethod(method);
    setErrorMsg('');
  };

  const handleAmountChange = (amt: number) => {
    onPlaySound('CLICK');
    setSelectedAmount(amt);
    setCustomAmount('');
    setErrorMsg('');
  };

  const validateForm = () => {
    if (isNaN(resolvedAmount) || resolvedAmount <= 0) {
      setErrorMsg('Please specify a valid transaction amount.');
      return false;
    }

    if (activeTab === 'withdraw') {
      const lockedAmount = account.isLive ? Math.max(0, (account.totalDeposits || 0) - (account.liveTradeVolume || 0)) : 0;
      const availableToWithdraw = currentBalance - lockedAmount;
      if (resolvedAmount > availableToWithdraw) {
        if (lockedAmount > 0) {
          setErrorMsg(`You can only withdraw up to ${availableToWithdraw.toFixed(2)}. ${lockedAmount.toFixed(2)} is locked awaiting trade volume.`);
        } else {
          setErrorMsg(`Insufficient funds. Your current ${account.isLive ? 'Live' : 'Demo'} balance is ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`);
        }
        return false;
      }
    }

    if (activeTab === 'withdraw' && resolvedAmount < 50) {
      setErrorMsg('Minimum withdrawal amount is $50.00.');
      return false;
    }

    if (activeTab === 'deposit' && resolvedAmount < 10) {
      setErrorMsg('Minimum deposit amount is $10.00.');
      return false;
    }

    if (account.isLive) {
      // Live validation rules via Flutterwave
      if (activeTab === 'withdraw') {
        if (!withdrawBankAccountNumber || withdrawBankAccountNumber.length < 8) {
          setErrorMsg('Please enter a valid 10-digit bank account number.');
          return false;
        }
        if (!withdrawAccountName) {
          setErrorMsg('Please enter the beneficiary account name.');
          return false;
        }
        if (!withdrawBankName) {
          setErrorMsg('Please select a destination bank.');
          return false;
        }
      }
    } else {
      // Demo Practice simulation rules
      if (activeTab === 'deposit') {
        if (paymentMethod === 'card') {
          if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
            setErrorMsg('Please enter a valid 16-digit credit card number.');
            return false;
          }
          if (!cardExpiry || !cardExpiry.includes('/')) {
            setErrorMsg('Please enter a valid card expiry (MM/YY).');
            return false;
          }
          if (!cardCvv || cardCvv.length < 3) {
            setErrorMsg('Please enter a valid CVV code.');
            return false;
          }
          if (!cardName) {
            setErrorMsg('Please enter the cardholder full name.');
            return false;
          }
        } else if (false) {
          if (!bankAccountNumber) {
            setErrorMsg('Please enter your Bank Account Number.');
            return false;
          }
          if (!bankName) {
            setErrorMsg('Please specify your bank institution name.');
            return false;
          }
        }
      } else {
        // Withdraw validation
        if (paymentMethod === 'crypto') {
          if (!withdrawAddress || withdrawAddress.length < 24) {
            setErrorMsg(`Please enter a valid destination ${cryptoCurrency} wallet address.`);
            return false;
          }
        } else {
          if (!withdrawBankAccountNumber) {
            setErrorMsg('Please enter your Bank Account Number.');
            return false;
          }
          if (!withdrawBankName) {
            setErrorMsg('Please provide the destination bank name.');
            return false;
          }
          if (!withdrawAccountName) {
            setErrorMsg('Please enter the beneficiary account name.');
            return false;
          }
        }
      }
    }

    setErrorMsg('');
    return true;
  };

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPlaySound('CLICK');

    if (!validateForm()) return;

    // Start secure simulator pipeline animation
    setStep('PROCESSING');
    setProgressText('Establishing encrypted session token...');

    const isLive = account.isLive;
    const isInitialDepositBonus = isLive && activeTab === 'deposit' && !account.hasClaimedInitialBonus;
    const bonusAmount = isInitialDepositBonus ? resolvedAmount * 0.5 : 0;

    const statuses = isLive 
      ? (activeTab === 'deposit'
          ? [
              'Contacting Flutterwave Treasury Gateway...',
              'Securing transaction handshake token...',
              'Building hosted checkout payload...',
              'Generating invoice reference key...',
              'Spawning secure browser frame...',
            ]
          : [
              'Verifying available capital reserve...',
              'Formatting bank clearance payload...',
              'Registering clearance queue ledger...',
              'Awaiting back-office approval confirmation...',
            ])
      : [
          'Authenticating practice endpoints...',
          'Verifying balance adjustments...',
          'Assembling simulation packet...',
          'Publishing records to client context...',
          'Settling practice funds balance...',
        ];

    let currentIdx = 0;
    const interval = setInterval(async () => {
      if (currentIdx < statuses.length) {
        setProgressText(statuses[currentIdx]);
        currentIdx++;
      } else {
        clearInterval(interval);

        if (isLive) {
          if (activeTab === 'deposit') {
            try {
              if (paymentMethod === 'crypto') {
                const response = await fetch('/api/user/transaction', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email: account.email,
                    type: 'deposit',
                    amount: resolvedAmount,
                    bonus: !account.hasClaimedInitialBonus ? resolvedAmount * 0.5 : 0,
                    channel: `Crypto Deposit (${cryptoCurrency})`,
                    details: {
                      currency: cryptoCurrency,
                      network: cryptoCurrency,
                      destinationAddress: cryptoAddresses[cryptoCurrency]
                    }
                  })
                });

                if (!response.ok) throw new Error('Transaction failed');
                const data = await response.json();
                
                if (data.success) {
                  setCreatedTxId(data.transaction.id);
                  onUpdateAccount({ balanceLive: data.balanceLive });
                  setStep('SUCCESS');
                  onPlaySound('WIN');
                  onTriggerToast(
                    'WIN',
                    'DEPOSIT SETTLED',
                    `Your ${cryptoCurrency} deposit of $${resolvedAmount.toFixed(2)} was successfully processed and auto-approved.`
                  );
                }
                return;
              }

              const response = await fetch('/api/flutterwave/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: account.email,
                  fullName: account.fullName,
                  amount: resolvedAmount,
                  currency: depositCurrency,
                  paymentMethod: paymentMethod
                })
              });

              if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Gateway rejected initialization');
              }

              const data = await response.json();
              if (data.success && data.checkoutUrl) {
                setCreatedTxId(data.transaction.id);
                setStep('SUCCESS');
                onPlaySound('WIN');
                onTriggerToast(
                  'LEVEL_UP',
                  'GATEWAY READY',
                  'Complete payment on the secure Flutterwave checkout screen.'
                );
                
                // Open hosted page
                setTimeout(() => {
                  window.location.href = data.checkoutUrl;
                }, 1000);
              }
            } catch (err: any) {
              console.error('Transaction initialization failed:', err);
              setStep('FORM');
              setErrorMsg(err.message || 'Payment system timeout. Please try again.');
              onPlaySound('LOSS');
            }
            return;
          }

          // Live Withdrawal Submission
          try {
            const detailsPayload = {
              bankName: withdrawBankName,
              bankCode: withdrawBankCode,
              accountNumber: withdrawBankAccountNumber,
              accountHolder: withdrawAccountName,
              currency: 'NGN'
            };

            const response = await fetch('/api/user/transaction', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: account.email,
                type: 'withdraw',
                amount: resolvedAmount,
                bonus: 0,
                channel: 'Flutterwave Payout (Bank Wire)',
                details: detailsPayload
              })
            });

            if (!response.ok) {
              const errData = await response.json();
              throw new Error(errData.error || 'Server rejected withdrawal request');
            }

            const data = await response.json();
            if (data.success) {
              setCreatedTxId(data.transaction.id);
              onUpdateAccount({
                balanceLive: data.balanceLive
              });

              setStep('SUCCESS');
              onPlaySound('WIN');
              onTriggerToast(
                'LEVEL_UP',
                'WITHDRAWAL ENQUEUE',
                `Your withdrawal of ${resolvedAmount.toFixed(2)} is pending admin approval and instant Flutterwave settlement.`
              );
            }
          } catch (err: any) {
            console.error('Withdrawal API failed:', err);
            setStep('FORM');
            setErrorMsg(err.message || 'Withdrawal process exception. Please try again.');
            onPlaySound('LOSS');
          }
        } else {
          // Settle demo state instantly
          const nextBalanceDemo = activeTab === 'deposit' ? account.balanceDemo + resolvedAmount : account.balanceDemo - resolvedAmount;
          onUpdateAccount({
            balanceDemo: nextBalanceDemo,
          });

          setStep('SUCCESS');
          onPlaySound('WIN');
          onTriggerToast(
            'WIN',
            activeTab === 'deposit' ? 'DEMO DEPOSITED' : 'DEMO WITHDRAWN',
            `Successfully adjusted your Demo Practice balance by ${resolvedAmount.toFixed(2)}.`
          );
        }
      }
    }, 500);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] overflow-y-auto bg-black/85 backdrop-blur-sm select-none font-sans" 
      id="banking-modal"
    >
      <div className="flex min-h-full items-center justify-center p-4 py-10">
        <div 
          className="relative w-full max-w-lg bg-[#080c14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#0a0f1d]">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={onClose}
              className="p-1.5 mr-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Back</span>
            </button>
            <div className={`p-2 rounded-lg ${activeTab === 'deposit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              {activeTab === 'deposit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
                {activeTab === 'deposit' ? 'Secured Gateway Deposit' : 'Instant Capital Withdrawal'}
              </h2>
              <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
                {account.isLive ? 'REAL MONEY ACCOUNT' : 'PRACTICE PROTOCOL'}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            id="close-banking-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Status Line */}
        <div className="bg-[#0b1222] border-b border-white/10 px-5 py-3 flex items-center justify-between text-xs text-gray-400 font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Mode: <strong className={account.isLive ? 'text-emerald-400' : 'text-white'}>{account.isLive ? 'LIVE' : 'DEMO PRACTICE'}</strong></span>
          </div>
          <div>
            <span>Balance: <strong className="text-white">${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></span>
          </div>
        </div>

        {/* Tab Selection */}
        {step === 'FORM' && (
          <div className="flex border-b border-white/10 p-1.5 gap-2 bg-[#060a12]">
            <button
              onClick={() => { onPlaySound('CLICK'); setActiveTab('deposit'); setStep('FORM'); resetForm(); }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'deposit'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Deposit Funds</span>
            </button>
            <button
              onClick={() => { onPlaySound('CLICK'); setActiveTab('withdraw'); setStep('FORM'); resetForm(); }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'withdraw'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Withdraw Capital</span>
            </button>
            <button
              onClick={() => { onPlaySound('CLICK'); setActiveTab('history'); setStep('FORM'); resetForm(); }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </button>
          </div>
        )}

        {/* Content Stages */}
        <div className="flex-1 p-5 overflow-y-auto max-h-[420px] custom-scrollbar">
          {step === 'FORM' && (
            <form onSubmit={handleActionSubmit} className="flex flex-col gap-4">
              
              {/* Alert Message */}
              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs flex items-start gap-2 animate-pulse">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Withdrawal Availability Details */}
              {account.isLive && activeTab === 'withdraw' && (
                <div className="flex flex-col gap-1 mt-1 mb-2 p-3 bg-black/40 border border-white/5 rounded-lg shadow-inner">
                   <div className="flex justify-between items-center text-xs">
                     <span className="text-gray-400 font-mono uppercase tracking-wider text-[10px]">Total Balance</span>
                     <span className="text-white font-mono font-bold">${account.balanceLive.toFixed(2)}</span>
                   </div>
                   {(account.totalDeposits || 0) > 0 && (
                     <>
                       <div className="flex justify-between items-center text-xs mt-0.5">
                         <span className="text-rose-400/80 font-mono uppercase tracking-wider text-[10px]">Locked (Awaiting Volume)</span>
                         <span className="text-rose-400 font-mono font-bold">
                           -${Math.max(0, (account.totalDeposits || 0) - (account.liveTradeVolume || 0)).toFixed(2)}
                         </span>
                       </div>
                       <div className="flex justify-between items-center text-xs border-t border-white/10 pt-1 mt-1">
                         <span className="text-emerald-400 font-mono uppercase tracking-wider text-[10px]">Available to Withdraw</span>
                         <span className="text-emerald-400 font-mono font-bold">
                           ${(account.balanceLive - Math.max(0, (account.totalDeposits || 0) - (account.liveTradeVolume || 0))).toFixed(2)}
                         </span>
                       </div>
                       {(account.totalDeposits || 0) > (account.liveTradeVolume || 0) && (
                          <p className="text-[9px] text-gray-500 leading-tight mt-1.5">
                            * Deposited capital requires a trading volume equivalent of ${(account.totalDeposits || 0).toFixed(2)} before it unlocks. Affiliate commissions and previous profits are always unlocked.
                          </p>
                       )}
                     </>
                   )}
                </div>
              )}

              {/* Amount Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Select Amount ($)</label>
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleAmountChange(amt)}
                      className={`py-2 rounded-lg text-xs font-mono font-semibold border transition-all cursor-pointer ${
                        resolvedAmount === amt && !customAmount
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                          : 'bg-[#0a0f1d] border-white/5 text-gray-300 hover:border-white/15'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
                
                {/* Custom Amount Entry */}
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-xs font-mono">
                    <DollarSign className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="number"
                    min={activeTab === 'withdraw' ? "50" : "10"}
                    placeholder={activeTab === 'withdraw' ? "Enter custom amount (Min: $50)" : "Enter custom amount (Min: $10)"}
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setErrorMsg('');
                    }}
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                  />
                </div>

                {activeTab === 'deposit' && account.isLive && !account.hasClaimedInitialBonus && resolvedAmount > 0 && (
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between text-xs font-mono text-emerald-400 mt-2">
                    <div className="flex items-center gap-1.5">
                      <span className="animate-bounce">🎁</span>
                      <span className="font-semibold text-[10px] uppercase tracking-wider">50% Welcome Bonus Active!</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-500 block uppercase">Added Bonus</span>
                      <span className="font-bold">+${(resolvedAmount * 0.5).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Channel Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePaymentMethodChange('crypto')}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      paymentMethod === 'crypto'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-[#0a0f1d] border-white/5 text-gray-400 hover:border-white/15'
                    }`}
                  >
                    <Coins className="w-4 h-4" />
                    <span>Crypto</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handlePaymentMethodChange('card')}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-[#0a0f1d] border-white/5 text-gray-400 hover:border-white/15'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Card Pay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePaymentMethodChange('bank')}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      paymentMethod === 'bank'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-[#0a0f1d] border-white/5 text-gray-400 hover:border-white/15'
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    <span>Bank Transfer</span>
                  </button>
                </div>
              </div>

              {/* Crypto specific subform */}
              {paymentMethod === 'crypto' && (
                <div className="bg-[#05080e] border border-white/5 p-4 rounded-xl flex flex-col gap-3">
                  <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                    <span>ASSET CHAIN:</span>
                    <div className="flex gap-1.5">
                      {['USDT_TRC20', 'BTC', 'ETH', 'SOL'].map((sym) => (
                        <button
                          key={sym}
                          type="button"
                          onClick={() => { onPlaySound('CLICK'); setCryptoCurrency(sym as any); }}
                          className={`px-2 py-0.5 rounded font-bold text-[9px] ${
                            cryptoCurrency === sym 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                              : 'bg-white/5 text-gray-400 hover:text-white'
                          }`}
                        >
                          {sym.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {activeTab === 'deposit' ? (
                    <div className="flex flex-col items-center gap-3 bg-[#0a0f1d] p-3 rounded-lg text-center">
                      <div className="p-2.5 bg-white/5 rounded-lg border border-white/10 text-white flex items-center justify-center">
                        <QrCode className="w-24 h-24 text-gray-300" />
                      </div>
                      
                      <div className="w-full flex flex-col gap-1 text-left">
                        <span className="text-[9px] text-gray-500 font-mono block">SECURE DESTINATION ADDRESS:</span>
                        <div className="flex items-center gap-1 bg-black/40 border border-white/5 p-2 rounded text-[10px] font-mono text-gray-300">
                          <span className="truncate flex-1">{cryptoAddresses[cryptoCurrency]}</span>
                          <button
                            type="button"
                            onClick={handleCopyAddress}
                            className="p-1 text-gray-400 hover:text-white bg-white/5 rounded transition-colors"
                            title="Copy Wallet Address"
                          >
                            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <p className="text-[10px] text-amber-500/80 font-sans mt-1 leading-tight">
                          * Send only <strong>{cryptoCurrency.replace('_', ' ')}</strong> to this address. Transactions settle instantly after 1 node consensus.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Destination Wallet Address</label>
                      <input
                        type="text"
                        placeholder={`Enter your remote ${cryptoCurrency.replace('_', ' ')} wallet address`}
                        value={withdrawAddress}
                        onChange={(e) => { setWithdrawAddress(e.target.value); setErrorMsg(''); }}
                        className="w-full bg-[#0a0f1d] border border-white/10 rounded-lg py-2 px-3 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Credit Card specific subform */}
              {paymentMethod === 'card' && (
                <div className="bg-[#05080e] border border-white/5 p-4 rounded-xl flex flex-col gap-3">
                  {activeTab === 'deposit' ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Cardholder Full Name</label>
                        <input
                          type="text"
                          placeholder="e.g. JOHN DOE"
                          value={cardName}
                          onChange={(e) => { setCardName(e.target.value.toUpperCase()); setErrorMsg(''); }}
                          className="w-full bg-[#0a0f1d] border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Card Number</label>
                        <input
                          type="text"
                          maxLength={19}
                          placeholder="0000 0000 0000 0000"
                          value={cardNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                            setCardNumber(val);
                            setErrorMsg('');
                          }}
                          className="w-full bg-[#0a0f1d] border border-white/10 rounded-lg py-2 px-3 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Expiry (MM/YY)</label>
                          <input
                            type="text"
                            maxLength={5}
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, '');
                              if (val.length > 2) val = val.substring(0,2) + '/' + val.substring(2);
                              setCardExpiry(val);
                              setErrorMsg('');
                            }}
                            className="w-full bg-[#0a0f1d] border border-white/10 rounded-lg py-2 px-3 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50 text-center"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">CVV Code</label>
                          <input
                            type="password"
                            maxLength={3}
                            placeholder="***"
                            value={cardCvv}
                            onChange={(e) => { setCardCvv(e.target.value.replace(/\D/g, '')); setErrorMsg(''); }}
                            className="w-full bg-[#0a0f1d] border border-white/10 rounded-lg py-2 px-3 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50 text-center"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-lg text-rose-300 text-xs">
                      Withdrawals directly to credit/debit cards are restricted by settlement clearing houses. Please select <strong>Bank Transfer</strong> or <strong>Crypto</strong> options for withdrawals instead.
                    </div>
                  )}
                </div>
              )}

              {/* Bank transfer subform */}
              {paymentMethod === 'bank' && (
                <div className="bg-[#05080e] border border-white/5 p-4 rounded-xl flex flex-col gap-3">
                  {activeTab === 'deposit' ? (
                    <div className="flex flex-col gap-3 text-center py-2">
                      <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-xl">
                        <Building className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <h4 className="text-white font-bold text-sm tracking-wide">Automated Bank Transfer</h4>
                        <p className="text-xs text-gray-400 font-sans leading-relaxed px-2">
                          Your deposit will be securely processed via Flutterwave. A dynamic virtual account number will be generated for your transaction. 
                          <br/><br/>
                          Once you transfer the funds, your Live balance will be <strong>credited automatically</strong>.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Beneficiary Bank Name</label>
                        {account.isLive ? (
                          <select
                            value={withdrawBankCode}
                            onChange={(e) => {
                              const code = e.target.value;
                              const selectedBank = POPULAR_BANKS.find(b => b.code === code);
                              if (selectedBank) {
                                setWithdrawBankCode(code);
                                setWithdrawBankName(selectedBank.name);
                              }
                              setErrorMsg('');
                            }}
                            className="w-full bg-[#0a0f1d] border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                          >
                            {POPULAR_BANKS.map((bank) => (
                              <option key={bank.code} value={bank.code} className="bg-[#0a0f1d] text-white">
                                {bank.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            placeholder="e.g. Bank of America"
                            value={withdrawBankName}
                            onChange={(e) => { setWithdrawBankName(e.target.value); setErrorMsg(''); }}
                            className="w-full bg-[#0a0f1d] border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                          />
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Beneficiary Account Name</label>
                        <input
                          type="text"
                          placeholder="e.g. JOHN SMITH"
                          value={withdrawAccountName}
                          onChange={(e) => { setWithdrawAccountName(e.target.value.toUpperCase()); setErrorMsg(''); }}
                          className="w-full bg-[#0a0f1d] border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Bank Account Number <span className="text-rose-400">*</span></label>
                        <input
                          type="text"
                          placeholder="Enter beneficiary bank account number"
                          value={withdrawBankAccountNumber}
                          onChange={(e) => { setWithdrawBankAccountNumber(e.target.value); setErrorMsg(''); }}
                          className="w-full bg-[#0a0f1d] border border-white/10 rounded-lg py-2 px-3 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">IBAN / SWIFT (Optional)</label>
                        <input
                          type="text"
                          placeholder="Enter destination IBAN or swift code (if applicable)"
                          value={withdrawBankIban}
                          onChange={(e) => { setWithdrawBankIban(e.target.value.toUpperCase()); setErrorMsg(''); }}
                          className="w-full bg-[#0a0f1d] border border-white/10 rounded-lg py-2 px-3 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submit triggers */}
              <button
                type="submit"
                disabled={activeTab === 'withdraw' && paymentMethod === 'card'}
                className={`w-full py-3 rounded-xl font-bold font-sans text-xs uppercase tracking-wider transition-all shadow-lg active:scale-98 ${
                  activeTab === 'deposit'
                    ? 'bg-[#10b981] hover:bg-[#059669] text-white shadow-emerald-950/30'
                    : 'bg-[#f43f5e] hover:bg-[#e11d48] text-white shadow-rose-950/30'
                } disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-1.5`}
              >
                {activeTab === 'deposit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                <span>
                  Confirm {activeTab === 'deposit' ? 'Secure Deposit' : 'Instant Withdrawal'} (${resolvedAmount.toLocaleString()})
                </span>
              </button>
            </form>
          )}

          {/* History View */}
          {step === 'FORM' && activeTab === 'history' && (
            <div className="flex flex-col gap-3">
              {loadingHistory ? (
                <div className="py-8 flex justify-center items-center">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center text-center text-gray-500">
                  <History className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm">No transactions found.</p>
                </div>
              ) : (
                transactions.map((tx: any) => (
                  <div key={tx.id} className="bg-[#05080e] border border-white/5 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {tx.type === 'deposit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white uppercase">{tx.type}</span>
                        <span className="text-[10px] text-gray-500 font-mono">{new Date(tx.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-sm font-bold font-mono ${tx.type === 'deposit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <span className={`text-[10px] uppercase tracking-wider font-bold ${
                        tx.status === 'PENDING' ? 'text-amber-400' : 
                        tx.status === 'APPROVED' || tx.status === 'SETTLED_SUCCESS' ? 'text-emerald-400' : 
                        'text-rose-400'
                      }`}>
                        {tx.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Secure pipeline processing simulation animation */}
          {step === 'PROCESSING' && (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
              <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-semibold text-white tracking-wide uppercase font-mono">Securing Transaction Tunnel...</h3>
                <p className="text-xs text-gray-400 font-mono h-4">{progressText}</p>
              </div>
              <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-emerald-500 animate-[pulse_1s_infinite] w-full rounded-full"></div>
              </div>
            </div>
          )}

          {/* Success stage */}
          {step === 'SUCCESS' && (
            <div className="py-8 flex flex-col items-center justify-center text-center gap-5">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center animate-bounce shadow-xl">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              
              <div className="flex flex-col gap-1">
                <h3 className="text-md font-bold text-white tracking-wide uppercase font-mono">
                  {account.isLive 
                    ? (activeTab === 'deposit' 
                        ? 'DEPOSIT INITIALIZED' 
                        : 'WITHDRAWAL REQUESTED') 
                    : 'TRANSACTION SETTLED'}
                </h3>
                <p className="text-xs text-gray-400 max-w-sm leading-relaxed mt-1">
                  {account.isLive 
                    ? (activeTab === 'deposit' 
                        ? 'Your secure payment gateway session has been successfully established via Flutterwave. Your Live Balance will update automatically upon successful payment.' 
                        : 'Your withdrawal payout is registered. The platform commission (5% cut) has been calculated, and your net payout is pending administrative approval.')
                    : 'Your practice protocol payment record index hash has been processed and practice reserves are successfully reconciled.'}
                </p>
              </div>

              <div className="bg-[#0b1222] border border-white/5 p-4 rounded-xl w-full max-w-sm flex flex-col gap-2 font-mono text-[10px] text-gray-400 text-left">
                {createdTxId && (
                  <div className="flex justify-between">
                    <span>TRANSACTION ID:</span>
                    <span className="text-white font-bold">{createdTxId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>TRANSFER TYPE:</span>
                  <span className="text-white font-bold uppercase">{activeTab === 'deposit' ? 'DEPOSIT INBOUND' : 'WITHDRAWAL RELEASE'}</span>
                </div>
                <div className="flex justify-between">
                  <span>AMOUNT TRANSACTED:</span>
                  <span className={activeTab === 'deposit' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    ${resolvedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {account.isLive && activeTab === 'withdraw' && (
                  <>
                    <div className="flex justify-between">
                      <span>PLATFORM CUT (5%):</span>
                      <span className="text-rose-400 font-bold">
                        -${(resolvedAmount * 0.05).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-1.5 mt-0.5">
                      <span>NET BANK PAYOUT:</span>
                      <span className="text-emerald-400 font-bold">
                        ${(resolvedAmount * 0.95).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span>PAYMENT NETWORK:</span>
                  <span className="text-white uppercase font-bold">{paymentMethod} ({paymentMethod === 'crypto' ? cryptoCurrency : 'SECURE LEDGER'})</span>
                </div>
                <div className="flex justify-between">
                  <span>STATUS INDEX:</span>
                  {account.isLive ? (
                    activeTab === 'deposit' ? (
                      <span className="text-emerald-400 font-bold uppercase">AUTO-SETTLED ON PAYMENT</span>
                    ) : (
                      <span className="text-amber-400 font-bold uppercase">AWAITING ADMIN APPROVAL</span>
                    )
                  ) : (
                    <span className="text-emerald-400 font-bold">100% COMPLETE</span>
                  )}
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-sans text-xs uppercase tracking-wide rounded-lg transition-all active:scale-95 cursor-pointer shadow-lg shadow-emerald-950/20"
                id="dismiss-success-banking"
              >
                Return to trading desk
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer Banner */}
        <div className="p-4 bg-[#05080e] border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-mono">
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
            <span>GATEWAY SHA-256 SECURED</span>
          </div>
          <span>Ref ID: VT-{Math.floor(Math.random()*900000+100000)}</span>
        </div>
      </div>
    </div>
    </div>
  );
}
