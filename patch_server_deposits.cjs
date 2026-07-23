const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Patch mock verification
code = code.replace(
  "        user.balanceLive = parseFloat((user.balanceLive + addedBalance).toFixed(2));\n        user.hasClaimedInitialBonus = true; // Claim the welcome promo",
  "        user.balanceLive = parseFloat((user.balanceLive + addedBalance).toFixed(2));\n        user.totalDeposits = (user.totalDeposits || 0) + tx.amount;\n        user.hasClaimedInitialBonus = true; // Claim the welcome promo"
);

// Patch Flutterwave verification
code = code.replace(
  "            user.balanceLive = parseFloat((user.balanceLive + addedBalance).toFixed(2));\n            user.hasClaimedInitialBonus = true; // Claim the promo",
  "            user.balanceLive = parseFloat((user.balanceLive + addedBalance).toFixed(2));\n            user.totalDeposits = (user.totalDeposits || 0) + tx.amount;\n            user.hasClaimedInitialBonus = true; // Claim the promo"
);

// Patch admin approve
code = code.replace(
  "    const totalAdded = tx.amount + (tx.bonus || 0);\n    user.balanceLive = parseFloat((user.balanceLive + totalAdded).toFixed(2));",
  "    const totalAdded = tx.amount + (tx.bonus || 0);\n    user.balanceLive = parseFloat((user.balanceLive + totalAdded).toFixed(2));\n    user.totalDeposits = (user.totalDeposits || 0) + tx.amount;"
);

fs.writeFileSync('server.ts', code);
