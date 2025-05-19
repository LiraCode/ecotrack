'use client'
import React from 'react'
import { Typography, Paper, Box } from '@mui/material'
import CardTitle from '../UI/cardTitleLeft'


const MetasHeader = ({ meusPontos = 0 }) => {
  //console.log("MetasHeader recebeu pontos:", meusPontos);
  
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
            {meusPontos}
          </Typography>
        </div>
      </Box>
    </Paper>
  );
}

export default MetasHeader
