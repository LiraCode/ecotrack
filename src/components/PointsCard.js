'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth/AuthContext';
import { useMetas } from '@/context/metas/MetasContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Stars } from '@mui/icons-material';

export default function PointsCard() {
  const { user } = useAuth();
  const { meusPontos, loading } = useMetas();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.accessToken) return;

      try {
        const response = await fetch('/api/admin/me', {
          headers: {
            'Authorization': `Bearer ${user.accessToken}`
          }
        });
        setIsAdmin(response.ok);
      } catch (error) {
        console.error('Erro ao verificar status de admin:', error);
      }
    };

    checkAdminStatus();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Stars color="warning" />
            <Typography variant="h6">Meus Pontos</Typography>
          </Box>
        </CardHeader>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (isAdmin) {
    return (
      <Card>
        <CardHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Stars color="warning" />
            <Typography variant="h6">Meus Pontos</Typography>
          </Box>
        </CardHeader>
        <CardContent>
          <Typography variant="body1" color="text.secondary" align="center">
            O sistema de pontos não está disponível para administradores.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Stars color="warning" />
          <Typography variant="h6">Meus Pontos</Typography>
        </Box>
      </CardHeader>
      <CardContent>
        <Typography variant="h3" align="center" color="primary">
          {meusPontos}
        </Typography>
      </CardContent>
    </Card>
  );
} 