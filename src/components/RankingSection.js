'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth/AuthContext';
import { useMetas } from '@/context/metas/MetasContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmojiEvents } from '@mui/icons-material';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function RankingSection() {
  const { user } = useAuth();
  const { ranking, loading } = useMetas();
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
            <EmojiEvents color="warning" />
            <Typography variant="h6">Ranking</Typography>
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
            <EmojiEvents color="warning" />
            <Typography variant="h6">Ranking</Typography>
          </Box>
        </CardHeader>
        <CardContent>
          <Typography variant="body1" color="text.secondary" align="center">
            O ranking não está disponível para administradores.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiEvents color="warning" />
          <Typography variant="h6">Ranking</Typography>
        </Box>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Posição</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Pontos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ranking.map((item) => (
              <TableRow key={item.clientId} className={item.isCurrentUser ? 'bg-muted' : ''}>
                <TableCell>
                  {item.position === 1 ? '🥇' :
                   item.position === 2 ? '🥈' :
                   item.position === 3 ? '🥉' :
                   item.position}
                </TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.totalPoints}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 