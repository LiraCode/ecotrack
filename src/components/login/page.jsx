'use client';
import LogoClickable from '../Icons/logoClick/page';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Login({ type }) {
  const router = useRouter();
  const { signIn } = useAuth();
  
  const isCliente = type === 'cliente';
  const isColaborador = type === 'colaborador';
  const isAdmin = type === 'administração';
  
  if (!isCliente && !isColaborador && !isAdmin) {
    return <div>Erro: Parâmetros obrigatórios inválidos ou ausentes.</div>;
  }
  
  const [formData, setFormData] = useState({
    login: '',
    senha: ''
  });
  const [errors, setErrors] = useState({ login: false, senha: false });
  const [loginStatus, setLoginStatus] = useState({ message: '', success: null });
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpar erro do campo quando o usuário começa a digitar
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: false
      });
    }
    
    // Limpar mensagem de status quando o usuário começa a editar
    if (loginStatus.message) {
      setLoginStatus({ message: '', success: null });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const { login, senha } = formData;
    
    // Validação de campos
    const newErrors = {
      login: !login.trim(),
      senha: !senha.trim(),
    };
    
    setErrors(newErrors);
    
    if (newErrors.login || newErrors.senha) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Usar o email como login para o Firebase
      const { user, error } = await signIn(login, senha, type);
      
      if (error) {
        setLoginStatus({ 
          message: getErrorMessage(error), 
          success: false 
        });
      } else {
        setLoginStatus({ 
          message: 'Login bem-sucedido!', 
          success: true 
        });
        
        // Redirecionar com base no tipo de usuário
        setTimeout(() => {
          if (isCliente) {
            router.push('/cliente/perfil');
          } else if (isColaborador) {
            router.push('/colaborador/dashboard');
          } else if (isAdmin) {
            router.push('/administrador/dashboard');
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setLoginStatus({ 
        message: 'Ocorreu um erro inesperado. Tente novamente.', 
        success: false 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para traduzir mensagens de erro do Firebase
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Email inválido.';
      case 'auth/user-disabled':
        return 'Esta conta foi desativada.';
      case 'auth/user-not-found':
        return 'Usuário não encontrado.';
      case 'auth/wrong-password':
        return 'Senha incorreta.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas de login. Tente novamente mais tarde.';
      case 'auth/network-request-failed':
        return 'Erro de conexão. Verifique sua internet.';
      default:
        return 'Credenciais inválidas. Verifique seu login e senha.';
    }
  };

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Cabeçalho verde arredondado com texto branco */}
          <div className="bg-green-600 text-white py-4 px-6 rounded-t-lg">
            <h1 className="text-2xl font-bold text-center">
              {isCliente ? 'EcoTrack Cliente' : isColaborador ? 'EcoTrack Colaborador' : 'EcoTrack Administração'}
            </h1>
          </div>
          
          <form onSubmit={handleSubmit} className="px-14 py-10 relative">
            <div className="flex justify-center items-center mb-8">
              <LogoClickable rota='/' color='#08B75B' width={150} height={150} />
            </div>
            <div className={`relative mb-4 ${errors.login ? 'border-red-500' : 'border-gray-300'}`}>
              <input
                className="w-full h-12 px-4 py-2 text-base border rounded-md focus:outline-none focus:border-green-500 transition-all"
                type="email"
                name="login"
                value={formData.login}
                onChange={handleChange}
                placeholder={isCliente ? 'Email do Cliente' : isColaborador ? 'Email do Colaborador' : 'Email do Administrador'}
              />
              {errors.login && (
                <span className="text-red-500 text-xs absolute right-2 top-4">
                  Campo obrigatório
                </span>
              )}
            </div>
            <div className={`relative mb-4 ${errors.senha ? 'border-red-500' : 'border-gray-300'}`}>
              <input
                className="w-full h-12 px-4 py-2 text-base border rounded-md focus:outline-none focus:border-green-500 transition-all"
                type="password"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                placeholder="Senha"
              />
              {errors.senha && (
                <span className="text-red-500 text-xs absolute right-2 top-4">
                  Campo obrigatório
                </span>
              )}
            </div>
            <div className="text-right mb-6">
              <span className="text-gray-600">Esqueceu </span>
              <a href="#" className="text-green-600 hover:text-green-800">Login / Senha?</a>
            </div>
            <div className="mb-6">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full h-12 text-white rounded-full font-bold transition-colors ${
                  isLoading 
                    ? 'bg-green-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isLoading 
                  ? 'Processando...' 
                  : isCliente 
                    ? 'Entrar como Cliente' 
                    : 'Entrar como Funcionário'
                }
              </button>
              
              {loginStatus.message && (
                <div
                  className={`mt-3 p-2 rounded text-center ${
                    loginStatus.success
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}
                  role="alert"
                >
                  {loginStatus.message}
                </div>
              )}
            </div>
            <div className="flex flex-col items-center mt-10">
              {isCliente ? (
                <>
                  <span className="text-gray-600 mb-2">Não possui conta?</span>
                  <a href="/cliente/cadastro/" className="text-green-600 hover:text-green-800">Crie agora!</a>
                </>
              ) : (
                <>
                  <span className="text-gray-600 mb-2">Não possui acesso?</span>
                  <a href="mailto:suporte@empresa.com" className="text-green-600 hover:text-green-800">Entre em contato!</a>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
