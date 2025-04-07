'use client';
import Profile from "@/components/profile/page";
import Header from "@/components/Header/page";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";

const userDataCliente = {
  nomeCompleto: 'João Silva',
  email: 'joao@email.com',
  cpf: '123.456.789-00',
  endereco: 'Rua das Flores, 123',
  telefone: '(11) 98765-4321',
};

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div style={{ fontFamily: 'var(--font-geist-mono' }}>
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Profile userType="cliente" userData={userDataCliente} />
    </div>
  );
}
