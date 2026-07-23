const fs = require('fs');
let code = fs.readFileSync('src/TradingApp.tsx', 'utf8');

const balanceUpdateOld = `    // Subtract amount from current account type balance
    setAccount(prev => {
      const demoNext = prev.isLive ? prev.balanceDemo : (prev.balanceDemo - amount);
      const liveNext = prev.isLive ? (prev.balanceLive - amount) : prev.balanceLive;
      return {
        ...prev,
        balanceDemo: demoNext,
        balanceLive: liveNext,
      };
    });`;

const balanceUpdateNew = `    // Subtract amount from current account type balance
    setAccount(prev => {
      const demoNext = prev.isLive ? prev.balanceDemo : (prev.balanceDemo - amount);
      const liveNext = prev.isLive ? (prev.balanceLive - amount) : prev.balanceLive;
      const liveVolNext = prev.isLive ? ((prev.liveTradeVolume || 0) + amount) : (prev.liveTradeVolume || 0);
      return {
        ...prev,
        balanceDemo: demoNext,
        balanceLive: liveNext,
        liveTradeVolume: liveVolNext,
      };
    });`;

code = code.replace(balanceUpdateOld, balanceUpdateNew);
fs.writeFileSync('src/TradingApp.tsx', code);
