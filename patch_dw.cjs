const fs = require('fs');
let code = fs.readFileSync('src/components/DepositWithdrawModal.tsx', 'utf8');

if (!code.includes("import { apiService }")) {
  code = code.replace("import { apiFetch } from '../lib/apiFetch.ts';", "import { apiFetch } from '../lib/apiFetch.ts';\nimport { apiService } from '../services/apiService.ts';");
}

code = code.replace(/const res = await apiFetch\('\/api\/settings'\);\n        if \(res\.ok\) \{\n          const data = await res\.json\(\);\n          if \(data\.settings && data\.settings\.cryptoAddresses\) \{/g, 
`const settings = await apiService.getSettings();
        if (settings) {
          if (settings.cryptoAddresses) {`);
          
code = code.replace(/apiFetch\(\`\/api\/user\/transactions\?email=\$\{encodeURIComponent\(account\.email\)\}\`\)\n        \.then\(res => res\.json\(\)\)\n        \.then\(data => \{\n          if \(data\.success\) \{\n            setTransactions\(data\.transactions\);\n          \}/g,
`apiService.getUserTransactions(account.email).then(transactions => {
            setTransactions(transactions);`);

code = code.replace(/const response = await apiFetch\('\/api\/user\/transaction', \{\n                  method: 'POST',\n                  headers: \{ 'Content-Type': 'application\/json' \},\n                  body: JSON\.stringify\(\{([\s\S]*?)\}\)\n                \}\);\n                const data = await response\.json\(\);\n                if \(data\.success\) \{/g,
`const response = await apiService.createTransaction({$1});
                if (response.success) {`);
                
fs.writeFileSync('src/components/DepositWithdrawModal.tsx', code);
