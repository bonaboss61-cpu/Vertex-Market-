const fs = require('fs');
let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

const replacement = `
      const syncRes = await apiService.syncUser(accountData.email, { email: accountData.email, fullName: accountData.fullName });
      if (!syncRes.success) {
        throw new Error('Failed to register account in database.');
      }
      
      if (onReplaceAccount) {
        onReplaceAccount({ ...syncRes.account, isLoggedIn: true } as any);
      }
`;

code = code.replace(/const syncRes = await apiService\.syncUser\(accountData\.email, accountData\);\n\s*if \(\!syncRes\.success\) \{\n\s*throw new Error\('Failed to register account in database\.'\);\n\s*\}\n\s*if \(onReplaceAccount\) \{\n\s*onReplaceAccount\(accountData as UserAccount\);\n\s*\}/g, replacement);

fs.writeFileSync('src/components/AuthKycModal.tsx', code);
