const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Remove the client-overrides-server logic for KYC.
code = code.replace(
  /\s*\/\/ Only update KYC on server if the client provided a change \(unverified -> pending\)\n\s*if \(userAccount\.kycStatus === 'PENDING' && existingUser\.kycStatus === 'UNVERIFIED'\) \{\n\s*existingUser\.kycStatus = 'PENDING';\n\s*existingUser\.kycIdImage = userAccount\.kycIdImage;\n\s*existingUser\.kycSelfieImage = userAccount\.kycSelfieImage;\n\s*existingUser\.kycSubmittedAt = userAccount\.kycSubmittedAt;\n\s*\}/,
  ""
);

fs.writeFileSync('server.ts', code);
