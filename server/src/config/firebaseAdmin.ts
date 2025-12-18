// import serviceAccount from '../.firebase-key/file-manager-7b2bc-firebase-adminsdk-fbsvc-2405d7d7a0.json' with { type: 'json' };
// import { initializeApp, cert } from 'firebase-admin/app';
// import { getFirestore } from 'firebase-admin/firestore';
// import { getStorage } from 'firebase-admin/storage';
// import admin from 'firebase-admin';

// // For local development, use your service account
// // For Cloud Run, you can just call initializeApp() with no arguments
// // const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: cert(serviceAccount),
//     storageBucket: 'file-manager-7b2bc.firebasestorage.app'
//   });
// }

// const db = admin.firestore();
// const bucket = admin.storage().bucket();
// const auth = admin.auth();

// export { db, bucket, auth };


import admin from 'firebase-admin';
import type { Bucket } from '@google-cloud/storage';
// Use a standard import for JSON with TypeScript's resolveJsonModule
// import serviceAccount from '../.firebase-key/file-manager-7b2bc-firebase-adminsdk-fbsvc-2405d7d7a0.json' with { type: 'json' };
import { applicationDefault } from 'firebase-admin/app';

// Initialize only if no apps exist (prevents errors during hot-reloads)

if (!admin.apps.length) {
  // if (process.env.NODE_ENV === 'production') { 
    // PRODUCTION: Cloud Run automatically provides credentials
    admin.initializeApp({
      credential: applicationDefault(),
      ...(process.env.STORAGE_BUCKET_NAME && { storageBucket: process.env.STORAGE_BUCKET_NAME })
    });
  // } 
  // else {
  //   admin.initializeApp({
  //     credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  //     storageBucket: 'file-manager-7b2bc.firebasestorage.app'
  //   });
  // }
}

// 1. Database Reference
const db = admin.firestore();

// 2. Storage Bucket (Explicitly typed to avoid TS2742 portability error)
const bucket = admin.storage().bucket() as unknown as Bucket;

// 3. Auth Reference
const auth = admin.auth();

export { db, bucket, auth, admin };