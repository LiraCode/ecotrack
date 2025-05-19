'use client'
import { Paper, Typography, Box } from '@mui/material'
import CircularProgressBar from './utils/CircularProgressBar'

const DesafioConcluido = ({ desafio, onRemover }) => {
  return (
    <Paper elevation={3} className="p-4 bg-green-50">
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Typography variant="h6" className="font-medium text-green-800">
          {desafio.nome}
        </Typography>
      </Box>
      
      <Box display="flex" alignItems="center">
        <Box width="120px" height="120px">
          <CircularProgressBar 
            progresso={desafio.progresso} 
            total={desafio.total} 
          />
        </Box>
        
        <Box ml={3} flex={1}>
          <Typography variant="body2" color="textSecondary" className="mb-3">
            {desafio.descricao}
          </Typography>
          
          <Box className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Typography variant="body2" className="font-medium">Pontos ganhos:</Typography>
              <Typography variant="body1" className="text-green-600 font-bold">{desafio.pontosGanhos}</Typography>
            </div>
            <div>
              <Typography variant="body2" className="font-medium">Concluído em:</Typography>
              <Typography variant="body1" className="font-bold">
                {new Date().toLocaleDateString()}
              </Typography>
            </div>
          </Box>
        </Box>
      </Box>
    </Paper>
  )
}

export default DesafioConcluido
