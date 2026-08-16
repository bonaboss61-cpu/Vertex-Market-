const fs = require('fs');
let code = fs.readFileSync('src/services/apiService.ts', 'utf8');

code = code.replace(
  "const res = await apiFetch('/api/admin/data');",
  "const res = await apiFetch('/api/admin/data?t=' + Date.now());"
);

code = code.replace(
  "const res = await apiFetch('/api/user/transactions?email=' + encodeURIComponent(email));",
  "const res = await apiFetch('/api/user/transactions?email=' + encodeURIComponent(email) + '&t=' + Date.now());"
);

code = code.replace(
  "const res = await apiFetch('/api/settings');",
  "const res = await apiFetch('/api/settings?t=' + Date.now());"
);

fs.writeFileSync('src/services/apiService.ts', code);
