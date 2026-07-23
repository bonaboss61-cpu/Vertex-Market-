const fs = require('fs');
let code = fs.readFileSync('src/TradingApp.tsx', 'utf8');

code = code.replace(
`        onReplaceAccount={(acc) => setAccount(acc)}
        onClearHistory={() => {
          setCompletedTrades([]);
          localStorage.removeItem('vertex_settled_trades');
        }}`, ""
);

code = code.replace(
  `<AuthKycModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal(prev => ({ ...prev, isOpen: false }))}
        initialTab={authModal.initialTab}
        account={account}
        onUpdateAccount={(updated) => setAccount(prev => ({ ...prev, ...updated }))}`,
  `<AuthKycModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal(prev => ({ ...prev, isOpen: false }))}
        initialTab={authModal.initialTab}
        account={account}
        onUpdateAccount={(updated) => setAccount(prev => ({ ...prev, ...updated }))}
        onReplaceAccount={(acc) => setAccount(acc)}
        onClearHistory={() => {
          setCompletedTrades([]);
          localStorage.removeItem('vertex_settled_trades');
        }}`
);

fs.writeFileSync('src/TradingApp.tsx', code);
