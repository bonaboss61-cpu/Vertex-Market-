const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const syncOld = `      existingUser.balanceLive = userAccount.balanceLive ?? existingUser.balanceLive;
      existingUser.balanceDemo = userAccount.balanceDemo ?? existingUser.balanceDemo;
    }`;

const syncNew = `      existingUser.balanceLive = userAccount.balanceLive ?? existingUser.balanceLive;
      existingUser.balanceDemo = userAccount.balanceDemo ?? existingUser.balanceDemo;
      if (userAccount.liveTradeVolume !== undefined) {
        existingUser.liveTradeVolume = Math.max(existingUser.liveTradeVolume || 0, userAccount.liveTradeVolume);
      }
    }`;

code = code.replace(syncOld, syncNew);
fs.writeFileSync('server.ts', code);
