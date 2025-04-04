
import Head from 'next/head';
import Image from 'next/image';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import '@/app/styles/util.css';
import '@/app/styles/main.css';

export default function Profile({ userType, userData }) {
  return (
    <>
      <Head>
        <title>Perfil do Usuário</title>
      </Head>
      <div className="limiter">
        <div className="container-login100">
          <div className="wrap-login100">
            <div className="login100-form validate-form p-l-55 p-r-55 p-t-178">
              <span className="login100-form-title">
                Perfil {userType.charAt(0).toUpperCase() + userType.slice(1)}
              </span>

              <form className="login100-form validate-form p-l-55 p-r-55 p-t-10 m-b-50">
              <div className="perfil-info">
                <p><strong>Nome Completo:</strong> {userData.nomeCompleto}</p>
                
                <p><strong>Email:</strong> {userData.email}</p>
               
                {/* Renderizar CPF para cliente ou colaborador */}
                {(userType === 'cliente' || userType === 'colaborador') && (
                  <p><strong>CPF:</strong> {userData.cpf}</p>
                )}

                {/* Renderizar endereço somente para cliente */}
                {userType === 'cliente' && (
                  <p><strong>Endereço:</strong> {userData.endereco}</p>
                )}

                {/* Renderizar telefone para todos */}
                <p><strong>Telefone:</strong> {userData.telefone}</p>

                {/* Dados adicionais */}
                <p><strong>Tipo de Usuário:</strong> {userType}</p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
