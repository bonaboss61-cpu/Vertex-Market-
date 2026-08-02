const fs = require('fs');
let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

const regex = /const response = await apiFetch\('\/api\/kyc\/auto-verify', \{\n\s*method: 'POST',\n\s*headers: \{ 'Content-Type': 'application\/json' \},\n\s*body: JSON\.stringify\(\{ \n\s*email: account\.email,\n\s*idImage: kycIdImage,\n\s*selfieImage: kycSelfieImage\n\s*\}\)\n\s*\}\);\n\s*const data = await response\.json\(\);/m;

const newCode = `// Move to pending state since we can't run Gemini auto-verify purely on client
      await apiService.syncUser(account.email || '', {
        kycStatus: 'PENDING',
        kycIdImage: kycIdImage || undefined,
        kycSelfieImage: kycSelfieImage || undefined,
        kycSubmittedAt: Date.now()
      });
      const data = { status: 'PENDING' };`;

if (code.match(regex)) {
  code = code.replace(regex, newCode);
  fs.writeFileSync('src/components/AuthKycModal.tsx', code);
  console.log("Patched KYC");
} else {
  console.log("Did not match KYC");
}
