'use client';
import LogoClickable from '../Icons/logoClick/page';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { resetPassword } from '@/services/authService';

export default function Login({ type }) {
  const router = useRouter();
  const { signIn } = useAuth();
  
  const isCliente = type === 'cliente';
  const isColaborador = type === 'responsável';
  const isAdmin = type === 'Administrador';
  
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
  const [resetMode, setResetMode] = useState(false);
  const [resetStatus, setResetStatus] = useState({ message: '', success: null });
  const [resetLoading, setResetLoading] = useState(false);
  
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
    
    if (resetStatus.message) {
      setResetStatus({ message: '', success: null });
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
            router.push('/');
          } else if (isColaborador) {
            router.push('/colaborador/');
          } else if (isAdmin) {
            router.push('/administracao/');
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
  
  const handleResetPassword = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const { login } = formData;
    
    // Validação do email
    if (!login.trim()) {
      setErrors({ ...errors, login: true });
      return;
    }
    
    setResetLoading(true);
    
    try {
      const result = await resetPassword(login);
      
      if (result.success) {
        setResetStatus({
          message: 'Email de recuperação enviado! Verifique sua caixa de entrada.',
          success: true
        });
      } else {
        setResetStatus({
          message: getErrorMessage(result.error) || 'Falha ao enviar email de recuperação.',
          success: false
        });
      }
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      setResetStatus({
        message: 'Ocorreu um erro inesperado. Tente novamente.',
        success: false
      });
    } finally {
      setResetLoading(false);
    }
  };
  
  const toggleResetMode = () => {
    setResetMode(!resetMode);
    setLoginStatus({ message: '', success: null });
    setResetStatus({ message: '', success: null });
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
      case 'auth/isNotUser':
        return 'Área exclusiva para clientes. seu login não é válido.';
      case 'auth/missing-email':
        return 'Por favor, informe um email válido.';
      default:
        return 'Credenciais inválidas. Verifique seu login e senha.';
    }
  };

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Cabeçalho verde arredondado com texto branco */}
          <div className="bg-green-600 text-white py-4 px-6 rounded-t-lg">
            <h1 className="text-2xl font-bold text-center">
              {isCliente ? 'EcoTrack Cliente' : isColaborador ? 'EcoTrack Colaborador' : 'EcoTrack Administração'}
            </h1>
          </div>
          
          <form onSubmit={resetMode ? handleResetPassword : handleSubmit} className="px-14 py-10 relative">
            <div className="flex justify-center items-center mb-8">
              <LogoClickable rota='/' color='#08B75B' width={150} height={150} />
            </div>
            
            <div className={`relative mb-4 ${errors.login ? 'border-red-500' : 'border-gray-300'}`}>
              <input
                className="w-full h-12 px-4 py-2 text-base border rounded-md focus:outline-none focus:border-green-500 transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
            
            {!resetMode && (
              <div className={`relative mb-4 ${errors.senha ? 'border-red-500' : 'border-gray-300'}`}>
                <input
                  className="w-full h-12 px-4 py-2 text-base border rounded-md focus:outline-none focus:border-green-500 transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
            )}
            
            <div className="text-right mb-6">
              <button 
                type="button" 
                onClick={toggleResetMode} 
                className="text-green-600 hover:text-green-800 text-sm"
              >
                {resetMode ? 'Voltar ao login' : 'Esqueceu sua senha?'}
              </button>
            </div>
            
            <div className="mb-6">
              <button
                type="submit"
                disabled={isLoading || resetLoading}
                className={`w-full h-12 text-white rounded-full font-bold transition-colors ${
                  (isLoading || resetLoading)
                    ? 'bg-green-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {resetMode 
                  ? (resetLoading ? 'Enviando...' : 'Recuperar Senha')
                  : (isLoading 
                    ? 'Processando...' 
                    : isCliente 
                      ? 'Entrar como Cliente' 
                      : isAdmin
                        ? 'Entrar como Administrador'
                        : 'Entrar como Funcionário'
                    )
                }
              </button>
              
              {loginStatus.message && !resetMode && (
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
              
              {resetStatus.message && resetMode && (
                <div
                  className={`mt-3 p-2 rounded text-center ${
                    resetStatus.success
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}
                  role="alert"
                >
                  {resetStatus.message}
                </div>
              )}
            </div>
            
            {resetMode && (
              <div className="text-center text-sm text-gray-600 mt-4">
                Digite seu email acima e enviaremos um link para redefinir sua senha.
              </div>
            )}
            
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
