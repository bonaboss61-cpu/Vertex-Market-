import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { cert } from 'firebase-admin/app';
import firebaseConfig from '../../firebase-applet-config.json';
import dotenv from 'dotenv';
dotenv.config();

let credential;
try {
  let rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (rawKey) {
    // Clean up potential quotes if added by mistake
    if (rawKey.startsWith("'") && rawKey.endsWith("'")) {
      rawKey = rawKey.slice(1, -1);
    }
    credential = cert(JSON.parse(rawKey));
  }
} catch (e) {
  console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', e);
}

const appOptions: any = { projectId: firebaseConfig.projectId };
if (credential) {
  appOptions.credential = credential;
}

const app = getApps().length === 0 ? initializeApp(appOptions) : getApp();

export const adminDb = getFirestore(app);
