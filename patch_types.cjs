const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');
code = code.replace(/kycIdImage\?: string;\n\s*kycSelfieImage\?: string;/g, "kycIdImage?: string;\n  kycIdImageBack?: string;\n  kycSelfieImage?: string;");
fs.writeFileSync('src/types.ts', code);
