const fs = require('fs');
let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

const replacement = `      setTimeout(() => {
        if (data.status === 'VERIFIED') {
          if (onPlaySound) onPlaySound('WIN');
          onUpdateAccount({
            kycStatus: 'VERIFIED' as 'VERIFIED',
            fullName: kycLegalName || account.fullName || 'Verified Trader',
            xp: account.xp + 150
          });
          setKycStep(4);
          onTriggerToast?.('WIN', 'IDENTITY VERIFIED', 'Congratulations! Your KYC is approved. Real-funds Live Trading is unlocked!');
        } else if (data.status === 'UNCLEAR') {
          onUpdateAccount({
            kycStatus: 'UNVERIFIED' as 'UNVERIFIED',
            fullName: kycLegalName || account.fullName || 'Unverified Trader',
            kycIdImage: undefined,
            kycIdImageBack: undefined,
            kycSelfieImage: undefined
          });
          setKycStep(2);
          setKycIdImage(null);
          setKycIdImageBack(null);
          setKycSelfieImage(null);
          onTriggerToast?.('ERROR', 'AI VERIFICATION FAILED', data.message || 'Images were not clear. Please try again.');
        } else {
          // PENDING (manual review)
          onUpdateAccount({
            kycStatus: 'PENDING' as 'PENDING',
            fullName: kycLegalName || account.fullName || 'Pending Trader',
            kycIdImage: kycIdImage,
            kycIdImageBack: kycIdImageBack,
            kycSelfieImage: kycSelfieImage,
            kycSubmittedAt: Date.now()
          });
          setKycStep(4);
          onTriggerToast?.('LEVEL_UP', 'MANUAL REVIEW REQUIRED', data.message || 'Identity sent to manual review queue.');
        }
      }, 500);`;

code = code.replace(/setTimeout\(\(\) => \{\n\s*if \(data\.status === 'VERIFIED'\) \{[\s\S]*?\}, 500\);/m, replacement);

fs.writeFileSync('src/components/AuthKycModal.tsx', code);
