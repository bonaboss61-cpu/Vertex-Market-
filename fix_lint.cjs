const fs = require('fs');

// Fix AuthKycModal.tsx
let auth = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');
auth = auth.replace(/import\.meta\.env/g, "(import.meta as any).env");
fs.writeFileSync('src/components/AuthKycModal.tsx', auth);

// Fix apiService.ts
let api = fs.readFileSync('src/services/apiService.ts', 'utf8');
if (!api.includes('import { apiFetch }')) {
  api = api.replace("import { MarketAnalysis, UserAccount, Transaction } from '../types';", "import { MarketAnalysis, UserAccount, Transaction } from '../types';\nimport { apiFetch } from '../lib/apiFetch';");
  fs.writeFileSync('src/services/apiService.ts', api);
}

// Fix TradingChart.tsx
let chart = fs.readFileSync('src/components/TradingChart.tsx', 'utf8');
chart = chart.replace(/setDrawingMode\(false\)/g, "setDrawingMode(null as any)");
fs.writeFileSync('src/components/TradingChart.tsx', chart);

