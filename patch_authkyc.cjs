const fs = require('fs');
let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

const targetStr = `    if (!fullName || !email || !password || !confirmPassword || !securityAnswer) {
      setAuthError('All registration fields are required.');
      setIsLoading(false);
      return;
    }`;

const replaceStr = `    if (!fullName || !email || !password || !confirmPassword) {
      setAuthError('All registration fields are required.');
      setIsLoading(false);
      return;
    }`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/components/AuthKycModal.tsx', code);
