const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

code = code.replace(/import \{ initializeFirestore \} from 'firebase\/firestore';\n/, "");
code = code.replace(/export const db = initializeFirestore\(app, \{ experimentalForceLongPolling: true \}\);\n/, "");

fs.writeFileSync('src/lib/firebase.ts', code);
