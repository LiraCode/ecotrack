// src/config/firebase/firebaseAdmin.js
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

//console.log('Iniciando configuração do Firebase Admin...');

// Verificar se estamos no lado do servidor
if (typeof window !== 'undefined') {
    throw new Error('Firebase Admin SDK deve ser usado apenas no lado do servidor');
}

// Obter as credenciais da variável de ambiente
try {
    //console.log('Verificando credenciais do Firebase Admin...');
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    
    if (!serviceAccount) {
        throw new Error('Credenciais do Firebase Admin não encontradas');
    }
    
    //console.log('Credenciais do Firebase Admin encontradas');

    // Inicializar o Firebase Admin SDK
    if (getApps().length === 0) {
        console.log('Inicializando Firebase Admin SDK...');
        initializeApp({
            credential: cert(serviceAccount)
        });
        //console.log('Firebase Admin SDK inicializado com sucesso');
    } else {
        //console.log('Firebase Admin SDK já estava inicializado');
    }
} catch (error) {
    console.error('Erro detalhado ao inicializar Firebase Admin:', {
        error: error.message,
        stack: error.stack
    });
    throw error; // Relançar o erro para que seja tratado apropriadamente
}

const auth = getAuth();
//console.log('Auth do Firebase Admin obtido com sucesso');

export { auth };
