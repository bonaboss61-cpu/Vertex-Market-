const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const config = require('./firebase-applet-config.json');

// Without cert, if it's running in an environment without ADC, it might fail. But let's try.
try {
  initializeApp({ projectId: config.projectId });
  const db = getFirestore();
  db.collection('users').limit(1).get().then(snap => {
    console.log("Firestore success. Docs:", snap.size);
  }).catch(e => {
    console.error("Firestore error:", e);
  });
} catch(e) {
  console.error("Init error:", e);
}
