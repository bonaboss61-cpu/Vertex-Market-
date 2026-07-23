const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "      weeklyProfit: userAccount.weeklyProfit ?? 0",
  "      weeklyProfit: userAccount.weeklyProfit ?? 0,\n      totalDeposits: userAccount.totalDeposits ?? 0,\n      liveTradeVolume: userAccount.liveTradeVolume ?? 0"
);

fs.writeFileSync('server.ts', code);
