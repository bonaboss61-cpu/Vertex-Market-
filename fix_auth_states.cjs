const fs = require('fs');
let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

const missingStates = `
  const [referralCode, setReferralCode] = useState('');
  const [kycLegalName, setKycLegalName] = useState('');
  const [kycDob, setKycDob] = useState('');
  const [kycDocNumber, setKycDocNumber] = useState('');
  const [kycCountry, setKycCountry] = useState('US');
  const [kycDocType, setKycDocType] = useState('ID_CARD');
  const [kycIdImage, setKycIdImage] = useState<string | null>(null);
  const [kycSelfieImage, setKycSelfieImage] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStepText, setScanStepText] = useState('');
  
  const currentCountryConfig = { requiresSsn: false };
`;

code = code.replace("const [resendTimer, setResendTimer] = useState(0);", "const [resendTimer, setResendTimer] = useState(0);\n" + missingStates);

code = code.replace(/winSound\(\)/g, "if (onPlaySound) onPlaySound('WIN')");
code = code.replace(/clickSound\(\)/g, "if (onPlaySound) onPlaySound('CLICK')");

// Fix `message does not exist on type {status: string}`
// err.message -> err?.message
code = code.replace(/err\.message \|\| 'Failed to create account\.'/g, "(err as any)?.message || 'Failed to create account.'");
code = code.replace(/setAuthError\(err\.message \|\| 'Google Sign-in failed\.'\);/g, "setAuthError((err as any)?.message || 'Google Sign-in failed.');");

fs.writeFileSync('src/components/AuthKycModal.tsx', code);
