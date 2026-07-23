const fs = require('fs');
let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

code = code.replace("  Fingerprint,\n  ScanFace\n} from 'lucide-react';", "  Fingerprint,\n  ScanFace,\n  Key,\n  Shield\n} from 'lucide-react';");

fs.writeFileSync('src/components/AuthKycModal.tsx', code);
