const fs = require('fs');
let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

const target1 = `    setTimeout(async () => {
      try {
        const response = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email })
        });
        const data = await response.json();
        if (data.success) {
          setResendTimer(60);
        }
      } catch (err) {
        console.error(err);
      }
      setIsLoading(false);
      setOtpStep(true);
      onTriggerToast?.('LEVEL_UP', 'VERIFICATION REQUIRED', data.otp ? \`Demo Mode OTP: \${data.otp}\` : \`An OTP has been sent to \${email}.\`);
    }, 1500);`;

const new1 = `    setTimeout(async () => {
      let otpMsg = \`An OTP has been sent to \${email}.\`;
      try {
        const response = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email })
        });
        const data = await response.json();
        if (data.success) {
          setResendTimer(60);
          if (data.otp) otpMsg = \`Demo Mode OTP: \${data.otp}\`;
        }
      } catch (err) {
        console.error(err);
      }
      setIsLoading(false);
      setOtpStep(true);
      onTriggerToast?.('LEVEL_UP', 'VERIFICATION REQUIRED', otpMsg);
    }, 1500);`;

code = code.replace(target1, new1);

const resendTarget = `    try {
      await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      });
      onTriggerToast?.('LEVEL_UP', 'VERIFICATION SENT', \`A new verification code has been sent to \${email}.\`);
    } catch (err) {`;

const resendNew = `    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      });
      const data = await response.json();
      onTriggerToast?.('LEVEL_UP', 'VERIFICATION SENT', data.otp ? \`Demo Mode OTP: \${data.otp}\` : \`A new verification code has been sent to \${email}.\`);
    } catch (err) {`;

code = code.replace(resendTarget, resendNew);

fs.writeFileSync('src/components/AuthKycModal.tsx', code);
