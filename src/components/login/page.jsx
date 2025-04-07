'use client';
import Image from 'next/image';
import LogoClickable from '../Icons/logoClick/page';
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "@/app/styles/awesome/all.css"
import '@/app/styles/util.css';
import '@/app/styles/main.css';

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
    e.preventDefault();
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
      <div >
  
        <div className="container-login100">
          <div className="wrap-login100">
            <form onSubmit={handleSubmit} className="login100-form validate-form p-l-55 p-r-55 p-t-178">
              <span className="login100-form-title">
                {isCliente ? 'EcoTrack Cliente' : isColaborador ? 'EcoTrack Colaborador' : 'EcoTrack Administração'}
              </span>
              <div className="logo-container flex justify-content-center align-items-center ">
              <LogoClickable rota='/' color='#08B75B' width={150} height={150} />
              </div> 

              <div
                className={`wrap-input100 validate-input m-b-16 ${errors.login ? 'alert-validate' : ''}`}
                data-validate="Por favor insira o login"
              >
                <input
                  className="input100"
                  type="text"
                  name="login"
                  placeholder={isCliente ? 'Login Cliente' : isColaborador ? 'Login do Colaborador' : 'Login Administração'}
                />
                <span className="focus-input100"></span>
              </div>

              <div
                className={`wrap-input100 validate-input m-b-16 ${errors.senha ? 'alert-validate' : ''}`}
                data-validate="Por favor insira a senha"
              >
                <input
                  className="input100"
                  type="password"
                  name="senha"
                  placeholder="Senha"
                />
                <span className="focus-input100"></span>
              </div>

              <div className="text-right p-t-13 p-b-23">
                <span className="txt1">Esqueceu </span>
                <a href="#" className="txt2">Login / Senha?</a>
              </div>

              <div className="container-login100-form-btn">
                <button type="submit" className="login100-form-btn">
                  {isCliente ? 'Entrar como Cliente' : 'Entrar como Funcionário'}
                </button>
                {loginStatus.message && (
                  <div
                    className={`alert mt-3 ${loginStatus.success ? 'alert-success' : 'alert-danger'}`}
                    role="alert"
                    style={{ textAlign: 'center' }}
                  >
                    {loginStatus.message}
                  </div>
                )}
              </div>

              <div className="flex-col-c p-t-80 p-b-40">
                {isCliente ? (
                  <>
                    <span className="txt1 p-b-9">Não possui conta?</span>
                    <a href="#" className="txt3">Crie agora!</a>
                  </>
                ) : (
                  <>
                    <span className="txt1 p-b-9">Não possui acesso?</span>
                    <a href="mailto:suporte@empresa.com" className="txt3">Entre em contato!</a>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
  );
}
