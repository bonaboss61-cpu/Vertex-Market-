import { apiFetch } from '../lib/apiFetch.ts';
import React, { useState, useEffect } from 'react';
import { ShieldAlert, ChevronLeft, Users, Activity, Settings, DollarSign, Check, X as CloseIcon, TrendingUp, RefreshCw, AlertTriangle, Mail, UserCheck, Search } from 'lucide-react';
import { UserAccount, Transaction, SystemSettings } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaySound: (type: 'WIN' | 'LOSS' | 'CLICK' | 'PLACE') => void;
  onTriggerToast: (type: 'WIN' | 'LOSS' | 'ACHIEVEMENT' | 'LEVEL_UP', title: string, description: string) => void;
  currentUserEmail: string | undefined;
  onRefreshUserBalance: () => Promise<void>;
}

export default function AdminPanel({ isOpen, onClose, onPlaySound, onTriggerToast, currentUserEmail, onRefreshUserBalance }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'transactions' | 'settings' | 'diagnostics' | 'kyc'>('dashboard');
  
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(false);

  const handleApproveKyc = async (email: string) => {
    try {
      await apiFetch('/api/admin/kyc/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      fetchData();
      onTriggerToast('LEVEL_UP', 'KYC APPROVED', `Approved identity for ${email}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectKyc = async (email: string) => {
    try {
      await apiFetch('/api/admin/kyc/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      fetchData();
      onTriggerToast('LOSS', 'KYC REJECTED', `Rejected identity for ${email}`);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/data');
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
        setTransactions(data.transactions || []);
        setSettings(data.settings || null);
      }
    } catch (err) {
      console.error(err);
      onTriggerToast('LOSS', 'CONNECTION ERROR', 'Failed to fetch admin data.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
      onPlaySound('PLACE');
    }
  }, [isOpen]);

  const handleApprove = async (txId: string) => {
    try {
      const res = await apiFetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txId })
      });
      if (res.ok) {
        onPlaySound('WIN');
        onTriggerToast('ACHIEVEMENT', 'TRANSACTION APPROVED', 'The transaction has been successfully approved.');
        fetchData();
        onRefreshUserBalance();
      } else {
        const data = await res.json();
        onTriggerToast('LOSS', 'APPROVAL FAILED', data.error || 'Failed to approve transaction.');
      }
    } catch (err) {
      onTriggerToast('LOSS', 'NETWORK ERROR', 'Could not process request.');
    }
  };

  const handleReject = async (txId: string) => {
    try {
      const res = await apiFetch('/api/admin/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txId })
      });
      if (res.ok) {
        onPlaySound('CLICK');
        onTriggerToast('ACHIEVEMENT', 'TRANSACTION REJECTED', 'The transaction has been rejected.');
        fetchData();
        onRefreshUserBalance();
      }
    } catch (err) {
      onTriggerToast('LOSS', 'NETWORK ERROR', 'Could not process request.');
    }
  };

  const handleAdjustBalance = async (email: string, amount: number, balanceType: 'live' | 'demo') => {
    try {
      const res = await apiFetch('/api/admin/adjust-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, amount, balanceType })
      });
      if (res.ok) {
        onPlaySound('WIN');
        onTriggerToast('LEVEL_UP', 'BALANCE UPDATED', `Successfully adjusted ${balanceType} balance.`);
        fetchData();
        if (email.toLowerCase() === currentUserEmail?.toLowerCase()) {
          onRefreshUserBalance();
        }
      }
    } catch (err) {
      onTriggerToast('LOSS', 'NETWORK ERROR', 'Could not process request.');
    }
  };

  const handleSaveSettings = async (newSettings: SystemSettings) => {
    try {
      const res = await apiFetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      if (res.ok) {
        onPlaySound('WIN');
        onTriggerToast('ACHIEVEMENT', 'SETTINGS SAVED', 'Platform configuration updated successfully.');
        fetchData();
      }
    } catch (err) {
      onTriggerToast('LOSS', 'NETWORK ERROR', 'Could not process request.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md overflow-y-auto font-sans text-gray-300">
      <div className="flex min-h-full items-center justify-center p-4 py-10">
        <div className="relative w-full max-w-6xl bg-[#080c14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#0a0f1d] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-500/20 border border-rose-500/30 rounded-xl flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-white font-bold text-lg tracking-wide uppercase font-mono">System Terminal</h2>
                <span className="text-[10px] text-rose-400 uppercase tracking-wider font-bold">Admin Clearance Authorized</span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer">
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex flex-1 overflow-hidden">
            <div className="w-64 bg-[#0a0f1d] border-r border-white/5 p-4 flex flex-col gap-2 overflow-y-auto shrink-0">
              <NavButton icon={Activity} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
              <NavButton icon={Users} label="User Database" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
              <NavButton icon={TrendingUp} label="Transactions" active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} />
              <NavButton icon={Settings} label="Global Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
              <NavButton icon={UserCheck} label="KYC Review" active={activeTab === 'kyc'} onClick={() => setActiveTab('kyc')} />
              <NavButton icon={Mail} label="Diagnostics" active={activeTab === 'diagnostics'} onClick={() => setActiveTab('diagnostics')} />
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
              ) : (
                <>
                  {activeTab === 'dashboard' && <DashboardTab accounts={accounts} transactions={transactions} settings={settings} />}
                  {activeTab === 'users' && <UsersTab accounts={accounts} onAdjustBalance={handleAdjustBalance} />}
                  {activeTab === 'transactions' && <TransactionsTab transactions={transactions} onApprove={handleApprove} onReject={handleReject} />}
                  {activeTab === 'settings' && <SettingsTab settings={settings} onSave={handleSaveSettings} />}
                  {activeTab === 'diagnostics' && <DiagnosticsTab />}
                  {activeTab === 'kyc' && <KycReviewTab accounts={accounts} onApproveKyc={handleApproveKyc} onRejectKyc={handleRejectKyc} />}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavButton({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
        active 
          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
          : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function DashboardTab({ accounts, transactions, settings }: { accounts: UserAccount[], transactions: Transaction[], settings: SystemSettings | null }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Platform Profit" value={`$${(settings?.platformProfit || 0).toFixed(2)}`} icon={DollarSign} color="text-emerald-400" />
        <StatCard title="Total Users" value={accounts.length.toString()} icon={Users} color="text-blue-400" />
        <StatCard title="Total Transactions" value={transactions.length.toString()} icon={Activity} color="text-purple-400" />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) {
  return (
    <div className="bg-[#05080e] border border-white/5 p-5 rounded-xl flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">{title}</span>
        <span className={`text-xl font-bold font-mono ${color}`}>{value}</span>
      </div>
    </div>
  );
}

function UsersTab({ accounts, onAdjustBalance }: { accounts: UserAccount[], onAdjustBalance: (email: string, amount: number, type: 'live' | 'demo') => void }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wider mb-2">Registered Users</h3>
      {accounts.map(account => (
        <div key={account.email} className="bg-[#05080e] border border-white/5 p-4 rounded-xl flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-white font-bold">{account.fullName}</span>
            <span className="text-xs text-gray-500">{account.email}</span>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-gray-500 uppercase font-mono">Live</span>
              <span className="text-emerald-400 font-bold font-mono">${account.balanceLive.toFixed(2)}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-gray-500 uppercase font-mono">Demo</span>
              <span className="text-blue-400 font-bold font-mono">${account.balanceDemo.toFixed(2)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TransactionsTab({ transactions, onApprove, onReject }: { transactions: Transaction[], onApprove: (id: string) => void, onReject: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wider mb-2">Pending Transactions</h3>
      {transactions.filter(t => t.status === 'PENDING').length === 0 ? (
        <div className="text-gray-500 text-sm">No pending transactions.</div>
      ) : (
        transactions.filter(t => t.status === 'PENDING').map(tx => (
          <div key={tx.id} className="bg-[#05080e] border border-white/5 p-4 rounded-xl flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-white font-bold">{tx.email}</span>
              <span className="text-xs text-gray-500 uppercase">{tx.type} • ${tx.amount}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onApprove(tx.id)} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30">Approve</button>
              <button onClick={() => onReject(tx.id)} className="px-3 py-1 bg-rose-500/20 text-rose-400 rounded hover:bg-rose-500/30">Reject</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function SettingsTab({ settings, onSave }: { settings: SystemSettings | null, onSave: (s: SystemSettings) => void }) {
  const [localSettings, setLocalSettings] = useState<SystemSettings | null>(null);

  useEffect(() => {
    if (settings) setLocalSettings(settings);
  }, [settings]);

  if (!localSettings) return null;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h3 className="text-xl font-bold text-white font-mono uppercase tracking-wider mb-2">Global Settings</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Platform Profit ($)</label>
          <input 
            type="number" 
            value={localSettings.platformProfit} 
            onChange={(e) => setLocalSettings({...localSettings, platformProfit: parseFloat(e.target.value) || 0})}
            className="w-full bg-[#0a0f1d] border border-white/10 rounded-lg p-2 text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Platform Cut (%)</label>
          <input 
            type="number" 
            value={localSettings.platformCutPercent} 
            onChange={(e) => setLocalSettings({...localSettings, platformCutPercent: parseFloat(e.target.value) || 0})}
            className="w-full bg-[#0a0f1d] border border-white/10 rounded-lg p-2 text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Min Deposit ($)</label>
          <input 
            type="number" 
            value={localSettings.minDeposit} 
            onChange={(e) => setLocalSettings({...localSettings, minDeposit: parseFloat(e.target.value) || 0})}
            className="w-full bg-[#0a0f1d] border border-white/10 rounded-lg p-2 text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Min Withdraw ($)</label>
          <input 
            type="number" 
            value={localSettings.minWithdraw} 
            onChange={(e) => setLocalSettings({...localSettings, minWithdraw: parseFloat(e.target.value) || 0})}
            className="w-full bg-[#0a0f1d] border border-white/10 rounded-lg p-2 text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Global Win Rate (%)</label>
        <input 
          type="number" 
          value={localSettings.globalWinRate !== undefined ? localSettings.globalWinRate : 50} 
          onChange={(e) => setLocalSettings({...localSettings, globalWinRate: parseFloat(e.target.value) || 0})}
          className="w-full bg-[#0a0f1d] border border-white/10 rounded-lg p-2 text-white"
        />
      </div>

      {/* Crypto Addresses */}
      <h3 className="text-xl font-bold text-white font-mono uppercase tracking-wider mb-2 mt-6">Crypto Deposit Addresses</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">BTC Address</label>
          <input 
            type="text"
            className="w-full bg-[#0a0f1d] border border-white/10 rounded-lg p-2 text-white"
            value={localSettings.cryptoAddresses?.BTC || ''} 
            onChange={(e) => setLocalSettings({...localSettings, cryptoAddresses: {...(localSettings.cryptoAddresses || {}), BTC: e.target.value} as any})}
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">ETH Address</label>
          <input 
            type="text"
            className="w-full bg-[#0a0f1d] border border-white/10 rounded-lg p-2 text-white"
            value={localSettings.cryptoAddresses?.ETH || ''} 
            onChange={(e) => setLocalSettings({...localSettings, cryptoAddresses: {...(localSettings.cryptoAddresses || {}), ETH: e.target.value} as any})}
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">USDT_TRC20 Address</label>
          <input 
            type="text"
            className="w-full bg-[#0a0f1d] border border-white/10 rounded-lg p-2 text-white"
            value={localSettings.cryptoAddresses?.USDT_TRC20 || ''} 
            onChange={(e) => setLocalSettings({...localSettings, cryptoAddresses: {...(localSettings.cryptoAddresses || {}), USDT_TRC20: e.target.value} as any})}
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">SOL Address</label>
          <input 
            type="text"
            className="w-full bg-[#0a0f1d] border border-white/10 rounded-lg p-2 text-white"
            value={localSettings.cryptoAddresses?.SOL || ''} 
            onChange={(e) => setLocalSettings({...localSettings, cryptoAddresses: {...(localSettings.cryptoAddresses || {}), SOL: e.target.value} as any})}
          />
        </div>
      </div>

      <button 
        onClick={() => onSave(localSettings)}
        className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg"
      >
        Save Configuration
      </button>
    </div>
  );
}

function DiagnosticsTab() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{success: boolean, msg: string} | null>(null);

  const handleTestEmail = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await apiFetch('/api/admin/test-email', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setResult({ success: true, msg: data.message });
      } else {
        setResult({ success: false, msg: data.error || 'Failed to send test email.' });
      }
    } catch (err: any) {
      setResult({ success: false, msg: err.message || 'Network error' });
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h3 className="text-xl font-bold text-white font-mono uppercase tracking-wider mb-2">System Diagnostics</h3>
      
      <div className="bg-[#05080e] border border-white/5 p-5 rounded-xl flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-bold text-white font-mono uppercase">Mail Transport Test</h4>
            <p className="text-xs text-gray-400">Sends a test email to the configured GMAIL_USER address to verify server SMTP configuration.</p>
          </div>
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
            <Mail className="w-5 h-5" />
          </div>
        </div>
        
        <button 
          onClick={handleTestEmail}
          disabled={loading}
          className="self-start px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded text-xs font-bold transition-colors disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Test Email'}
        </button>
        
        {result && (
          <div className={`p-3 rounded text-xs border flex items-start gap-2 ${result.success ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
            {result.success ? <Check className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{result.msg}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function KycReviewTab({ accounts, onApproveKyc, onRejectKyc }: { accounts: UserAccount[], onApproveKyc: (email: string) => void, onRejectKyc: (email: string) => void }) {
  const pendingAccounts = accounts.filter(a => a.kycStatus === 'PENDING');

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wider mb-2">Identity Verification Queue</h3>
      {pendingAccounts.length === 0 ? (
        <div className="text-gray-500 text-sm">No pending KYC submissions.</div>
      ) : (
        pendingAccounts.map(account => (
          <div key={account.email} className="bg-[#05080e] border border-white/5 p-4 rounded-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-white font-bold">{account.fullName}</span>
                <span className="text-xs text-gray-500">{account.email}</span>
                <span className="text-xs text-blue-400 mt-1 uppercase font-mono tracking-wider">Submitted: {new Date(account.kycSubmittedAt || 0).toLocaleString()}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onApproveKyc(account.email!)} className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded text-xs font-bold font-mono tracking-wider hover:bg-emerald-500/30">Approve</button>
                <button onClick={() => onRejectKyc(account.email!)} className="px-4 py-2 bg-rose-500/20 text-rose-400 rounded text-xs font-bold font-mono tracking-wider hover:bg-rose-500/30 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Flag / Reject
                </button>
              </div>
            </div>
            
            {/* Image Comparison View */}
            <div className="grid grid-cols-2 gap-4 mt-2 p-3 bg-white/5 rounded-lg">
              <div className="flex flex-col gap-2">
                <div className="text-xs font-mono text-gray-400 uppercase tracking-wider text-center">ID Document</div>
                {account.kycIdImage ? (
                  <div className="aspect-video bg-black/50 rounded flex items-center justify-center overflow-hidden border border-white/5 relative group">
                    <img src={account.kycIdImage} alt="ID Document" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="aspect-video bg-black/50 rounded flex items-center justify-center border border-white/5 text-gray-600 text-xs">No Image</div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-xs font-mono text-gray-400 uppercase tracking-wider text-center">Self-Portrait</div>
                {account.kycSelfieImage ? (
                  <div className="aspect-video bg-black/50 rounded flex items-center justify-center overflow-hidden border border-white/5 relative group">
                    <img src={account.kycSelfieImage} alt="Selfie" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="aspect-video bg-black/50 rounded flex items-center justify-center border border-white/5 text-gray-600 text-xs">No Image</div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
