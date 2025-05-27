import React from 'react'
import { Box, Typography, Button, Card, CardContent, CardActions, Divider, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const DesafiosDisponiveis = ({ desafiosDisponiveis, participarDesafio }) => {
  // Verificar se há desafios disponíveis para exibir
  const temDesafios = Array.isArray(desafiosDisponiveis) && desafiosDisponiveis.length > 0

  // Função para formatar a data
  const formatarData = (data) => {
    if (!data) return 'Data não definida'
    
    try {
      const dataObj = data instanceof Date ? data : new Date(data)
      if (isNaN(dataObj.getTime())) return 'Data inválida'
      return format(dataObj, 'dd/MM/yyyy', { locale: ptBR })
    } catch (error) {
      console.error('Erro ao formatar data:', error)
      return 'Data inválida'
    }
  }
  
  // Função para lidar com a participação no desafio
  const handleParticipar = (id) => {
    console.log('Participando do desafio com ID:', id);
    participarDesafio(id);
  };

  const formatarValor = (value, type) => {
    if (typeof value === 'object' && value.$numberDecimal) {
      value = parseFloat(value.$numberDecimal);
    }
    return type === 'weight' ? value.toFixed(1) : Math.round(value);
  };

  return (
    <Box sx={{ mt: 6, mb: 8 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
        Desafios Disponíveis
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      {temDesafios ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {desafiosDisponiveis.map((desafio) => (
            <Card key={desafio._id || desafio.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {desafio.title || desafio.nome}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {desafio.description || desafio.descricao}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Início:
                  </Typography>
                  <Typography variant="body2">
                    {formatarData(desafio.initialDate || desafio.dataInicio)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Término:
                  </Typography>
                  <Typography variant="body2">
                    {formatarData(desafio.validUntil || desafio.dataTermino)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Pontuação:
                  </Typography>
                  <Chip 
                    label={`${desafio.points || desafio.pontos} pontos`} 
                    color="primary" 
                    size="small" 
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                {/* Metas específicas */}
                {desafio.challenges && desafio.challenges.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Metas específicas:
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Tipo de Resíduo</TableCell>
                            <TableCell align="right">Meta</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {desafio.challenges.map((challenge, index) => {
                            const unit = challenge.type === 'weight' ? 'kg' : 'un';
                            const value = formatarValor(challenge.value, challenge.type);
                            
                            return (
                              <TableRow key={index}>
                                <TableCell>
                                  {challenge.waste?.type || 'Resíduo'}
                                </TableCell>
                                <TableCell align="right">
                                  {value} {unit}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </CardContent>
              
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  onClick={() => handleParticipar(desafio._id || desafio.id)}
                >
                  Participar
                </Button>
              </CardActions>
            </Card>
          ))}
        </div>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Não há novos desafios disponíveis no momento.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Volte mais tarde para verificar novos desafios.
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default DesafiosDisponiveis
