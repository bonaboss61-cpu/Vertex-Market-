const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  "  isLive: boolean;",
  "  isLive: boolean;\n  totalDeposits?: number;\n  liveTradeVolume?: number;"
);

fs.writeFileSync('src/types.ts', code);
