'use client';

import AppLayout from '@/components/Layout/page';
import WasteManager from '@/components/Waste/WasteManager';
import { Box, Typography, Paper } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WasteManagementPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      try {
        // You might want to implement a proper admin check here
        // This is a placeholder implementation
        const response = await fetch('/api/admin/', {
          headers: {
            'Authorization': `Bearer ${user.accessToken}`,
            'uid': user.uid
          }
        });
        
        if (response.ok) {
          setIsAdmin(true);
        } else {
          // Redirect non-admin users
          router.push('/');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/');
      }
    };
    
    if (!loading) {
      checkAdminStatus();
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography>Carregando...</Typography>
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)' }}>
          <WasteManager />
        </Paper>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#2e7d32', fontWeight: 'bold' }}>
            Sobre os Tipos de Resíduos
          </Typography>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)' }}>
            <Typography variant="body1" paragraph>
              Os tipos de resíduos cadastrados neste sistema são utilizados para categorizar os materiais 
              que podem ser coletados nos Eco Pontos e durante os agendamentos de coleta.
            </Typography>
            <Typography variant="body1" paragraph>
              Cada tipo de resíduo pode ter características específicas de coleta, armazenamento e reciclagem.
              A descrição detalhada ajuda os usuários a identificarem corretamente o tipo de material que 
              desejam descartar.
            </Typography>
            <Typography variant="body1">
              Mantenha esta lista atualizada para garantir que os usuários tenham informações precisas 
              sobre os tipos de resíduos aceitos pelo sistema.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </AppLayout>
  );
}