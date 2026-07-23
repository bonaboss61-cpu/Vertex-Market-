const fs = require('fs');
let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

const oldVerify = `    if (otpValue === generatedOtp || otpValue === '123456') {
      winSound();
      const cleanRefCode = referralCode.trim().toUpperCase();
      const generatedCode = fullName.replace(/\\s+/g, '').toUpperCase().slice(0, 10);
      onUpdateAccount({
        isLoggedIn: true,
        email: email,
        fullName: fullName,
        kycStatus: 'UNVERIFIED',
        referredBy: cleanRefCode || undefined,
        affiliateCode: generatedCode,
        affiliateBalance: 0,
        referralsCount: 0
      });
      onTriggerToast?.('LEVEL_UP', 'EMAIL VERIFIED', cleanRefCode ? \`Welcome! Associated with affiliate partner "\${cleanRefCode}".\` : 'Your advanced trading profile is now active.');
      setOtpStep(false);
      setActiveTab('kyc');
      setKycStep(1);
    } else {`;

const newVerify = `    if (otpValue === generatedOtp || otpValue === '123456') {
      winSound();
      const derivedName = fullName || email.split('@')[0].toUpperCase();
      const cleanRefCode = referralCode ? referralCode.trim().toUpperCase() : '';
      const generatedCode = derivedName.replace(/\\s+/g, '').toUpperCase().slice(0, 10);
      
      onUpdateAccount({
        isLoggedIn: true,
        email: email,
        fullName: account.fullName || derivedName,
        kycStatus: account.kycStatus === 'VERIFIED' ? 'VERIFIED' : 'UNVERIFIED',
        referredBy: cleanRefCode || undefined,
        affiliateCode: account.affiliateCode || generatedCode,
        affiliateBalance: account.affiliateBalance || 0,
        referralsCount: account.referralsCount || 0
      });
      
      onTriggerToast?.('LEVEL_UP', 'EMAIL VERIFIED', \`Welcome to Vertex Options, \${derivedName}!\`);
      setOtpStep(false);
      
      if (account.kycStatus !== 'VERIFIED') {
        setActiveTab('kyc');
        setKycStep(1);
      } else {
        onClose();
      }
    } else {`;

code = code.replace(oldVerify, newVerify);
fs.writeFileSync('src/components/AuthKycModal.tsx', code);
