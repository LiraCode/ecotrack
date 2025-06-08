import React from 'react';
import { Box, Paper, Typography, Button, useTheme, useMediaQuery } from '@mui/material';
import Link from 'next/link';
import LatestPosts from '../components/LatestPosts';
import UpcomingSchedules from '../components/UpcomingSchedules';
import GoalsList from '../components/GoalsList';
import ImpactStats from './ImpactStats';

const HomeTab = ({ 
  latestPost, 
  loading, 
  upcomingSchedules, 
  loadingSchedules, 
  goals, 
  loadingGoals,
  impactStats,
  handleOpenDialog, 
  onViewAllWasteTypes,
  isUserLoggedIn
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Estilo comum para todos os componentes
  const componentStyle = {
    width: '100%',
    maxWidth: '800px',
    mx: 'auto',
    px: { xs: 2, sm: 0 }
  };

  // Estilo para os cards de login
  const loginCardStyle = {
    p: { xs: 2, sm: 3 }, 
    textAlign: 'center', 
    bgcolor: theme.palette.mode === 'dark' ? 'var(--boxdark-2)' : '#f9f9f9',
    mb: 3,
    mx: { xs: 2, sm: 0 },
    border: theme.palette.mode === 'dark' ? '1px solid var(--strokedark)' : 'none'
  };

  // Estilo para os botões de login
  const loginButtonStyle = {
    borderColor: theme.palette.mode === 'dark' ? '#4CAF50' : '#2e8b57', 
    color: theme.palette.mode === 'dark' ? '#4CAF50' : '#2e8b57',
    '&:hover': { 
      borderColor: theme.palette.mode === 'dark' ? '#81C784' : '#1b5e20', 
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.08)' : 'rgba(46, 139, 87, 0.04)' 
    },
    fontSize: { xs: '0.75rem', sm: '0.875rem' }
  };

  return (
    <Box sx={{ 
      width: '100%', 
      mt: { xs: 2, sm: 4 },
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      overflow: 'hidden'
    }}>
      {/* Estatísticas de Impacto */}
      <Box sx={componentStyle}>
        <ImpactStats impactStats={impactStats} />
      </Box>
      
      {/* Últimas Postagens */}
      <Box sx={componentStyle}>
        {latestPost && <LatestPosts post={latestPost} loading={loading} />}
      </Box>
      
      {/* Próximos Agendamentos - mostrar apenas se o usuário estiver logado como "user" */}
      <Box sx={{ ...componentStyle, mb: { xs: 3, sm: 5 } }}>
        {isUserLoggedIn ? (
          <UpcomingSchedules 
            schedules={upcomingSchedules} 
            loading={loadingSchedules} 
          />
        ) : (
          <Paper 
            elevation={1} 
            sx={loginCardStyle}
          >
            <Typography 
              variant="body1" 
              sx={{ 
                color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary', 
                mb: 2,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Faça login como usuário para ver seus próximos agendamentos.
            </Typography>
            <Button 
              component={Link} 
              href="/cliente/login" 
              variant="outlined" 
              color="primary" 
              size={isMobile ? "small" : "medium"}
              sx={loginButtonStyle}
            >
              Fazer Login
            </Button>
          </Paper>
        )}
      </Box>
      
      {/* Metas Sustentáveis - mostrar apenas se o usuário estiver logado como "user" */}
      <Box sx={componentStyle}>
        {isUserLoggedIn ? (
          <GoalsList 
            goals={goals} 
            loading={loadingGoals} 
          />
        ) : (
          <Paper 
            elevation={1} 
            sx={loginCardStyle}
          >
            <Typography 
              variant="body1" 
              sx={{ 
                color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary', 
                mb: 2,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Faça login como usuário para ver suas metas sustentáveis.
            </Typography>
            <Button 
              component={Link} 
              href="/cliente/login" 
              variant="outlined" 
              color="primary" 
              size={isMobile ? "small" : "medium"}
              sx={loginButtonStyle}
            >
              Fazer Login
            </Button>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default HomeTab;