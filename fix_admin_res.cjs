const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');
code = code.replace(/const data = await \/\/res\.json\(\);/g, "const res = await apiFetch('/api/admin/test-email', { method: 'POST' });\n      const data = await res.json();");
fs.writeFileSync('src/components/AdminPanel.tsx', code);
