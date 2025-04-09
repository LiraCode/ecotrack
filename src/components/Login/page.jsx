'use client';
import LogoClickable from '../Icons/logoClick/page';
import { useState } from 'react';

export default function Login({ type }) {
  const isCliente = type === 'cliente';
  const isColaborador = type === 'colaborador';
  const isAdmin = type === 'administração';

  if (!isCliente && !isColaborador && !isAdmin) {
    return <div>Erro: Parâmetros obrigatórios inválidos ou ausentes.</div>;
  }

  const dataLogin = { Login: 'teste', Senha: '12345' };
  const [errors, setErrors] = useState({ login: false, senha: false });
  const [loginStatus, setLoginStatus] = useState({ message: '', success: null });

  const handleSubmit = (e) => {
    e.preventDefault(); // Impede o formulário de enviar via GET e mudar a URL
    e.stopPropagation(); // (opcional) impede que o evento suba para outros elementos
    
    const login = e.target.login.value.trim();
    const senha = e.target.senha.value.trim();

    const newErrors = {
      login: !login,
      senha: !senha,
    };

    setErrors(newErrors);

    if (!login || !senha) return;

    // Simulação de login
    if (login === dataLogin.Login && senha === dataLogin.Senha) {
      setLoginStatus({ message: 'Login bem-sucedido!', success: true });
    } else {
      setLoginStatus({ message: 'Login falhou. Verifique suas credenciais.', success: false });
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
                type="text"
                name="login"
                placeholder={isCliente ? 'Login Cliente' : isColaborador ? 'Login do Colaborador' : 'Login Administração'}
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
                className="w-full h-12 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors font-bold"
              >
                {isCliente ? 'Entrar como Cliente' : 'Entrar como Funcionário'}
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
                  <a href="#" className="text-green-600 hover:text-green-800">Crie agora!</a>
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
