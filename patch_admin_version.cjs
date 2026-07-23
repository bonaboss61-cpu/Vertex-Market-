const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Patch mock verification in /api/user/transaction
code = code.replace(
  "user.totalDeposits = (user.totalDeposits || 0) + tx.amount;\n        user.hasClaimedInitialBonus = true; // Claim the welcome promo",
  "user.totalDeposits = (user.totalDeposits || 0) + tx.amount;\n        user.hasClaimedInitialBonus = true; // Claim the welcome promo\n        user.adminBalanceVersion = (user.adminBalanceVersion || 0) + 1;"
);

// Patch flutterwave in /api/flutterwave/verify
code = code.replace(
  "user.totalDeposits = (user.totalDeposits || 0) + tx.amount;\n            user.hasClaimedInitialBonus = true; // Claim the promo",
  "user.totalDeposits = (user.totalDeposits || 0) + tx.amount;\n            user.hasClaimedInitialBonus = true; // Claim the promo\n            user.adminBalanceVersion = (user.adminBalanceVersion || 0) + 1;"
);

// Patch admin approve in /api/admin/approve
code = code.replace(
  "user.totalDeposits = (user.totalDeposits || 0) + tx.amount;\n  }",
  "user.totalDeposits = (user.totalDeposits || 0) + tx.amount;\n    user.adminBalanceVersion = (user.adminBalanceVersion || 0) + 1;\n  }"
);

// Patch admin reject in /api/admin/reject (because it refunds live balance)
code = code.replace(
  "user.balanceLive = parseFloat((user.balanceLive + tx.amount).toFixed(2));\n  }",
  "user.balanceLive = parseFloat((user.balanceLive + tx.amount).toFixed(2));\n    user.adminBalanceVersion = (user.adminBalanceVersion || 0) + 1;\n  }"
);


fs.writeFileSync('server.ts', code);
