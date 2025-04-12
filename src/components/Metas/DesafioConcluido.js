'use client'
import { Paper, Typography, Box } from '@mui/material'
import CircularProgressBar from './utils/CircularProgressBar'

const DesafioConcluido = ({ desafio }) => {
  return (
    <Paper elevation={3} className="p-4 bg-green-50 h-full">
      <Typography variant="h6" className="font-medium mb-3 text-green-800">
        {desafio.nome} ✓
      </Typography>
      <CircularProgressBar progresso={100} total={100} />
      <Box mt={2} className="space-y-1">
        <Typography className="text-sm">
          <span className="font-medium">Pontos ganhos:</span> {desafio.pontuacao}
        </Typography>
        <Typography className="text-sm">
          <span className="font-medium">Concluído em:</span> {new Date().toLocaleDateString('pt-BR')}
        </Typography>
      </Box>
    </Paper>
  )
}

export default DesafioConcluido
