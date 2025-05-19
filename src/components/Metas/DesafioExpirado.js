'use client'
import { Paper, Typography, Box, IconButton } from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'
import CircularProgressBar from './utils/CircularProgressBar'
import { calcularPorcentagem } from './utils/metasUtils'

const DesafioExpirado = ({ desafio, onRemover }) => {
  const porcentagem = calcularPorcentagem(desafio.progresso, desafio.total)

  return (
    <Paper elevation={3} className="p-4 bg-red-50">
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Typography variant="h6" className="font-medium text-red-800">
          {desafio.nome} 
        </Typography>
        <IconButton 
          size="small" 
          color="error" 
          onClick={() => onRemover(desafio.id)}
          title="Remover desafio"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
      
      <Box display="flex" alignItems="center">
        <Box width="120px" height="120px">
          <CircularProgressBar 
            progresso={desafio.progresso} 
            total={desafio.total}
            expirado={true} 
          />
        </Box>
        
        <Box ml={3} flex={1}>
          <Typography variant="body2" color="textSecondary" className="mb-3">
            {desafio.descricao}
          </Typography>
          
          <Box className="space-y-1 text-sm">
            <Typography>
              <span className="font-medium">Progresso alcançado:</span> {porcentagem}%
            </Typography>
            <Typography>
              <span className="font-medium">Itens coletados:</span> {desafio.progresso} de {desafio.total}
            </Typography>
            <Typography className="text-red-600">
              <span className="font-medium">Expirou em:</span> {desafio.dataTermino.toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  )
}

export default DesafioExpirado
