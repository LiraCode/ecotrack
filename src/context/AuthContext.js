'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/config/firebase/firebase';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// Rotas de login para cada tipo de usuário
const loginRoutes = {
  cliente: '/cliente/login',
  colaborador: '/colaborador/login',
  administrador: '/administrador/login'
};

// Rotas públicas que não precisam de autenticação
const publicRoutes = [
  '/',
  '/cliente/login',
  '/colaborador/login',
  '/administrador/login',
  '/cliente/cadastro',
  '/colaborador/cadastro',
  '/administrador/cadastro',
  '/posts',
  '/posts/:slug',
  


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
        } else if (pathname.includes('/administrador')) {
          userType = 'administrador';
        }
        
        // Redirecionar para a página de login apropriada
        router.push(loginRoutes[userType] || loginRoutes.cliente);
      }
    }
  }, [user, loading, pathname, router]);

  const logout = async (userType = 'cliente') => {
    try {
      await signOut(auth);
      router.push(loginRoutes[userType] || loginRoutes.cliente);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;