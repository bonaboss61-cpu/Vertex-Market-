const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const withdrawCheckOld = `    const withdrawAmount = parseFloat(amount);
    if (user.balanceLive < withdrawAmount) {
      res.status(400).json({ error: 'Insufficient Live balance to withdraw' });
      return;
    }`;

const withdrawCheckNew = `    const withdrawAmount = parseFloat(amount);
    if (user.balanceLive < withdrawAmount) {
      res.status(400).json({ error: 'Insufficient Live balance to withdraw' });
      return;
    }
    
    // Enforce trade volume equivalent to deposits
    const requiredVolume = user.totalDeposits || 0;
    const currentVolume = user.liveTradeVolume || 0;
    if (requiredVolume > 0 && currentVolume < requiredVolume) {
      res.status(400).json({ error: \`You must reach a live trading volume equivalent to your total deposits ($\${requiredVolume.toFixed(2)}) before withdrawing. Your current volume is $\${currentVolume.toFixed(2)}.\` });
      return;
    }`;

code = code.replace(withdrawCheckOld, withdrawCheckNew);
fs.writeFileSync('server.ts', code);
