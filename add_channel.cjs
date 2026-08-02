const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');
code = code.replace("status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SETTLED_SUCCESS';", "status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SETTLED_SUCCESS';\n  channel?: string;");
fs.writeFileSync('src/types.ts', code);
