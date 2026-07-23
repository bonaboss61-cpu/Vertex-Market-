const fs = require('fs');
let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

// For SignUp
const signupOld = "onTriggerToast?.('LEVEL_UP', 'VERIFICATION REQUIRED', `An OTP has been sent to ${email}.`);";
const signupNew = "onTriggerToast?.('LEVEL_UP', 'VERIFICATION REQUIRED', data.otp ? `Demo Mode OTP: ${data.otp}` : `An OTP has been sent to ${email}.`);";
code = code.replace(signupOld, signupNew);

// For Login
const loginOld = "onTriggerToast?.('LEVEL_UP', 'VERIFICATION REQUIRED', `We've sent a code to ${email} to confirm your login.`);";
const loginNew = "onTriggerToast?.('LEVEL_UP', 'VERIFICATION REQUIRED', data.otp ? `Demo Mode OTP: ${data.otp}` : `We've sent a code to ${email} to confirm your login.`);";
code = code.replace(loginOld, loginNew);

// For Forgot Password step 0
const forgotOld = "onTriggerToast?.('LEVEL_UP', 'OTP SENT', `Verification code sent to ${email}`);";
const forgotNew = "onTriggerToast?.('LEVEL_UP', 'OTP SENT', data.otp ? `Demo Mode OTP: ${data.otp}` : `Verification code sent to ${email}`);";
code = code.replace(forgotOld, forgotNew);

fs.writeFileSync('src/components/AuthKycModal.tsx', code);
