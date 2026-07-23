const fs = require('fs');
let code = fs.readFileSync('src/TradingApp.tsx', 'utf8');

const replaceAccountOld = `  // Provide a clean way to handle complete account switching
  const handleReplaceAccount = (newAccount: UserAccount) => {
    // Prevent history leakage between accounts
    if (newAccount.email !== account.email) {
      localStorage.removeItem('vertex_settled_trades');
      setCompletedTrades([]);
    }
    setAccount(newAccount);
  };`;

const replaceAccountNew = `  // Provide a clean way to handle complete account switching
  const handleReplaceAccount = (newAccount: UserAccount) => {
    // Prevent history leakage between accounts
    if (newAccount.email !== account.email) {
      localStorage.removeItem('vertex_settled_trades');
      setCompletedTrades([]);
      setActiveTrades([]);
    }
    setAccount(newAccount);
  };`;

code = code.replace(replaceAccountOld, replaceAccountNew);
fs.writeFileSync('src/TradingApp.tsx', code);
