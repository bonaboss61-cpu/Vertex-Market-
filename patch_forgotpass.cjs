const fs = require('fs');
let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

code = code.replace(
  "setIsForgotPassword(false);",
  "setIsForgotPassword(false);\n           setForgotPasswordStep(0);"
);

fs.writeFileSync('src/components/AuthKycModal.tsx', code);
