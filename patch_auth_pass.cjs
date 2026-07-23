const fs = require('fs');
let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

code = code.replace(
  "onReplaceAccount?: (acc: UserAccount) => void;",
  "onReplaceAccount?: (acc: UserAccount & { password?: string; securityAnswer?: string }) => void;"
);

code = code.replace(
  "referredBy: cleanRefCode || undefined,",
  "referredBy: cleanRefCode || undefined,\n            password: password,\n            securityAnswer: securityAnswer,"
);

fs.writeFileSync('src/components/AuthKycModal.tsx', code);
