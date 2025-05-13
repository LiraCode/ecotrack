'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/config/firebase/firebase';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// Rotas de login para cada tipo de usuário
const loginRoutes = {
  cliente: '/cliente/login',
  responsavel: '/responsavel/login',
  administrador: '/administracao/login'
};

// Rotas públicas que não precisam de autenticação
const publicRoutes = [
  '/',
  '/cliente/login',
  '/responsavel/login',
  '/administrador/login',
  '/cliente/cadastro',
  '/administracao/login',
  '/posts',
  '/posts/:slug',
  '/api/users'
  


  // Adicione outras rotas públicas aqui
];

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();


  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
       
        
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Verificar se a rota atual precisa de autenticação
  useEffect(() => {
    if (!loading) {
      const isPublicRoute = publicRoutes.some(route => 
        pathname === route || pathname.startsWith(`${route}/`)
      );

      if (!user && !isPublicRoute) {
        // Determinar o tipo de usuário com base na URL
        let userType = 'cliente';
        if (pathname.includes('/colaborador')) {
          userType = 'colaborador';
        } else if (pathname.includes('/administracao')) {
          userType = 'administracao';
        }
        
        // Redirecionar para a página de login apropriada
        router.push(loginRoutes[userType] || loginRoutes.cliente);
      }
    }
  }, [loading, pathname, user, router]);

  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

 

  const fetchUserData = async (uid, token, type) => {
  try {
    let url = '';
     switch(type) {
      
      case 'colaborador':
       url = 'responsible'
        break;
      case 'Administrador':
        url = 'admin'
        break;
      default:
       url = 'users'
        
    }
    // Make sure to include the uid as a query parameter
    const response = await fetch('/api/' + url, {
      method: 'GET',
      headers: {  
        'Content-Type': 'application/json',
        // Include authorization token if needed
        authorization: `Bearer ${token}`,
        // Include the uid in the request with the query parameter
        uid: uid,
      },
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    return null; 
  }
};


const signIn = async (email, password, type) => { 
  try {
    const response = await signInWithEmailAndPassword(auth, email, password);
    const user = response.user;
    console.log('type', type);
    // Fetch user data from the database
   
    const userData = await fetchUserData(user.uid, response.user.acessToken, type);
    if(!userData) {
      console.log('Usuário não encontrado:', user.uid);
      return { error: 'auth/isNotUser' };
    }
    return response;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return { error };
  }
};


  return (
    <AuthContext.Provider value={{ user, loading, logout, signIn, fetchUserData }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
export default AuthContext;