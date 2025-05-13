'use client';

import AppLayout from '@/components/Layout/page';
import Profile from '@/components/Profile/page';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const token = user?.acessToken;
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    type: ''
  });

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await fetch('/api/admin', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar dados do usuário');
        }

        const data = await response.json();
        setUserData(prevData => ({
          ...prevData,
          ...data
        }));
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      }
    };

    if (user && token) {
      getUserData();
    }
  }, [user, token]);

  useEffect(() => {
    if (user) {
      let address = '';
      if (userData.rua) {
        address = `${userData.rua}, ${userData.numero}, ${userData.bairro}, ${userData.cidade}, ${userData.estado}, ${userData.cep}`;
      }

      setUserData(prevData => ({
        ...prevData,
        nomeCompleto: user.displayName || '',
        email: user.email || '',
        urlPhoto: user.photoURL || '/Images/generic_user.png',
        cpf: user.cpf || '123.456.789-00',
        telefone: user.phoneNumber || '(11) 98765-4321',
        endereco: address || 'implementar no mongoDB',
        type: userData.role || 'employee'
      }));
    }
  }, [user, userData.rua, userData.numero, userData.bairro, userData.cidade, userData.estado, userData.cep, userData.role]);

  return (
    <AppLayout>
      <Profile userType="administração" userData={userData} />
    </AppLayout>
  );
}