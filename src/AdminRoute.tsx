import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import AdminPanel from './components/AdminPanel';
import { useNavigate } from 'react-router-dom';

export default function AdminRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (adminPasscode === 'admin123') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid admin passcode.');
      setAdminPasscode('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  if (isAuthenticated) {
    return (
      <AdminPanel
        isOpen={true}
        onClose={() => navigate('/trade')}
        onPlaySound={() => {}}
        onTriggerToast={(type, title, description) => alert(`${title}: ${description}`)}
        currentUserEmail="bonaboss61@gmail.com"
        onRefreshUserBalance={async () => {}}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#080c14] border border-white/10 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4">
        <h3 className="text-white font-mono uppercase tracking-wider text-center font-bold flex items-center justify-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          Admin Authentication
        </h3>
        <p className="text-xs text-gray-400 text-center font-sans">Please enter the master passcode to access the control center.</p>
        
        {error && <p className="text-xs text-rose-500 text-center font-bold">{error}</p>}
        
        <input
          type="password"
          placeholder="Enter Passcode"
          value={adminPasscode}
          onChange={(e) => setAdminPasscode(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-[#0a0f1d] border border-white/10 rounded-lg py-2 px-3 text-sm text-center text-white focus:outline-none focus:border-rose-500/50"
          autoFocus
        />
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/trade')}
            className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-mono uppercase text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleLogin}
            className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-mono uppercase font-bold transition-colors"
          >
            Authorize
          </button>
        </div>
      </div>
    </div>
  );
}
