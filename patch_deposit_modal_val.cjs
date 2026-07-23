const fs = require('fs');
let code = fs.readFileSync('src/components/DepositWithdrawModal.tsx', 'utf8');

const valOld = `    if (activeTab === 'withdraw' && resolvedAmount > currentBalance) {
      setErrorMsg(\`Insufficient funds. Your current \${account.isLive ? 'Live' : 'Demo'} balance is \${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}.\`);
      return false;
    }`;

const valNew = `    if (activeTab === 'withdraw') {
      const lockedAmount = account.isLive ? Math.max(0, (account.totalDeposits || 0) - (account.liveTradeVolume || 0)) : 0;
      const availableToWithdraw = currentBalance - lockedAmount;
      if (resolvedAmount > availableToWithdraw) {
        if (lockedAmount > 0) {
          setErrorMsg(\`You can only withdraw up to $\${availableToWithdraw.toFixed(2)}. $\${lockedAmount.toFixed(2)} is locked awaiting trade volume.\`);
        } else {
          setErrorMsg(\`Insufficient funds. Your current \${account.isLive ? 'Live' : 'Demo'} balance is $\${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}.\`);
        }
        return false;
      }
    }`;

code = code.replace(valOld, valNew);
fs.writeFileSync('src/components/DepositWithdrawModal.tsx', code);
