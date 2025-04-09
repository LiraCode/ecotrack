  import Head from 'next/head';
  import Image from 'next/image';

  export default function Profile({ userType, userData }) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Green banner for title with rounded top */}
          <div className="bg-green-500 text-white py-5 px-6 rounded-t-lg">
            <h2 className="text-2xl font-bold text-center">
              Perfil {userType.charAt(0).toUpperCase() + userType.slice(1)}
            </h2>
          </div>

          <div className="p-8">
            <div className="space-y-4 px-4">
              <div className="flex flex-col">
                <p className="text-gray-700">
                  <span className="font-semibold">Nome Completo:</span> {userData.nomeCompleto}
                </p>
              
                <p className="text-gray-700">           
                  <span className="font-semibold">Email:</span> {userData.email}
                </p>
              
                {/* Renderizar CPF para cliente ou colaborador */}
                {(userType === 'cliente' || userType === 'colaborador') && (
                  <p className="text-gray-700">
                    <span className="font-semibold">CPF:</span> {userData.cpf}
                  </p>
                )}

                {/* Renderizar endereço somente para cliente */}
                {userType === 'cliente' && (
                  <p className="text-gray-700">
                    <span className="font-semibold">Endereço:</span> {userData.endereco}
                  </p>
                )}

                {/* Renderizar telefone para todos */}
                <p className="text-gray-700">
                  <span className="font-semibold">Telefone:</span> {userData.telefone}
                </p>

                {/* Dados adicionais */}
                <p className="text-gray-700">
                  <span className="font-semibold">Tipo de Usuário:</span> {userType}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }