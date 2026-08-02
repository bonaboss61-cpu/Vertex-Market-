const fs = require('fs');
let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

code = code.replace(/const syncRes = await apiService\.syncUser\(accountData\.email, accountData\) as unknown as Response;\n      \n      if \(\!syncRes\.ok\) \{/g,
  `const syncRes = await apiService.syncUser(accountData.email, accountData) as any;\n      if (!syncRes.success) {`);

fs.writeFileSync('src/components/AuthKycModal.tsx', code);
