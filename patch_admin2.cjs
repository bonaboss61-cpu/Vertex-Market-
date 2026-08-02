const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

code = code.replace(/const res = await apiFetch\('\/api\/admin\/data'\);\n\s*if \(res\.ok\) \{\n\s*const data = await res\.json\(\);/g,
  `const data = await apiService.getAdminData();
      if (data) {`);

code = code.replace(/const res = await apiFetch\('\/api\/admin\/approve', \{\n\s*method: 'POST',\n\s*headers: \{ 'Content-Type': 'application\/json' \},\n\s*body: JSON\.stringify\(\{ txId \}\)\n\s*\}\);\n\s*if \(res\.ok\) \{\n\s*const data = await res\.json\(\);/g,
  `const data = await apiService.approveTransaction(txId);
      if (data) {`);

code = code.replace(/const res = await apiFetch\('\/api\/admin\/reject', \{\n\s*method: 'POST',\n\s*headers: \{ 'Content-Type': 'application\/json' \},\n\s*body: JSON\.stringify\(\{ txId \}\)\n\s*\}\);\n\s*if \(res\.ok\) \{\n\s*const data = await res\.json\(\);/g,
  `const data = await apiService.rejectTransaction(txId);
      if (data) {`);

code = code.replace(/const res = await apiFetch\('\/api\/admin\/adjust-balance', \{\n\s*method: 'POST',\n\s*headers: \{ 'Content-Type': 'application\/json' \},\n\s*body: JSON\.stringify\(\{ email, type: balanceType, amount \}\)\n\s*\}\);\n\s*if \(res\.ok\) \{\n\s*const data = await res\.json\(\);/g,
  `const data = await apiService.adjustBalance(email, balanceType, amount);
      if (data) {`);

code = code.replace(/const res = await apiFetch\('\/api\/admin\/settings', \{\n\s*method: 'POST',\n\s*headers: \{ 'Content-Type': 'application\/json' \},\n\s*body: JSON\.stringify\(\{ settings: newSettings \}\)\n\s*\}\);\n\s*if \(res\.ok\) \{\n\s*const data = await res\.json\(\);/g,
  `const data = await apiService.updateSettings(newSettings);
      if (data) {`);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
