const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

if (!code.includes("import { apiService }")) {
  code = code.replace("import { apiFetch } from '../lib/apiFetch.ts';", "import { apiFetch } from '../lib/apiFetch.ts';\nimport { apiService } from '../services/apiService.ts';");
}

code = code.replace(/await apiFetch\('\/api\/admin\/kyc\/approve', \{\n\s*method: 'POST',\n\s*headers: \{ 'Content-Type': 'application\/json' \},\n\s*body: JSON\.stringify\(\{ email \}\)\n\s*\}\);/g,
  `await apiService.approveKyc(email);`);

code = code.replace(/await apiFetch\('\/api\/admin\/kyc\/reject', \{\n\s*method: 'POST',\n\s*headers: \{ 'Content-Type': 'application\/json' \},\n\s*body: JSON\.stringify\(\{ email \}\)\n\s*\}\);/g,
  `await apiService.rejectKyc(email);`);

code = code.replace(/const res = await apiFetch\('\/api\/admin\/data'\);\n\s*const data = await res\.json\(\);/g,
  `const data = await apiService.getAdminData();`);

code = code.replace(/const res = await apiFetch\('\/api\/admin\/approve', \{\n\s*method: 'POST',\n\s*headers: \{ 'Content-Type': 'application\/json' \},\n\s*body: JSON\.stringify\(\{ txId: tx\.id \}\)\n\s*\}\);\n\s*const data = await res\.json\(\);/g,
  `const data = await apiService.approveTransaction(tx.id);`);

code = code.replace(/const res = await apiFetch\('\/api\/admin\/reject', \{\n\s*method: 'POST',\n\s*headers: \{ 'Content-Type': 'application\/json' \},\n\s*body: JSON\.stringify\(\{ txId: tx\.id \}\)\n\s*\}\);\n\s*const data = await res\.json\(\);/g,
  `const data = await apiService.rejectTransaction(tx.id);`);

code = code.replace(/const res = await apiFetch\('\/api\/admin\/adjust-balance', \{\n\s*method: 'POST',\n\s*headers: \{ 'Content-Type': 'application\/json' \},\n\s*body: JSON\.stringify\(\{ email, type, amount: newAmount \}\)\n\s*\}\);\n\s*const data = await res\.json\(\);/g,
  `const data = await apiService.adjustBalance(email, type, newAmount);`);

code = code.replace(/const res = await apiFetch\('\/api\/admin\/settings', \{\n\s*method: 'POST',\n\s*headers: \{ 'Content-Type': 'application\/json' \},\n\s*body: JSON\.stringify\(\{ settings: payload \}\)\n\s*\}\);\n\s*const data = await res\.json\(\);/g,
  `const data = await apiService.updateSettings(payload);`);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
