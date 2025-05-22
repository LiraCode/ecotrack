'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, setPersistence, browserLocalPersistence, updateProfile } from 'firebase/auth';
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
  '/parceiro/login',
  '/administrador/login',
  '/cliente/cadastro',
  '/administracao/login',
  '/locais',
  '/posts',
  '/posts/:slug',
  '/api/users'
  // Adicione outras rotas públicas aqui
];



// Rotas permitidas para clientes
const allowedClientRoutes = [
  '/',
  '/cliente',  // Adicionando a raiz da pasta cliente para permitir todas as subrotas
  '/cliente/perfil',
  '/cliente/metas',
  '/agendamento',
  '/posts',
  '/locais'
];

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  // Configurar a persistência do Firebase Auth para localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPersistence(auth, browserLocalPersistence)
        .catch((error) => {
          console.error('Erro ao configurar persistência:', error);
        });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Obter token atualizado
          const token = await firebaseUser.getIdToken(true);
          
          // Salvar token no localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('ecotrack_token', token);
          }
          
          // Verificar se já temos o role no localStorage
          let userRole = null;
          if (typeof window !== 'undefined') {
            userRole = localStorage.getItem('ecotrack_role');
          }
          
          // Se não temos role no localStorage ou no estado, buscar do servidor
          if (!userRole && !role) {
            userRole = await checkRole(token);
            if (userRole && typeof window !== 'undefined') {
              localStorage.setItem('ecotrack_role', userRole);
            }
          } else if (role && !userRole) {
            // Se temos role no estado mas não no localStorage
            userRole = role;
            if (typeof window !== 'undefined') {
              localStorage.setItem('ecotrack_role', userRole);
            }
          }
          
          setRole(userRole);
          
          // Criar objeto de usuário completo
          const userData = { 
            ...firebaseUser, 
            role: userRole 
          };
          
          setUser(userData);
          
          // Salvar dados básicos do usuário no localStorage
          if (typeof window !== 'undefined') {
            const userForStorage = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              emailVerified: firebaseUser.emailVerified,
              role: userRole
            };
            localStorage.setItem('ecotrack_user', JSON.stringify(userForStorage));
          }
        } catch (error) {
          console.error('Erro ao processar autenticação:', error);
          // Não limpar localStorage em caso de erro para manter a sessão
        }
      } else {
        // Usuário não está autenticado no Firebase
        setUser(null);
        setRole(null);
        
        // Não limpar localStorage aqui, pois pode ser apenas uma falha temporária
        // de conexão. Deixar a limpeza apenas para o logout explícito.
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [role]);

  // Verificar se a rota atual precisa de autenticação
  useEffect(() => {
    if (!loading) {
      // Se não temos usuário no estado, mas temos no localStorage, tentar restaurar
      if (!user && typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('ecotrack_user');
        const storedRole = localStorage.getItem('ecotrack_role');
        
        if (storedUser && storedRole) {
          try {
            const userData = JSON.parse(storedUser);
            setUser({...userData, role: storedRole});
            setRole(storedRole);
            return; // Evitar redirecionamentos enquanto restauramos o usuário
          } catch (error) {
            console.error('Erro ao restaurar usuário do localStorage:', error);
          }
        }
      }
      
      // Permitir as rotas públicas
      const isPublicRoute = publicRoutes.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
      );
      if (isPublicRoute) {
        return;
      }

      // Se o usuário não estiver logado, determinar o tipo com base na URL e redirecionar
      if (!user) {
        console.log("Rota não permitida:", pathname);
        let userType = "cliente";
        if (pathname.includes("/parceiro")) {
          userType = "parceiro";
        } else if (pathname.includes("/administracao")) {
          userType = "administracao";
        }
        router.push(loginRoutes[userType] || loginRoutes.cliente);
        return;
      }

      // Se o usuário estiver logado, verificar o papel e limitar o acesso às pastas permitidas
      if (user.role === "Administrador") {
        // Apenas os administradores podem acessar rotas que iniciam com "/administracao"
        if (!pathname.startsWith("/administracao") && 
            !adminExtraRoutes.some(route => pathname.startsWith(`/${route}`)) && 
            !publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
          router.push("/administracao");
        }
      } else if (user.role === "Responsável") {
        // Apenas os responsáveis devem acessar rotas que iniciam com "/parceiro"
        if (!pathname.startsWith("/parceiro") && 
            !publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
          router.push("/parceiro");
        }
      } else if (user.role === "User") {
        // Apenas os clientes devem acessar rotas que iniciam com "/cliente" ou rotas permitidas
        const isAllowed = allowedClientRoutes.some(route =>
          pathname === route || pathname.startsWith(`${route}/`)
        );
        if (!isAllowed) {
          // Caso a rota atual não esteja na lista, redireciona para a página default do cliente
          router.push("/");
        }
      }
    }
  }, [loading, pathname, user, router]);

  const logout = async () => {
    try {
      // Limpar localStorage explicitamente apenas no logout
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ecotrack_user');
        localStorage.removeItem('ecotrack_role');
        localStorage.removeItem('ecotrack_token');
      }
      
      await signOut(auth);
      setUser(null);
      setRole(null);
      router.push('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const checkRole = async (token) => {
    try {
      const response = await fetch('/api/auth/checkrole', {
        method: 'GET',
        headers: {  
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        console.error('Erro ao obter a role do usuário:', data.error);
        return null;
      } else {
        return data.role;
      }
    } catch (error) {
      console.error('Erro ao buscar role do usuário:', error.message);
      return null;
    }
  }

  const signIn = async (email, password, type) => { 
    try {
      // Configurar persistência antes de fazer login
      await setPersistence(auth, browserLocalPersistence);
      
      const response = await signInWithEmailAndPassword(auth, email, password);
      const user = response.user;
      
      // Obter token atualizado
      const accessToken = await user.getIdToken(true);
      
      // Salvar token no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('ecotrack_token', accessToken);
      }
      
      const userData = await checkRole(accessToken);
      if(!userData) {
        console.log("Erro ao obter dados do usuário:", userData);
        return { error: 'auth/isNotUser' };
      }
      
      setRole(userData);
      
      // Salvar role no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('ecotrack_role', userData);
        
        // Salvar dados básicos do usuário
        const userForStorage = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          role: userData
        };
        localStorage.setItem('ecotrack_user', JSON.stringify(userForStorage));
      }
      
      return response;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return { error };
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      if (!auth.currentUser) {
        throw new Error('Usuário não autenticado');
      }
      
      // Usar updateProfile diretamente no auth.currentUser
      await updateProfile(auth.currentUser, profileData);
      
      // Atualizar o estado do usuário no contexto
      setUser((prevUser) => {
        if (!prevUser) return prevUser;
        
        return {
          ...prevUser,
          displayName: profileData.displayName || prevUser.displayName,
          photoURL: profileData.photoURL || prevUser.photoURL
        };
      });
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, signIn, checkRole, updateUserProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
export default AuthContext;