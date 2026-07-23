const fs = require('fs');
let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

const regex = /  const runVerificationScan = \(\) => \{[\s\S]*?    \}, 150\);\n  \};\n/;

const replacement = `  const runVerificationScan = async () => {
    setKycStep(3);
    setScanProgress(0);
    setScanStepText('Uploading encrypted identity packets...');
    
    // Start fake progress while we wait for the server
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += Math.random() * 5;
      if (currentProgress > 90) currentProgress = 90; // clamp to 90% until done
      
      if (currentProgress <= 25) {
        setScanStepText('Establishing high-security bio-hash pipeline...');
      } else if (currentProgress <= 55) {
        setScanStepText('Scanning document layout & security holographic seals...');
      } else if (currentProgress <= 80) {
        setScanStepText('AI Face Match: Analyzing photo coordinates vs biometric indices...');
      } else {
        setScanStepText('Running blacklist & anti-money laundering global ledger queries...');
      }
      setScanProgress(Math.min(currentProgress, 90));
    }, 200);

    try {
      const response = await fetch('/api/kyc/auto-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: account.email,
          idImage: kycIdImage,
          selfieImage: kycSelfieImage
        })
      });
      
      const data = await response.json();
      
      clearInterval(progressInterval);
      setScanProgress(100);
      setScanStepText('Verification complete.');
      
      setTimeout(() => {
        if (data.status === 'VERIFIED') {
          winSound();
          onUpdateAccount({
            kycStatus: 'VERIFIED',
            fullName: kycLegalName || account.fullName || 'Verified Trader',
            xp: account.xp + 150
          });
          setKycStep(4);
          onTriggerToast?.('WIN', 'IDENTITY VERIFIED', 'Congratulations! Your KYC is approved. Real-funds Live Trading is unlocked!');
        } else {
          // PENDING (manual review)
          onUpdateAccount({
            kycStatus: 'PENDING',
            fullName: kycLegalName || account.fullName || 'Pending Trader',
            kycIdImage: kycIdImage,
            kycSelfieImage: kycSelfieImage,
            kycSubmittedAt: Date.now()
          });
          setKycStep(4);
          onTriggerToast?.('LEVEL_UP', 'MANUAL REVIEW REQUIRED', data.message || 'Identity sent to manual review queue.');
        }
      }, 500);
      
    } catch (err) {
      clearInterval(progressInterval);
      setScanProgress(100);
      
      setTimeout(() => {
        // Fallback to pending
        onUpdateAccount({
          kycStatus: 'PENDING',
          fullName: kycLegalName || account.fullName || 'Pending Trader',
          kycIdImage: kycIdImage,
          kycSelfieImage: kycSelfieImage,
          kycSubmittedAt: Date.now()
        });
        setKycStep(4);
        onTriggerToast?.('LEVEL_UP', 'MANUAL REVIEW REQUIRED', 'Could not reach verification server. Sent to manual queue.');
      }, 500);
    }
  };
`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/AuthKycModal.tsx', code);
