const fs = require('fs');
let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

// I will extract the injected block
const badPart = `  }

  return () => clearInterval(interval);
  }, [resendTimer]);`;

const replacementPart = `  }

  return (
`;

// However, I need to restore the clearInterval inside useEffect.
// I will just replace the whole handleForgotPassword + useEffect part

code = code.replace(/React\.useEffect\(\(\) => \{[\s\S]*?return \(\) => clearInterval\(interval\);\n  \}, \[resendTimer\]\);/g, `
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);
`);

code = code.replace(/const handleForgotPassword = async \(e: React\.FormEvent\) => \{[\s\S]*?&larr; Back to Login\n              <\/button>\n            <\/form>\n          <\/div>\n        <\/div>\n      <\/div>\n    \);\n  \}\n/g, "");

fs.writeFileSync('src/components/AuthKycModal.tsx', code);
