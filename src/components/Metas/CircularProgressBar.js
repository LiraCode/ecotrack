import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const CircularProgressBar = ({ progresso, total }) => {
  const porcentagem = (progresso / total) * 100;
  const size = 120; // Aumentado para 120px

  return (
    <Box sx={{ 
      position: 'relative', 
      display: 'inline-flex',
      width: `${size}px`,
      height: `${size}px`
    }}>
      <CircularProgress
        variant="determinate"
        value={100}
        size={size}
        thickness={4}
        sx={{
          color: '#bdbdbd',
          position: 'absolute'
        }}
      />
      <CircularProgress
        variant="determinate"
        value={porcentagem}
        size={size}
        thickness={4}
        sx={{
          color: porcentagem >= 100 ? 'success.main' : 'primary.main',
        }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            color: '#000000',
            fontWeight: 500
          }}
        >
          {`${Math.round(porcentagem)}%`}
        </Typography>
      </Box>
    </Box>
  );
};

export default CircularProgressBar;
