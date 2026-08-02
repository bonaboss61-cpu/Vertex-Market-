const fs = require('fs');
let code = fs.readFileSync('src/components/DepositWithdrawModal.tsx', 'utf8');
code = code.replace("setCryptoAddresses(data.settings.cryptoAddresses);", "setCryptoAddresses(settings.cryptoAddresses);");
fs.writeFileSync('src/components/DepositWithdrawModal.tsx', code);
