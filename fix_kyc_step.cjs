const fs = require('fs');

let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

const hook = `
  React.useEffect(() => {
    if (account?.kycStatus === 'UNVERIFIED' && kycStep === 4) {
      setKycStep(1);
    }
  }, [account?.kycStatus, kycStep]);

  React.useEffect(() => {
`;

code = code.replace(/React\.useEffect\(\(\) => \{/m, hook);

fs.writeFileSync('src/components/AuthKycModal.tsx', code);
