const fs = require('fs');
let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

const securityCheckOld = `    if (!fullName || !email || !password || !confirmPassword) {
      setAuthError('All registration fields are required.');
      setIsLoading(false);
      return;
    }`;

const securityCheckNew = `    if (!fullName || !email || !password || !confirmPassword || !securityAnswer) {
      setAuthError('All registration fields are required.');
      setIsLoading(false);
      return;
    }`;

code = code.replace(securityCheckOld, securityCheckNew);

fs.writeFileSync('src/components/AuthKycModal.tsx', code);
