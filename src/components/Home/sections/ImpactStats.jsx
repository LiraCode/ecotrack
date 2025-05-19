import React from 'react';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Scale as ScaleIcon, 
  Recycling as RecyclingIcon 
} from '@mui/icons-material';

const ImpactStats = ({ impactStats }) => {
  const { wasteCount, totalWeight, collectionsCount, loading } = impactStats;

  // Função para formatar números grandes com separadores de milhar
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

  return (
    <Box sx={{ width: '100%', mt: 4, mb: 6 }}>
      <Typography 
        variant="h5" 
        component="h2" 
        sx={{ 
          textAlign: 'center', 
          mb: 3, 
          color: '#2e8b57',
          fontWeight: 'bold'
        }}
      >
        Nosso Impacto Ambiental
      </Typography>
      
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} sm={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f1f8e9',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
              }
            }}
          >
            <DeleteIcon sx={{ fontSize: 48, color: '#2e8b57', mb: 2 }} />
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#2e8b57' }}>
              {formatNumber(wasteCount)}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Itens de Resíduos Coletados
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f1f8e9',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
              }
            }}
          >
            <ScaleIcon sx={{ fontSize: 48, color: '#2e8b57', mb: 2 }} />
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#2e8b57' }}>
              {formatNumber(totalWeight)} kg
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Peso Total de Resíduos
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f1f8e9',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
              }
            }}
          >
            <RecyclingIcon sx={{ fontSize: 48, color: '#2e8b57', mb: 2 }} />
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#2e8b57' }}>
              {formatNumber(collectionsCount)}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Coletas Realizadas
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ImpactStats;