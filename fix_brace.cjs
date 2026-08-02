const fs = require('fs');
let code = fs.readFileSync('src/TradingApp.tsx', 'utf8');
code = code.replace(/          \}\n        \}\n      \}\n    \} catch \(err\) \{/, `          }\n        }\n    } catch (err) {`);
fs.writeFileSync('src/TradingApp.tsx', code);
