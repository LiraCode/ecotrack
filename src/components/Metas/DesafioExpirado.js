'use client'
import { Paper, Typography, Box } from '@mui/material'
import CircularProgressBar from './utils/CircularProgressBar'
import { calcularPorcentagem } from './utils/metasUtils'

const DesafioExpirado = ({ desafio }) => {
  const porcentagem = calcularPorcentagem(desafio.progresso, desafio.total)

  return (
    <Paper elevation={3} className="p-4 bg-red-50 h-full">
      <Typography variant="h6" className="font-medium mb-3 text-red-800">
        {desafio.nome} 
      </Typography>
      <CircularProgressBar 
        progresso={desafio.progresso} 
        total={desafio.total}
        expirado={true} 
      />
      <Box mt={2} className="space-y-1 text-sm">
        <Typography>
          <span className="font-medium">Progresso alcançado:</span> {porcentagem}%
        </Typography>
        <Typography>
          <span className="font-medium">Itens coletados:</span> {desafio.progresso} de {desafio.total}
        </Typography>
        <Typography className="text-red-600">
          <span className="font-medium">Expirou em:</span> {desafio.dataTermino.toLocaleDateString('pt-BR')}
        </Typography>
      </Box>
    </Paper>
  )
}

export default DesafioExpirado
