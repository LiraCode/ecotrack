// src/config/firebase/firebaseAdmin.js
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Retrieve environment variables
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKeyEnv = process.env.FIREBASE_PRIVATE_KEY;

// Check if Firebase app has already been initialized
if (!getApps().length) {
    // Validate that essential environment variables are set
    if (!projectId || !clientEmail || !privateKeyEnv) {
        const missingVars = [
            !projectId ? 'FIREBASE_PROJECT_ID' : null,
            !clientEmail ? 'FIREBASE_CLIENT_EMAIL' : null,
            !privateKeyEnv ? 'FIREBASE_PRIVATE_KEY' : null,
        ].filter(Boolean).join(', ');

        const errorMessage = `Firebase Admin SDK Initialization Failed: Missing required environment variable(s): ${missingVars}. Please ensure they are correctly set in your environment.`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    // Process the private key to replace escaped newlines
    const privateKey = privateKeyEnv.replace(/\\n/g, '\n');

    initializeApp({
        credential: cert({
            projectId: projectId,
            clientEmail: clientEmail,
            privateKey: privateKey,
        }),
    });
}

const auth = getAuth();

export { auth };
