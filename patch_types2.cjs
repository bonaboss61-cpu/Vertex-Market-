const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');
code = code.replace(
  /kycSubmittedAt\?: number;/,
  "kycSubmittedAt?: number;\n  kycDob?: string;\n  kycDocNumber?: string;\n  kycDocType?: string;\n  kycCountry?: string;"
);
fs.writeFileSync('src/types.ts', code);
