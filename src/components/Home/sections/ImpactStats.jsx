import React from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, useTheme } from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Scale as ScaleIcon, 
  Recycling as RecyclingIcon 
} from '@mui/icons-material';

const ImpactStats = ({ impactStats }) => {
  const { wasteCount, totalWeight, collectionsCount, loading } = impactStats;
  const theme = useTheme();

  const formatNumber = (num) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <CircularProgress color="success" size={40} />
      </Box>
    );
  }

  // Estilos para os cards
  const cardStyles = {
    p: 3, 
    textAlign: 'center',
    width: { xs: '300px', sm: '100%' },
    height: '100%',
    minHeight: '250px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.3s, box-shadow 0.3s, background-color 0.3s',
    mx: { xs: 'auto', sm: 0 },
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
    },
    // Cor baseada no tema
    backgroundColor: theme.palette.mode === 'dark' ? 
      'var(--boxdark-2)' : 'rgba(76, 175, 80, 0.1)', // Verde claro com opacidade no modo claro
    border: theme.palette.mode === 'dark' ? 
      '1px solid var(--strokedark)' : '1px solid rgba(76, 175, 80, 0.3)'
  };

  return (
    <Box sx={{ width: '100%', mt: 4, mb: 6 }}>
      <Typography 
        variant="h5" 
        component="h2" 
        sx={{ 
          textAlign: 'center', 
          mb: 3, 
          color: theme.palette.mode === 'dark' ? 'var(--primary)' : '#2E7D32', // Verde escuro no claro, original no escuro
          fontWeight: 'bold'
        }}
      >
      Nosso Impacto Ambiental
</Typography>
      
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} sm={4}>
          <Paper elevation={2} sx={cardStyles}>
            <DeleteIcon sx={{ 
              fontSize: 48, 
              color: theme.palette.mode === 'dark' ? '#4CAF50' : '#2E7D32', // Verde mais escuro no modo claro
              mb: 2 
            }} />
            <Typography variant="h4" component="div" sx={{ 
              fontWeight: 'bold', 
              color: theme.palette.mode === 'dark' ? '#4CAF50' : '#2E7D32'
            }}>
              {formatNumber(wasteCount)}
            </Typography>
            <Typography variant="subtitle1" sx={{
              color: 'var(--body)'
            }}>
              Itens de Resíduos Coletados
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Paper elevation={2} sx={cardStyles}>
            <ScaleIcon sx={{ 
              fontSize: 48, 
              color: theme.palette.mode === 'dark' ? '#4CAF50' : '#2E7D32',
              mb: 2 
            }} />
            <Typography variant="h4" component="div" sx={{ 
              fontWeight: 'bold', 
              color: theme.palette.mode === 'dark' ? '#4CAF50' : '#2E7D32'
            }}>
              {formatNumber(totalWeight)} kg
            </Typography>
            <Typography variant="subtitle1" sx={{
              color: 'var(--body)'
            }}>
              Peso Total de Resíduos
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Paper elevation={2} sx={cardStyles}>
            <RecyclingIcon sx={{ 
              fontSize: 48, 
              color: theme.palette.mode === 'dark' ? '#4CAF50' : '#2E7D32',
              mb: 2 
            }} />
            <Typography variant="h4" component="div" sx={{ 
              fontWeight: 'bold', 
              color: theme.palette.mode === 'dark' ? '#4CAF50' : '#2E7D32'
            }}>
              {formatNumber(collectionsCount)}
            </Typography>
            <Typography variant="subtitle1" sx={{
              color: 'var(--body)'
            }}>
              Coletas Realizadas
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ImpactStats;