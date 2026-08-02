const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

code = code.replace(/const res = await apiFetch\('\/api\/admin\/adjust-balance', \{\n\s*method: 'POST',\n\s*headers: \{ 'Content-Type': 'application\/json' \},\n\s*body: JSON\.stringify\(\{ email, amount, balanceType \}\)\n\s*\}\);\n\s*if \(res\.ok\) \{/g, 
`const data = await apiService.adjustBalance(email, balanceType, amount);
      if (data && data.success) {`);

code = code.replace(/const res = await apiFetch\('\/api\/admin\/settings', \{\n\s*method: 'POST',\n\s*headers: \{ 'Content-Type': 'application\/json' \},\n\s*body: JSON\.stringify\(\{ settings: newSettings \}\)\n\s*\}\);\n\s*if \(res\.ok\) \{/g, 
`const data = await apiService.updateSettings(newSettings);
      if (data && data.success) {`);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
