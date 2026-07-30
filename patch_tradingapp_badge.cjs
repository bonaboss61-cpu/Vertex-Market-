const fs = require('fs');
let code = fs.readFileSync('src/TradingApp.tsx', 'utf8');

const targetStr = "{/* Persistent Back-Office Floating Access Button */}\n      {(account.email && account.email.toLowerCase() === 'bonaboss61@gmail.com') && (";

const replaceStr = "{/* Persistent Back-Office Floating Access Button */}\n      {(account.isLoggedIn && account.email && account.email.toLowerCase() === 'bonaboss61@gmail.com') && (";

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/TradingApp.tsx', code);
