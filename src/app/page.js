'use client';
import Profile from "@/components/profile/page";
import Header from "@/components/Header/page";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import RootLayout from "./layout";


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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div style={{ fontFamily: 'var(--font-geist-mono' }}>
      <RootLayout>
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      
      <Profile userType="cliente" userData={userDataCliente} />

{/* <PerfilUsuario userType="colaborador" userData={userDataColaborador} /> */}
{/* <PerfilUsuario userType="administrativo" userData={userDataAdministrador} /> */}
</RootLayout>
  </div>
    
  );
}
