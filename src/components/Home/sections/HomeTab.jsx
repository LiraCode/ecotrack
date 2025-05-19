import React from 'react';
import { Box, Grid, Paper } from '@mui/material';
import LatestPosts from '../components/LatestPosts';
import UpcomingSchedules from '../components/UpcomingSchedules';
import GoalsList from '../components/GoalsList';
import WasteTypePreview from '../components/WasteTypePreview';
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
  onViewAllWasteTypes 
}) => {
  // Estilo comum para todos os componentes
  const componentStyle = {
    width: '100%',
    maxWidth: '800px',
    mx: 'auto'  // margin horizontal auto para centralizar
  };

  return (
    <Box sx={{ 
      width: '100%', 
      mt: 4,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Estatísticas de Impacto */}
      <Box sx={componentStyle}>
        <ImpactStats impactStats={impactStats} />
      </Box>
      
      {/* Últimas Postagens */}
      <Box sx={componentStyle}>
        {latestPost && <LatestPosts post={latestPost} loading={loading} />}
      </Box>
      
      {/* Próximos Agendamentos */}
      <Box sx={componentStyle}>
        <UpcomingSchedules 
          schedules={upcomingSchedules} 
          loading={loadingSchedules} 
        />
      </Box>
      
      {/* Metas Sustentáveis */}
      <Box sx={componentStyle}>
        <GoalsList 
          goals={goals} 
          loading={loadingGoals} 
        />
      </Box>
      
      {/* Tipos de Resíduos */}
      {/* <Box sx={componentStyle}>
        <WasteTypePreview 
          handleOpenDialog={handleOpenDialog} 
          onViewAllWasteTypes={onViewAllWasteTypes} 
        />
      </Box> */}
    </Box>
  );
};

export default HomeTab;
