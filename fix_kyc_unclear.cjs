const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /if \(analysis\.unclear\) \{\n\s*user\.kycStatus = 'UNVERIFIED'; \/\/ Keep it unverified so they can retry\n\s*writeDb\(db\);\n\s*return res\.json\(\{ success: true, status: 'UNCLEAR', message: analysis\.reason \}\);\n\s*\}/,
  `if (analysis.unclear) {
      user.kycStatus = 'PENDING'; // Send to manual review even if AI thinks it is unclear
      writeDb(db);
      return res.json({ success: true, status: 'PENDING', message: analysis.reason });
    }`
);

fs.writeFileSync('server.ts', code);
