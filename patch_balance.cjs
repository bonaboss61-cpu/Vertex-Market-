const fs = require('fs');

// Patch TradingApp.tsx
let appCode = fs.readFileSync('src/TradingApp.tsx', 'utf8');
appCode = appCode.replace('balanceLive: 100,', 'balanceLive: 0,');
fs.writeFileSync('src/TradingApp.tsx', appCode);

// Patch server.ts
let serverCode = fs.readFileSync('server.ts', 'utf8');
serverCode = serverCode.replace('balanceLive: userAccount.balanceLive ?? 100.0,', 'balanceLive: userAccount.balanceLive ?? 0.0,');
fs.writeFileSync('server.ts', serverCode);
