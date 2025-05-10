// src/config/firebase/firebaseAdmin.js
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Check if Firebase app has already been initialized
if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.REACT_APP_FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.REACT_APP_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
        }),
    });
}

const auth = getAuth();

export { auth };