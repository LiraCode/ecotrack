'use client';
import Login from "@/components/login/page";

const userDataCliente = {
  nomeCompleto: 'João Silva',
  email: 'joao@email.com',
  cpf: '123.456.789-00',
  endereco: 'Rua das Flores, 123',
  telefone: '(11) 98765-4321',
};

const userDataColaborador = {
  nomeCompleto: 'Maria Souza',
  email: 'maria@email.com',
  cpf: '234.567.890-12',
  telefone: '(11) 99876-5432',
};

const userDataAdministrador = {
  nomeCompleto: 'Carlos Pereira',
  email: 'carlos@email.com',
  telefone: '(11) 91234-5678',
};

export default function Home() {
  return (
    <div style={{ fontFamily: 'var(--font-geist-mono' }}>
      
    <Login type="cliente"  />
    {/* <Login type="colaborador"  /> */}
    {/* <Login type="administrador" /> */}
    

  </div>
    
  );
}
