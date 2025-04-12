'use client'
import { Paper, Typography, Box, IconButton, Chip, Button } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CircularProgressBar from './utils/CircularProgressBar'
import { isExpirado, diasRestantes, calcularPorcentagem } from './utils/metasUtils'

const DesafioAtivo = ({ desafio, concluirDesafio, removerDesafio, atualizarProgresso }) => {
  const expirado = isExpirado(desafio.dataTermino)
  const diasRestantesValue = diasRestantes(desafio.dataTermino)
  const porcentagem = calcularPorcentagem(desafio.progresso, desafio.total)

  return (
    <Paper elevation={3} className="p-4 h-full relative">
      <div className="absolute top-2 right-2 flex space-x-1">
        {desafio.progresso >= desafio.total && !expirado && (
          <IconButton 
            color="success" 
            onClick={() => concluirDesafio(desafio.id)}
            title="Concluir desafio"
            size="small"
          >
            <CheckCircleIcon />
          </IconButton>
        )}
        <IconButton 
          color="error" 
          onClick={() => removerDesafio(desafio.id)}
          title="Remover desafio"
          size="small"
        >
          <DeleteIcon />
        </IconButton>
      </div>
      
      <Typography variant="h6" className="font-medium mb-3">
        {desafio.nome}
      </Typography>
      
      <CircularProgressBar progresso={desafio.progresso} total={desafio.total} expirado={expirado} />
      
      <Box mt={2} className="space-y-1">
        <Typography className="text-sm">
          <span className="font-medium">Pontos:</span> {desafio.pontuacao}
        </Typography>
        <Typography className="text-sm">
          <span className="font-medium">Progresso:</span> {porcentagem}%
        </Typography>
        <Typography className="text-sm">
          <span className="font-medium">Término:</span> {desafio.dataTermino.toLocaleDateString('pt-BR')}
        </Typography>
        <Chip 
          label={expirado ? 'Expirado' : `${diasRestantesValue} dias restantes`}
          color={expirado ? 'error' : 'success'}
          size="small"
          icon={expirado ? null : <AccessTimeIcon fontSize="small" />}
        />
      </Box>
      
      {!expirado && (
        <Box mt={2} className="flex space-x-2">
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => atualizarProgresso(desafio.id, 10)}
          >
            +10%
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => atualizarProgresso(desafio.id, 25)}
          >
            +25%
          </Button>
        </Box>
      )}
    </Paper>
  )
}

export default DesafioAtivo
