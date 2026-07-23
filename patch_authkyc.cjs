const fs = require('fs');
let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

code = code.replace(
  "  onUpdateAccount: (updated: Partial<UserAccount>) => void;",
  "  onUpdateAccount: (updated: Partial<UserAccount>) => void;\n  onReplaceAccount?: (acc: UserAccount) => void;\n  onClearHistory?: () => void;"
);

code = code.replace(
  "  onUpdateAccount,",
  "  onUpdateAccount,\n  onReplaceAccount,\n  onClearHistory,"
);

code = code.replace(
  "  const [isLoading, setIsLoading] = useState(false);",
  "  const [isLoading, setIsLoading] = useState(false);\n  const [pendingUser, setPendingUser] = useState<UserAccount | null>(null);"
);

// Update login to save user
code = code.replace(
  "      if (!loginData.success) {",
  "      if (loginData.user) { setPendingUser(loginData.user); }\n      if (!loginData.success) {"
);

// Update verifyOtp to replace account if pendingUser exists (login), otherwise just clear history and start fresh (signup)
const verifyOtpOld = `      if (data.success) {
        winSound();
        const derivedName = fullName || email.split('@')[0].toUpperCase();
        const cleanRefCode = referralCode ? referralCode.trim().toUpperCase() : '';
        const generatedCode = derivedName.replace(/\\s+/g, '').toUpperCase().slice(0, 10);
        
        onUpdateAccount({
          isLoggedIn: true,
          email: email,
          fullName: account.fullName || derivedName,
          kycStatus: account.kycStatus === 'VERIFIED' ? 'VERIFIED' : 'UNVERIFIED',
          referredBy: cleanRefCode || undefined,
          affiliateCode: account.affiliateCode || generatedCode,
          affiliateBalance: account.affiliateBalance || 0,
          referralsCount: account.referralsCount || 0
        });
        
        onTriggerToast?.('LEVEL_UP', 'EMAIL VERIFIED', \`Welcome to Vertex Options, \${derivedName}!\`);`;

const verifyOtpNew = `      if (data.success) {
        winSound();
        if (onClearHistory) onClearHistory();
        const derivedName = fullName || email.split('@')[0].toUpperCase();
        const cleanRefCode = referralCode ? referralCode.trim().toUpperCase() : '';
        const generatedCode = derivedName.replace(/\\s+/g, '').toUpperCase().slice(0, 10);
        
        if (pendingUser && onReplaceAccount) {
          onReplaceAccount({ ...pendingUser, isLoggedIn: true });
        } else if (onReplaceAccount) {
          onReplaceAccount({
            email: email,
            fullName: derivedName,
            balanceDemo: 10000.0,
            balanceLive: 0.0,
            level: 1,
            xp: 0,
            isLive: false,
            badges: [],
            isLoggedIn: true,
            kycStatus: 'UNVERIFIED',
            joinedTournaments: [],
            tournamentScores: {},
            weeklyProfit: 0,
            referredBy: cleanRefCode || undefined,
            affiliateCode: generatedCode,
            affiliateBalance: 0,
            referralsCount: 0
          });
        }
        
        onTriggerToast?.('LEVEL_UP', 'EMAIL VERIFIED', \`Welcome to Vertex Options, \${derivedName}!\`);`;

code = code.replace(verifyOtpOld, verifyOtpNew);
fs.writeFileSync('src/components/AuthKycModal.tsx', code);
