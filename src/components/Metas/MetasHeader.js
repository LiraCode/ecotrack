'use client'
import React from 'react'
import { Typography, Paper, Box, useTheme } from '@mui/material'
import CardTitle from '../ui/cardTitleLeft'


const MetasHeader = ({ meusPontos = 0 }) => {
  // console.log("MetasHeader recebeu pontos:", {
  //   valor: meusPontos,
  //   tipo: typeof meusPontos
  // });
  
  const theme = useTheme();
  // Garantir que meusPontos seja um número
  const pontos = typeof meusPontos === 'number' ? meusPontos : parseInt(meusPontos) || 0;
  
    // console.log("Pontos após conversão:", {
    //   valor: pontos,
    //   tipo: typeof pontos
    // });
    
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        mb: 4,
        bgcolor: theme.palette.background.paper
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div>
          <CardTitle title="Eco Games" />
          
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 1,
              color: theme.palette.mode === 'dark' ? 'success.light' : 'success.dark'
            }}
          >
            Confira seus Desafios e Pontos.
          </Typography>
          <Typography 
            variant="body1"
            sx={{ 
              color: theme.palette.mode === 'dark' ? 'success.light' : 'success.dark'
            }}
          >
            Participe de desafios, recicle mais e ganhe pontos!
          </Typography>
        </div>

        <Box sx={{ 
          mt: { xs: 2, md: 0 }, 
          bgcolor: theme.palette.background.paper,
          p: 2,
          borderRadius: 1,
          boxShadow: 1
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: theme.palette.text.primary,
              fontWeight: 500
            }}
          >
            Meus Pontos
          </Typography>
          <Typography 
            variant="h3" 
            sx={{ 
              color: theme.palette.mode === 'dark' ? 'success.light' : 'success.main',
              fontWeight: 'bold'
            }}
          >
            {pontos}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default MetasHeader
