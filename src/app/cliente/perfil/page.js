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
    cpf: '123.456.789-00',
    endereco: 'implementar no mongoDB',
    telefone: '(11) 98765-4321',
    urlPhoto: ''
  });

  useEffect(() => {
    if (user) {
      setUserData(prevData => ({
        ...prevData,
        nomeCompleto: user.displayName || '',
        email: user.email || '',
        urlPhoto: user.photoURL || 'public/Images/generic_user.png'
      }));
    }
  }, [user]);

  return (
    <AppLayout>
      <Profile userType="Cliente" userData={userData} />
    </AppLayout>
  );
}
