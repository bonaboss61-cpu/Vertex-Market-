const fs = require('fs');
let code = fs.readFileSync('src/components/DepositWithdrawModal.tsx', 'utf8');

code = code.replace(/const response = await apiFetch\('\/api\/user\/transaction', \{\n\s*method: 'POST',\n\s*headers: \{ 'Content-Type': 'application\/json' \},\n\s*body: JSON\.stringify\(\{([\s\S]*?)\}\)\n\s*\}\);\n\s*if \(\!response\.ok\) throw new Error\('Transaction failed'\);\n\s*const data = await response\.json\(\);\n\s*if \(data\.success\) \{/g,
  `const data = await apiService.createTransaction({$1});
                if (data.success) {`);

code = code.replace(/const response = await apiFetch\('\/api\/user\/transaction', \{\n\s*method: 'POST',\n\s*headers: \{ 'Content-Type': 'application\/json' \},\n\s*body: JSON\.stringify\(\{([\s\S]*?)\}\)\n\s*\}\);\n\s*if \(\!response\.ok\) \{\n\s*const errData = await response\.json\(\);\n\s*throw new Error\(errData\.error \|\| 'Server rejected withdrawal request'\);\n\s*\}\n\s*const data = await response\.json\(\);\n\s*if \(data\.success\) \{/g,
  `const data = await apiService.createTransaction({$1});
            if (!data.success) {
              throw new Error('Server rejected withdrawal request');
            }
            if (data.success) {`);

fs.writeFileSync('src/components/DepositWithdrawModal.tsx', code);
