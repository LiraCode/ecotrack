'use client'
import { Paper, Typography, Box, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress } from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'
import CircularProgressBar from './utils/CircularProgressBar'
import { calcularPorcentagem } from './utils/metasUtils'

const DesafioExpirado = ({ desafio, onRemover }) => {
  // Calcular progresso geral (média dos progressos individuais)
  const calcularProgressoGeral = () => {
    if (!desafio.wasteProgress || desafio.wasteProgress.length === 0) {
      return 0
    }
    
    const totalProgress = desafio.wasteProgress.reduce((sum, progress) => {
      const porcentagemItem = calcularPorcentagem(
        progress.currentQuantity || 0, 
        progress.targetQuantity || 1
      )
      return sum + porcentagemItem
    }, 0)
    
    return Math.round(totalProgress / desafio.wasteProgress.length)
  }
  
  const porcentagemGeral = calcularProgressoGeral()

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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Typography variant="body2" className="mb-3 text-gray-700">
            {desafio.descricao}
          </Typography>

          <Box className="space-y-1 text-sm mb-4">
            <Typography className="text-red-700">
              <span className="font-medium">Status:</span> Expirado
            </Typography>
            <Typography>
              <span className="font-medium">Pontos possíveis:</span> {desafio.pontos}
            </Typography>
            <Typography>
              <span className="font-medium">Prazo:</span> {new Date(desafio.dataTermino).toLocaleDateString()}
            </Typography>
          </Box>

          {/* Tabela de progresso por tipo de resíduo */}
          {desafio.wasteProgress && desafio.wasteProgress.length > 0 && (
            <Box className="mt-4 mb-4">
              <Typography variant="subtitle2" className="font-medium mb-2">
                Metas específicas:
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tipo de Resíduo</TableCell>
                      <TableCell align="right">Progresso</TableCell>
                      <TableCell align="right">Meta</TableCell>
                      <TableCell align="right">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {desafio.wasteProgress.map((progress, index) => {
                      const porcentagemItem = calcularPorcentagem(
                        progress.currentQuantity || 0, 
                        progress.targetQuantity || 1
                      )
                      return (
                        <TableRow key={index}>
                          <TableCell>{progress.wasteType?.type || 'Resíduo'}</TableCell>
                          <TableCell align="right">{progress.currentQuantity}</TableCell>
                          <TableCell align="right">{progress.targetQuantity}</TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={porcentagemItem} 
                                  color={progress.completed ? "success" : "error"}
                                />
                              </Box>
                              <Box sx={{ minWidth: 35 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {`${Math.round(porcentagemItem)}%`}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </div>

        <div>
          <CircularProgressBar
            progresso={porcentagemGeral}
            total={100}
            isPercentage={true}
            color="error"
          />
          <Typography variant="body2" className="text-center text-red-700 mt-2">
            Tempo esgotado
          </Typography>
        </div>
      </div>
    </Paper>
  )
}

export default DesafioExpirado
