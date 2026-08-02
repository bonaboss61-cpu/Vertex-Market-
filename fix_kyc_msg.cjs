const fs = require('fs');
let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');
code = code.replace(/data\.message \|\|/g, "/*data.message ||*/");
fs.writeFileSync('src/components/AuthKycModal.tsx', code);
