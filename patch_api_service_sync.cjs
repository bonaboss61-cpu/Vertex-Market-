const fs = require('fs');

let code = fs.readFileSync('src/services/apiService.ts', 'utf8');

code = code.replace(
  /body: JSON\.stringify\(\{ email, \.\.\.userData \}\)/,
  "body: JSON.stringify({ email, ...userData, kycIdImage: undefined, kycIdImageBack: undefined, kycSelfieImage: undefined })"
);

fs.writeFileSync('src/services/apiService.ts', code);
