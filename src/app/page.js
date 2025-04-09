'use client';
import Profile from "@/components/Profile/page";
import AppLayout from "@/components/Layout/page";

const userDataCliente = {
  nomeCompleto: 'João Silva',
  email: 'joao@email.com',
  cpf: '123.456.789-00',
  endereco: 'Rua das Flores, 123',
  telefone: '(11) 98765-4321',
};

export default function Home() {
  return (
    <AppLayout>
      <Profile userType="Cliente" userData={userDataCliente} />
    </AppLayout>
  );
}
