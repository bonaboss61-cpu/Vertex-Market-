const fs = require('fs');
let code = fs.readFileSync('src/TradingApp.tsx', 'utf8');

// Add import
if (!code.includes("import { apiService }")) {
  code = code.replace("import { apiFetch } from './lib/apiFetch.ts';", "import { apiFetch } from './lib/apiFetch.ts';\nimport { apiService } from './services/apiService.ts';");
}

// Replace sync code
const syncRegex = /const response = await apiFetch\('\/api\/user\/sync', \{[\s\S]*?body: JSON\.stringify\(accToSync\)\n      \}\);\n      if \(response\.ok\) \{\n        const data = await response\.json\(\);\n        if \(data\.success && data\.account\) \{/;

if (code.match(syncRegex)) {
  const newSync = `const data = await apiService.syncUser(accToSync.email, accToSync);
      if (data.success && data.account) {`;
  code = code.replace(syncRegex, newSync);
  // Need to fix the closing brace of response.ok which is wrapping it.
  
  // Find where it ends
  // Actually, we can just remove `if (response.ok) {` and match `}` later? No, it's easier to just use string replacement for the exact block.
}

fs.writeFileSync('src/TradingApp.tsx', code);
