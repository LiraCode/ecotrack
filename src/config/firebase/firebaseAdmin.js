// src/config/firebase/firebaseAdmin.js
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);


// Verificar se estamos no lado do servidor
if (typeof window !== 'undefined') {
    throw new Error('Firebase Admin SDK deve ser usado apenas no lado do servidor');
}

// Obter as credenciais da variável de ambiente

try {

// Inicializar o Firebase Admin SDK
if (getApps().length === 0) {
    initializeApp({
      credential: cert(serviceAccount)
    });
}
} catch (error) {
    console.error('Erro ao inicializar o Firebase Admin SDK:', error);
}

const auth = getAuth();

export { auth };
