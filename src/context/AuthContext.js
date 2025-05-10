'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/config/firebase';

// Rotas que requerem autenticação
const protectedRoutes = [
  '/cliente/perfil',
  '/cliente/metas',
  '/agendamento',
  '/colaborador/dashboard',
  '/administrador/dashboard'
];

// Rotas de login para cada tipo de usuário
const loginRoutes = {
  cliente: '/cliente/login',
  colaborador: '/colaborador/login',
  administrador: '/administrador/login'
};

// Criar o contexto
const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState(null); // 'cliente', 'colaborador', 'administrador'
  const router = useRouter();
  const pathname = usePathname();

  // Verificar se a rota atual é protegida
  const isProtectedRoute = () => {
    return protectedRoutes.some(route => pathname.startsWith(route));
  };

  // Determinar o tipo de usuário com base na rota
  const determineUserType = () => {
    if (pathname.startsWith('/cliente')) return 'cliente';
    if (pathname.startsWith('/colaborador')) return 'colaborador';
    if (pathname.startsWith('/administrador')) return 'administrador';
    return null;
  };

  // Efeito para monitorar mudanças no estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      // Determinar o tipo de usuário com base na rota atual
      const currentUserType = determineUserType();
      setUserType(currentUserType);
      
      // Verificar se a rota é protegida e o usuário não está autenticado
      if (isProtectedRoute() && !currentUser) {
        // Redirecionar para a página de login apropriada
        const loginRoute = loginRoutes[currentUserType] || '/cliente/login';
        router.push(loginRoute);
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  // Função de login
  const signIn = async (email, password, type = 'cliente') => {
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setUserType(type);
      return { user: userCredential.user, error: null };
    } catch (err) {
      setError(err.message);
      return { user: null, error: err.message };
    }
  };

  // Função de registro
  const signUp = async (email, password, type = 'cliente') => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setUserType(type);
      return { user: userCredential.user, error: null };
    } catch (err) {
      setError(err.message);
      return { user: null, error: err.message };
    }
  };

  // Função de logout
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserType(null);
      router.push('/');
    } catch (err) {
      setError(err.message);
    }
  };

  // Verificar se o componente atual requer autenticação
  const requireAuth = (Component) => {
    // Criar um componente com nome para melhor depuração
    const AuthenticatedComponent = (props) => {
      if (loading) return <div>Carregando...</div>;
      
      if (!user && isProtectedRoute()) {
        // Se estiver no lado do cliente, redirecionar
        if (typeof window !== 'undefined') {
          const currentUserType = determineUserType();
          router.push(loginRoutes[currentUserType] || '/cliente/login');
        }
        return <div>Você precisa fazer login para acessar esta página.</div>;
      }
      
      return <Component {...props} />;
    };
    
    // Definir o displayName para depuração
    const componentName = Component.displayName || Component.name || 'Component';
    AuthenticatedComponent.displayName = `WithAuth(${componentName})`;
    
    return AuthenticatedComponent;
  };

  const value = {
    user,
    userType,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    requireAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export default AuthContext;