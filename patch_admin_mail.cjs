const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

code = code.replace("Settings, DollarSign, Check, X as CloseIcon, TrendingUp, RefreshCw, AlertTriangle", "Settings, DollarSign, Check, X as CloseIcon, TrendingUp, RefreshCw, AlertTriangle, Mail");
code = code.replace("useState<'dashboard' | 'users' | 'transactions' | 'settings'>('dashboard')", "useState<'dashboard' | 'users' | 'transactions' | 'settings' | 'diagnostics'>('dashboard')");

code = code.replace(
  "<NavButton icon={Settings} label=\"Global Settings\" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />",
  "<NavButton icon={Settings} label=\"Global Settings\" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />\n              <NavButton icon={Mail} label=\"Diagnostics\" active={activeTab === 'diagnostics'} onClick={() => setActiveTab('diagnostics')} />"
);

code = code.replace(
  "{activeTab === 'settings' && <SettingsTab settings={settings} onSave={handleSaveSettings} />}",
  "{activeTab === 'settings' && <SettingsTab settings={settings} onSave={handleSaveSettings} />}\n                  {activeTab === 'diagnostics' && <DiagnosticsTab />}"
);

const diagTab = `
function DiagnosticsTab() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{success: boolean, msg: string} | null>(null);

  const handleTestEmail = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/test-email', { method: 'POST' });
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
          <div className={\`p-3 rounded text-xs border flex items-start gap-2 \${result.success ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}\`}>
            {result.success ? <Check className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{result.msg}</span>
          </div>
        )}
      </div>
    </div>
  );
}
`;

code += diagTab;

fs.writeFileSync('src/components/AdminPanel.tsx', code);
