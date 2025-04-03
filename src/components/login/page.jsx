import Head from 'next/head';
import Image from 'next/image';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import '@/app/styles/util.css';
import '@/app/styles/main.css';

export default function Login({ type }) {
  const isCliente = type === 'cliente';
  const isColaborador = type === 'colaborador';
  const isAdmin = type === 'admin';

  return (
    <>
      <Head>
        <title>Login</title>
        <link rel="icon" href="/images/favicon.ico" />
      </Head>
      <div className="limiter">
        <div className="container-login100">
          <div className="wrap-login100">
            <form className="login100-form validate-form p-l-55 p-r-55 p-t-178">
              <span className="login100-form-title">
                {isCliente ? 'EcoTrack Cliente' : isColaborador ? 'EcoTrack Colaborador' : isAdmin ? 'EcoTrack Administração' : 'Erro type is not defined'}
              </span>
              <div className="logo-container">
                <Image
                  src="/logo.svg"
                  alt="Logo"
                  className="logo"
                  width={150}
                  height={150}
                />
              </div>
              <div className="wrap-input100 validate-input m-b-16" data-validate="Por favor insira o login">
                <input className="input100" type="text" name="login" placeholder={isCliente ? 'Login Cliente' : isColaborador ? 'Login do Colaborador' : isAdmin? 'Login Administração': 'Erro type is not defined'  } />
                <span className="focus-input100"></span>
              </div>
              <div className="wrap-input100 validate-input" data-validate="Por favor insira a senha">
                <input className="input100" type="password" name="senha" placeholder="Senha" />
                <span className="focus-input100"></span>
              </div>
              <div className="text-right p-t-13 p-b-23">
                <span className="txt1">Esqueceu </span>
                <a href="#" className="txt2">Login / Senha?</a>
              </div>
              <div className="container-login100-form-btn">
                <button className="login100-form-btn">{isCliente ? 'Entrar como Cliente' : 'Entrar como Funcionário'}</button>
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
    </>
  );
}
