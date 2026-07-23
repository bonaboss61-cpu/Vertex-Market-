const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const withdrawCheckOld = `    // Enforce trade volume equivalent to deposits
    const requiredVolume = user.totalDeposits || 0;
    const currentVolume = user.liveTradeVolume || 0;
    if (requiredVolume > 0 && currentVolume < requiredVolume) {
      res.status(400).json({ error: \`You must reach a live trading volume equivalent to your total deposits ($\${requiredVolume.toFixed(2)}) before withdrawing. Your current volume is $\${currentVolume.toFixed(2)}.\` });
      return;
    }`;

const withdrawCheckNew = `    // Enforce trade volume equivalent to deposits
    const requiredVolume = user.totalDeposits || 0;
    const currentVolume = user.liveTradeVolume || 0;
    const lockedAmount = Math.max(0, requiredVolume - currentVolume);
    const availableToWithdraw = user.balanceLive - lockedAmount;
    
    if (withdrawAmount > availableToWithdraw) {
      if (lockedAmount > 0) {
        res.status(400).json({ error: \`You can only withdraw up to $\${availableToWithdraw.toFixed(2)}. You have $\${lockedAmount.toFixed(2)} locked until you meet the trading volume equivalent of your deposits ($\${requiredVolume.toFixed(2)}).\` });
        return;
      }
    }`;

code = code.replace(withdrawCheckOld, withdrawCheckNew);
fs.writeFileSync('server.ts', code);
