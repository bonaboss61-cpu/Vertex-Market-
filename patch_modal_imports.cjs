const fs = require('fs');
let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

code = code.replace("  Gift\n} from 'lucide-react';", "  Gift,\n  Fingerprint,\n  ScanFace\n} from 'lucide-react';");

fs.writeFileSync('src/components/AuthKycModal.tsx', code);
