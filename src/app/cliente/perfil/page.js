  'use client';

import AppLayout from '@/components/Layout/page';
import Profile from '@/components/Profile/page';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [userData, setUserData] = useState({
    nomeCompleto: '',
    email: '',
    telefone: '',
    cpf: '',
    tipo: '',
    endereco: ''
  });
  const token = user?.accessToken;
  

  useEffect(() => {
    const getUserData = async () => {
      try {
        if (!user || !token) return;

        const response = await fetch('/api/users/user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            uid: user.uid,
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar dados do usuário');
        }

        const data = await response.json();
        
        if (data.success && data.user) {
          // Format address data if it exists
          let formattedAddress = '';
          if (data.user.address && data.user.address.length > 0) {
            const primaryAddress = data.user.address[0];
            formattedAddress = `${primaryAddress.street}, ${primaryAddress.number}, ${primaryAddress.neighborhood}, ${primaryAddress.city}, ${primaryAddress.state}, ${primaryAddress.zipCode}`;
          }
          
          setUserData(prevData => ({
            ...prevData,
            ...data.user,
            nomeCompleto: data.user.name || user.displayName || '',
            email: data.user.email || user.email || '',
            urlPhoto: user.photoURL || '/Images/generic_user.png',
            cpf: data.user.cpf || '',
            telefone: data.user.phone || user.phoneNumber || '',
            endereco: formattedAddress,
            type: data.user.type || ''
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      }
    };

    getUserData();
  }, [user, token]);

  return (
    <AppLayout>
      <Profile userType="Cliente" userData={userData} />
    </AppLayout>
  );
}
