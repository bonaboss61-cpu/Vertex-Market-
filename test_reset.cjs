import { initializeApp } from 'firebase/app';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const auth = getAuth(app);

sendPasswordResetEmail(auth, "bonaboss61@gmail.com").then(() => {
  console.log("Success");
}).catch((e) => {
  console.error("Error:", e.message);
});
