import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  LinearProgress, 
  Grid, 
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { formatarData, formatarNumero, calcularPorcentagem } from './utils/metasUtils';

const DesafiosAtivos = ({ desafiosAtivos, onRemover }) => {
  if (!desafiosAtivos || desafiosAtivos.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          Você não está participando de nenhum desafio no momento.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Explore os desafios disponíveis e participe para ganhar pontos!
        </Typography>
      </Box>
    );
  }

  // Formatar valor com unidade
  const formatarValorComUnidade = (valor, unidade) => {
    if (unidade === 'kg') {
      return `${formatarNumero(valor, 1)} ${unidade}`;
    }
    return `${formatarNumero(valor, 0)} ${unidade}`;
  };

  return (
    <Grid container spacing={3}>
      {desafiosAtivos.map((desafio) => (
        <Grid item xs={12} md={6} key={desafio.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {desafio.nome}
                </Typography>
                <Chip 
                  label={`${desafio.pontos} pontos`} 
                  color="primary" 
                  size="small" 
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                {desafio.descricao}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Período:</strong> {formatarData(desafio.dataInicio)} até {formatarData(desafio.dataTermino)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Status:</strong> {desafio.status === 'active' ? 'Ativo' : 
                                          desafio.status === 'completed' ? 'Concluído' : 
                                          desafio.status === 'expired' ? 'Expirado' : 'Inativo'}
                </Typography>
                {desafio.status === 'completed' && (
                  <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold', mt: 1 }}>
                    Parabéns! Você ganhou {desafio.pontosGanhos} pontos por completar este desafio!
                  </Typography>
                )}
              </Box>
              
              {/* Progresso por tipo de resíduo */}
              {desafio.wasteProgress && desafio.wasteProgress.length > 0 ? (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Progresso por tipo de resíduo:
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Tipo de Resíduo</TableCell>
                          <TableCell align="center">Progresso</TableCell>
                          <TableCell align="right">Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {desafio.wasteProgress.map((progress, index) => {
                          const porcentagemItem = calcularPorcentagem(
                            progress.currentQuantity || 0, 
                            progress.targetQuantity || 1
                          );
                          
                          // Determinar a unidade de medida
                          const unidade = progress.unit || 
                                         (progress.wasteType?.measurementUnit) || 
                                         (progress.wasteType?.type === 'weight' ? 'kg' : 'un');
                          
                          return (
                            <TableRow key={index}>
                              <TableCell>
                                {progress.wasteType?.type || 'Resíduo'}
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2">
                                  {formatarValorComUnidade(progress.currentQuantity, unidade)}/{formatarValorComUnidade(progress.targetQuantity, unidade)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box sx={{ width: '100%', mr: 1 }}>
                                    <LinearProgress 
                                      variant="determinate" 
                                      value={porcentagemItem} 
                                      color={progress.completed ? "success" : "primary"}
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
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Progresso geral:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={calcularPorcentagem(desafio.progresso, desafio.total)} 
                      />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                      <Typography variant="body2" color="text.secondary">
                        {`${Math.round(calcularPorcentagem(desafio.progresso, desafio.total))}%`}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" align="center">
                    {desafio.progresso} de {desafio.total} unidades
                  </Typography>
                </Box>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  color="error" 
                  startIcon={<DeleteIcon />}
                  onClick={() => onRemover(desafio.id)}
                  size="small"
                >
                  Remover
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default DesafiosAtivos;