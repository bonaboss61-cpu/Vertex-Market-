const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase-admin.ts', 'utf8');

if (!code.includes('getFirestore')) {
  code = code.replace("import { getAuth } from 'firebase-admin/auth';", "import { getAuth } from 'firebase-admin/auth';\nimport { getFirestore } from 'firebase-admin/firestore';");
  code += "\nexport const adminDb = getFirestore();";
  fs.writeFileSync('src/lib/firebase-admin.ts', code);
}
