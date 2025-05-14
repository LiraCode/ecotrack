import { initializeApp, getApps } from "firebase/app";
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY  || 'problema na env',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'problema na env',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'problema na env',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'problema na env',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID|| 'problema na env',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'problema na env',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'problema na env',
};

// Initialize Firebase only once
const firebase_app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
// Get Firebase services
export const storage = getStorage(firebase_app);
export const auth = getAuth(firebase_app);

// Set session persistence
setPersistence(auth, browserSessionPersistence)
  .catch((error) => {
    console.error("Error setting auth persistence:", error);
  });

export default firebase_app;