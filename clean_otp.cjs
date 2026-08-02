const fs = require('fs');
let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

// The JSX elements referencing handleVerifyOtp and handleResendOtp are within {otpStep ? ... : ...}
// We can just strip otpStep conditionally rendering and only render the false branch!

// First, find the login tab's `{otpStep ? ... : ... }`
// Actually, it's safer to just replace `otpStep` state with `false` and ignore it, since React will tree-shake or not render it.
// But better yet, I can just replace `handleVerifyOtp` and `handleResendOtp` with empty functions so they don't break the build if they are still attached to the JSX.
code = code.replace(/const handleResendOtp = async \(\) => \{[\s\S]*?setIsLoading\(false\);\n\s*\}\n\s*\};/m,
`const handleResendOtp = async () => {};`);

code = code.replace(/const handleVerifyOtp = async \(e: React\.FormEvent\) => \{[\s\S]*?setIsLoading\(false\);\n\s*\}\n\s*\};/m,
`const handleVerifyOtp = async (e: React.FormEvent) => { e.preventDefault(); };`);

fs.writeFileSync('src/components/AuthKycModal.tsx', code);
