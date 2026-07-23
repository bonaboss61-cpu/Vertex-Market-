const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// 1. Imports
code = code.replace("AlertTriangle, Mail", "AlertTriangle, Mail, UserCheck, Search");

// 2. State
code = code.replace("useState<'dashboard' | 'users' | 'transactions' | 'settings' | 'diagnostics'>('dashboard')", "useState<'dashboard' | 'users' | 'transactions' | 'settings' | 'diagnostics' | 'kyc'>('dashboard')");

// 3. NavButton
const navSettings = "<NavButton icon={Settings} label=\"Global Settings\" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />";
code = code.replace(navSettings, navSettings + "\n              <NavButton icon={UserCheck} label=\"KYC Review\" active={activeTab === 'kyc'} onClick={() => setActiveTab('kyc')} />");

// 4. Tab Rendering
const diagRender = "{activeTab === 'diagnostics' && <DiagnosticsTab />}";
const kycRender = "{activeTab === 'diagnostics' && <DiagnosticsTab />}\n                  {activeTab === 'kyc' && <KycReviewTab accounts={accounts} onApproveKyc={handleApproveKyc} onRejectKyc={handleRejectKyc} />}";
code = code.replace(diagRender, kycRender);

// 5. Backend functions
const fetchData = `  const fetchData = async () => {`;
const kycFuncs = `  const handleApproveKyc = async (email: string) => {
    try {
      await fetch('/api/admin/kyc/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      fetchData();
      onTriggerToast('LEVEL_UP', 'KYC APPROVED', \`Approved identity for \${email}\`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectKyc = async (email: string) => {
    try {
      await fetch('/api/admin/kyc/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      fetchData();
      onTriggerToast('LOSS', 'KYC REJECTED', \`Rejected identity for \${email}\`);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {`;
code = code.replace(fetchData, kycFuncs);

// 6. KycReviewTab Component
const kycReviewTab = `
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
`;

code += kycReviewTab;

fs.writeFileSync('src/components/AdminPanel.tsx', code);
