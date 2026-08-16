const fs = require('fs');

// Patch apiService.ts
let apiCode = fs.readFileSync('src/services/apiService.ts', 'utf8');
apiCode = apiCode.replace(
  /async autoVerifyKyc\(payload: \{ email: string; idImage: string; idImageBack\?: string; selfieImage: string \}\)/,
  "async autoVerifyKyc(payload: { email: string; idImage: string; idImageBack?: string; selfieImage: string; legalName?: string; dob?: string; docNumber?: string; docType?: string; country?: string })"
);
fs.writeFileSync('src/services/apiService.ts', apiCode);

// Patch AuthKycModal.tsx
let modalCode = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');
modalCode = modalCode.replace(
  /idImageBack: kycIdSideType === 'FRONT_BACK' \? \(kycIdImageBack \|\| undefined\) : undefined,\n\s*selfieImage: kycSelfieImage \|\| ''/,
  "idImageBack: kycIdSideType === 'FRONT_BACK' ? (kycIdImageBack || undefined) : undefined,\n        selfieImage: kycSelfieImage || '',\n        legalName: kycLegalName,\n        dob: kycDob,\n        docNumber: kycDocNumber,\n        docType: kycDocType,\n        country: kycCountry"
);
fs.writeFileSync('src/components/AuthKycModal.tsx', modalCode);

// Patch server.ts
let serverCode = fs.readFileSync('server.ts', 'utf8');
serverCode = serverCode.replace(
  /const \{ email, idImage, idImageBack, selfieImage \} = req\.body;/,
  "const { email, idImage, idImageBack, selfieImage, legalName, dob, docNumber, docType, country } = req.body;"
);
serverCode = serverCode.replace(
  /user\.kycSubmittedAt = Date\.now\(\);/,
  "user.kycSubmittedAt = Date.now();\n  if (legalName) user.fullName = legalName;\n  if (dob) user.kycDob = dob;\n  if (docNumber) user.kycDocNumber = docNumber;\n  if (docType) user.kycDocType = docType;\n  if (country) user.kycCountry = country;"
);
fs.writeFileSync('server.ts', serverCode);

