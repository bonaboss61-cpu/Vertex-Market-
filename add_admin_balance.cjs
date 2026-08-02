const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');
code = code.replace("kycStatus?: 'UNVERIFIED' | 'PENDING' | 'VERIFIED';", "kycStatus?: 'UNVERIFIED' | 'PENDING' | 'VERIFIED';\n  adminBalanceVersion?: number;");
fs.writeFileSync('src/types.ts', code);
