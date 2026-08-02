import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const auth = getAuth(app);

signInWithEmailAndPassword(auth, "bonaboss61@gmail.com", "newpassword123")
  .then(() => console.log("Success login!"))
  .catch(e => console.error("Login failed:", e.message));

signInWithEmailAndPassword(auth, "bonaboss61@gmail.com", "vertex2026")
  .then(() => console.log("Success login with old!"))
  .catch(e => console.error("Login failed with old:", e.message));
