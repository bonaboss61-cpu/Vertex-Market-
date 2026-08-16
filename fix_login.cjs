const fs = require('fs');
let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

const replacement = `
      const derivedName = email.split('@')[0].toUpperCase();
      const accountData = {
        email: email,
        fullName: derivedName,
        isLoggedIn: true
      };
      const syncRes = await apiService.syncUser(accountData.email, accountData);
      if (syncRes.success && syncRes.account) {
        if (onReplaceAccount) onReplaceAccount({ ...syncRes.account, isLoggedIn: true } as any);
      } else {
        if (onReplaceAccount) onReplaceAccount(accountData as any);
      }
`;

code = code.replace(/const derivedName = email\.split\('@'\)\[0\]\.toUpperCase\(\);\n\s*const accountData = \{\n\s*email: email,\n\s*fullName: derivedName,\n\s*balanceDemo: 10000\.0,\n\s*balanceLive: 0\.0,\n\s*level: 1,\n\s*xp: 0,\n\s*isLive: false,\n\s*badges: \[\],\n\s*isLoggedIn: true,\n\s*kycStatus: 'UNVERIFIED' as 'UNVERIFIED',\n\s*joinedTournaments: \[\],\n\s*tournamentScores: \{\},\n\s*weeklyProfit: 0,\n\s*\};\n\s*if \(onReplaceAccount\) \{\n\s*onReplaceAccount\(accountData\);\n\s*\}/, replacement);

fs.writeFileSync('src/components/AuthKycModal.tsx', code);
