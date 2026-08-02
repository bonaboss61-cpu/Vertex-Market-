const fs = require('fs');
let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

// Add apiService import if not there
if (!code.includes("import { apiService }")) {
  code = code.replace("import { apiFetch } from '../lib/apiFetch.ts';", "import { apiFetch } from '../lib/apiFetch.ts';\nimport { apiService } from '../services/apiService.ts';");
}

const syncRegex = /const syncRes = await apiFetch\('\/api\/user\/sync', \{\n        method: 'POST',\n        headers: \{ 'Content-Type': 'application\/json' \},\n        body: JSON\.stringify\(accountData\)\n      \}\);/g;

code = code.replace(syncRegex, `const syncRes = await apiService.syncUser(accountData.email, accountData) as unknown as Response;`);
// actually, if we replace it this way, wait. The code says:
// const syncRes = await ...
// if (syncRes.ok) {
//    const data = await syncRes.json();
//    if (data.success && data.account) ...
// }

fs.writeFileSync('src/components/AuthKycModal.tsx', code);
