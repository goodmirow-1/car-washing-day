import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require(process.cwd() + '/car-washing-day-firebase-adminsdk-7152d-e9cc7f0cd6.json'); // Adjust the path to your Firebase service account key

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export { admin };