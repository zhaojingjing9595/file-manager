import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import type { ServiceAccount } from 'firebase-admin';
import serviceAccount from '../.firebase-key/file-manager-7b2bc-firebase-adminsdk-fbsvc-2405d7d7a0.json' with { type: 'json' };

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount as ServiceAccount),
    // Optionally add other settings like databaseURL if needed
  });
}

export const auth = getAuth();
export const db = getFirestore();