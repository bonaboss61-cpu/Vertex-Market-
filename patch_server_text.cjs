const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace("const resultText = response.text();", "const resultText = response.text;");

fs.writeFileSync('server.ts', code);
