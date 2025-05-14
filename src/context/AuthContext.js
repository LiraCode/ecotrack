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
  '/parceiro/login',
  '/administrador/login',
  '/cliente/cadastro',
  '/administracao/login',
  '/posts',
  '/posts/:slug',
  '/api/users'
  


  // Adicione outras rotas públicas aqui
];

const adminExtraRoutes = [
  'client/cadastro',
  'parceiro/cadastro'  
];

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  
  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
         setUser(prevUser => ({ ...user, role: role }));

         if(!role) {
          setRole( await checkRole(user.accessToken));
          }
        
        
       
        
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [role]);

  // Verificar se a rota atual precisa de autenticação
 useEffect(() => {
  if (!loading) {
    // Permitir as rotas públicas
    const isPublicRoute = publicRoutes.some(route =>
      pathname === route || pathname.startsWith(`${route}/`)
    );
    if (isPublicRoute) {
      return;
    }

    // Se o usuário não estiver logado, determinar o tipo com base na URL e redirecionar
    if (!user) {
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
      if (!pathname.startsWith("/administracao") && !adminExtraRoutes) {
        router.push("/administracao");
      }
    } else if (user.role === "Responsável") {
      // Apenas os responsáveis devem acessar rotas que iniciam com "/parceiro"
      if (!pathname.startsWith("/parceiro")) {
        router.push("/parceiro");
      }
    } else if (user.role === "User") {
      // Clientes têm acesso somente a um conjunto de rotas permitidas
      const allowedClientRoutes = ["/", "/agendamento", "/cliente/perfil", "/cliente/metas", "/posts"];
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
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

 

  const  checkRole = async (token) => {
  try {
    
    // Make sure to include the uid as a query parameter
    const response = await fetch('/api/auth/checkrole' , {
      method: 'GET',
      headers: {  
        'Content-Type': 'application/json',
        // Include authorization token if needed
        authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const data = await response.json();
    if (data.error) {
      console.error('Erro ao obter a role do usuário:', data.error);
    } else {
      return data.role;
    }
  } catch (error) {
    console.error('Erro ao buscar role do usuário:', error.message);
  }
}


const signIn = async (email, password, type) => { 
  try {
    const response = await signInWithEmailAndPassword(auth, email, password);
    // get user from response
    const user = response.user;
    const acessToken = user.accessToken;
   
    const userData = await checkRole( acessToken);
    if(!userData) {
      console.log("Erro ao obter dados do usuário:", userData);
      return { error: 'auth/isNotUser' };
    }
    setRole(userData);
    return response;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return { error };
  }
};


  return (
    <AuthContext.Provider value={{ user, loading, logout, signIn, checkRole }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
export default AuthContext;