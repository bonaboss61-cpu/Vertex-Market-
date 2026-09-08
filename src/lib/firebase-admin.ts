import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { cert } from 'firebase-admin/app';
import firebaseConfig from '../../firebase-applet-config.json';
import dotenv from 'dotenv';
dotenv.config();

let credential;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    credential = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY));
  }
} catch (e) {
  console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY', e);
}

const app = getApps().length === 0 
  ? initializeApp({ projectId: firebaseConfig.projectId, credential }) 
  : getApp();

export const adminDb = getFirestore(app);
