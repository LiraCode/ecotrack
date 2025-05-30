'use client'
import React from 'react'
import { Typography, Paper, Box } from '@mui/material'
import CardTitle from '../ui/cardTitleLeft'


const MetasHeader = ({ meusPontos = 0 }) => {
  // console.log("MetasHeader recebeu pontos:", {
  //   valor: meusPontos,
  //   tipo: typeof meusPontos
  // });
  
  // Garantir que meusPontos seja um número
  const pontos = typeof meusPontos === 'number' ? meusPontos : parseInt(meusPontos) || 0;
  
    // console.log("Pontos após conversão:", {
    //   valor: pontos,
    //   tipo: typeof pontos
    // });
    
  return (
    <Paper elevation={3} className="p-6 mb-8 ">
      <Box className="flex flex-col md:flex-row justify-between items-center">
        <div>
          <CardTitle title="Eco Games" />
          
          <Typography variant="h4" className="text-green-700 font-bold mb-2">
            Confira seus Desafios e Pontos.
          </Typography>
          <Typography variant="body1" className="text-green-700">
            Participe de desafios, recicle mais e ganhe pontos!
          </Typography>
        </div>

        <div className="mt-4 md:mt-0 bg-white p-4 rounded-lg shadow-md">
          <Typography variant="h6" className="text-gray-700 font-medium">
            Meus Pontos
          </Typography>
          <Typography variant="h3" className="text-green-600 font-bold">
            {pontos}
          </Typography>
        </div>
      </Box>
    </Paper>
  );
}

export default MetasHeader
