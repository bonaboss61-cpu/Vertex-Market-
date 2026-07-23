const fs = require('fs');
let serverCode = fs.readFileSync('server.ts', 'utf8');
serverCode = serverCode.replace('          balanceLive: 100.0,', '          balanceLive: 0.0,');
fs.writeFileSync('server.ts', serverCode);
