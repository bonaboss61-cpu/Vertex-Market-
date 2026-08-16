const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `// Only update KYC on server if the client provided a change (unverified -> pending / verified)
    if (userAccount.kycStatus && userAccount.kycStatus !== existingUser.kycStatus) {
      existingUser.kycStatus = userAccount.kycStatus;
      if (userAccount.kycStatus === 'PENDING') {
        existingUser.kycIdImage = userAccount.kycIdImage;
        existingUser.kycSelfieImage = userAccount.kycSelfieImage;
        existingUser.kycSubmittedAt = userAccount.kycSubmittedAt;
      }
    }`,
  `// Only update KYC on server if the client provided a change (unverified -> pending)
    if (userAccount.kycStatus === 'PENDING' && existingUser.kycStatus === 'UNVERIFIED') {
      existingUser.kycStatus = 'PENDING';
      existingUser.kycIdImage = userAccount.kycIdImage;
      existingUser.kycSelfieImage = userAccount.kycSelfieImage;
      existingUser.kycSubmittedAt = userAccount.kycSubmittedAt;
    }`
);

fs.writeFileSync('server.ts', code);
