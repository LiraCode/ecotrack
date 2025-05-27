import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

const CircularProgressBar = ({ progresso, total, isPercentage = false, color = 'primary', size = 120 }) => {
  // Se isPercentage for true, o progresso já é uma porcentagem (0-100)
  // Caso contrário, calcular a porcentagem
  const porcentagem = isPercentage ? progresso : Math.min(100, (progresso / total) * 100);
  
  // Determinar a cor com base no progresso
  const getColor = () => {
    if (color !== 'auto') return color;
    
    if (porcentagem >= 100) return 'success';
    if (porcentagem >= 70) return 'primary';
    if (porcentagem >= 40) return 'warning';
    return 'error';
  };
  
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: size,
        height: size,
        margin: '0 auto'
      }}
    >
      <CircularProgress
        variant="determinate"
        value={100}
        size={size}
        thickness={4}
        sx={{ color: 'rgba(0, 0, 0, 0.1)', position: 'absolute' }}
      />
      <CircularProgress
        variant="determinate"
        value={porcentagem}
        size={size}
        thickness={4}
        color={getColor()}
      />
      <Box
        sx={{
          position: 'absolute',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column'
        }}
      >
        <Typography variant="h6" component="div" color="text.primary" fontWeight="bold">
          {Math.round(porcentagem)}%
        </Typography>
        {!isPercentage && (
          <Typography variant="caption" component="div" color="text.secondary">
            {progresso}/{total}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default CircularProgressBar;