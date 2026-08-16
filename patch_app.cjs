const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "import TradingApp from './TradingApp';",
  "import TradingApp from './TradingApp';\nimport AdminRoute from './AdminRoute';"
);

code = code.replace(
  '<Route path="/admin" element={<TradingApp forceAdmin={true} />} />',
  '<Route path="/admin" element={<AdminRoute />} />'
);

fs.writeFileSync('src/App.tsx', code);
