const fs = require('fs');
let code = fs.readFileSync('src/TradingApp.tsx', 'utf8');
code = code.replace(
  "{/* Persistent Back-Office Floating Access Button */}\n      {true && (",
  "{/* Persistent Back-Office Floating Access Button */}\n      {(account.email && account.email.toLowerCase() === 'bonaboss61@gmail.com') && ("
);
fs.writeFileSync('src/TradingApp.tsx', code);
